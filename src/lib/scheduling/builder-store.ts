import { create } from "zustand";
import {
  PlacedLesson,
  ScheduleIssue,
  SchedulePeriod,
  TeacherConstraint,
  RoomConstraint,
  ClassConstraint,
  auditSchedule,
  checkPlacementViability,
} from "@/lib/scheduling/rules";

export type ViewMode = "BY_CLASS" | "BY_TEACHER" | "BY_ROOM";
export type ValidationMode = "STRICT" | "WARN";

export interface AllocationWithMeta {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  blockSize: number;
  roomType: "CLASSROOM" | "LAB" | "OTHER";
  maxPerDay: number | null;
  subject: {
    id: string;
    name: string;
    code: string;
    colour: string;
    type: "THEORY" | "LAB";
  };
  teacher: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    studentCount: number;
  };
}

interface HistoryStep {
  lessons: PlacedLesson[];
}

interface BuilderState {
  // Static configuration loaded from DB
  periods: SchedulePeriod[];
  workingDays: number[];
  classes: ClassConstraint[];
  teachers: TeacherConstraint[];
  rooms: RoomConstraint[];
  allocations: AllocationWithMeta[];

  // Active UI View states
  viewMode: ViewMode;
  selectedEntityId: string | null; // ID of class, teacher, or room
  validationMode: ValidationMode; // STRICT prevents hard clash placement, WARN allows with alerts
  activeIssuesDrawer: boolean;
  highlightedCell: { day: number; periodPosition: number } | null;

  // Timetable placed lessons & issues
  lessons: PlacedLesson[];
  issues: ScheduleIssue[];

  // History for Undo / Redo
  past: HistoryStep[];
  future: HistoryStep[];

  // Save / Network state
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Active drag preview
  draggedAllocationId: string | null;
  draggedLessonId: string | null;

  // Actions
  initialize: (data: {
    periods: SchedulePeriod[];
    workingDays: number[];
    classes: ClassConstraint[];
    teachers: TeacherConstraint[];
    rooms: RoomConstraint[];
    allocations: AllocationWithMeta[];
    entries: PlacedLesson[];
  }) => void;

  setViewMode: (mode: ViewMode) => void;
  setSelectedEntityId: (id: string) => void;
  setValidationMode: (mode: ValidationMode) => void;
  toggleIssuesDrawer: () => void;
  setHighlightedCell: (cell: { day: number; periodPosition: number } | null) => void;

  // Lesson manipulation
  placeLesson: (params: {
    allocationId: string;
    day: number;
    startPeriod: number;
    roomId?: string | null;
  }) => { success: boolean; reason?: string };

  moveLesson: (params: {
    lessonId: string;
    day: number;
    startPeriod: number;
    roomId?: string | null;
  }) => { success: boolean; reason?: string };

  unplaceLesson: (lessonId: string) => void;
  toggleLockLesson: (lessonId: string) => void;

  undo: () => void;
  redo: () => void;

  setSaving: (isSaving: boolean) => void;
  markSaved: () => void;
  setDraggedAllocation: (allocId: string | null) => void;
  setDraggedLesson: (lessonId: string | null) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  periods: [],
  workingDays: [1, 2, 3, 4, 5],
  classes: [],
  teachers: [],
  rooms: [],
  allocations: [],

  viewMode: "BY_CLASS",
  selectedEntityId: null,
  validationMode: "STRICT",
  activeIssuesDrawer: false,
  highlightedCell: null,

  lessons: [],
  issues: [],

  past: [],
  future: [],

  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,

  draggedAllocationId: null,
  draggedLessonId: null,

  initialize: (data) => {
    const issues = auditSchedule(
      data.entries,
      data.teachers,
      data.rooms,
      data.classes,
      data.periods
    );

    // Default selected entity to first class if available
    const initialEntityId =
      data.classes.length > 0 ? data.classes[0].id : null;

    set({
      periods: data.periods,
      workingDays: data.workingDays,
      classes: data.classes,
      teachers: data.teachers,
      rooms: data.rooms,
      allocations: data.allocations,
      lessons: data.entries,
      issues,
      selectedEntityId: initialEntityId,
      past: [],
      future: [],
      hasUnsavedChanges: false,
    });
  },

  setViewMode: (viewMode) => {
    const { classes, teachers, rooms, selectedEntityId } = get();
    let newSelectedId = selectedEntityId;

    if (viewMode === "BY_CLASS") {
      if (!classes.some((c) => c.id === selectedEntityId)) {
        newSelectedId = classes[0]?.id || null;
      }
    } else if (viewMode === "BY_TEACHER") {
      if (!teachers.some((t) => t.id === selectedEntityId)) {
        newSelectedId = teachers[0]?.id || null;
      }
    } else if (viewMode === "BY_ROOM") {
      if (!rooms.some((r) => r.id === selectedEntityId)) {
        newSelectedId = rooms[0]?.id || null;
      }
    }

    set({ viewMode, selectedEntityId: newSelectedId });
  },

  setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
  setValidationMode: (validationMode) => set({ validationMode }),
  toggleIssuesDrawer: () =>
    set((state) => ({ activeIssuesDrawer: !state.activeIssuesDrawer })),
  setHighlightedCell: (highlightedCell) => set({ highlightedCell }),

  placeLesson: ({ allocationId, day, startPeriod, roomId }) => {
    const {
      allocations,
      lessons,
      teachers,
      rooms,
      classes,
      periods,
      validationMode,
      past,
    } = get();

    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) return { success: false, reason: "Allocation not found" };

    // Check bounds & breaks
    const bounds = checkPlacementViability(
      {
        allocationId: alloc.id,
        classId: alloc.classId,
        teacherId: alloc.teacherId,
        roomId: roomId ?? null,
        day,
        startPeriod,
        length: alloc.blockSize,
      },
      lessons,
      teachers,
      rooms,
      classes,
      periods
    );

    if (validationMode === "STRICT" && bounds.status === "RED") {
      return {
        success: false,
        reason: bounds.issues[0]?.description || "Strict mode prevented clash",
      };
    }

    const newLesson: PlacedLesson = {
      id: `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      allocationId: alloc.id,
      classId: alloc.classId,
      className: alloc.class.name,
      subjectId: alloc.subjectId,
      subjectName: alloc.subject.name,
      subjectCode: alloc.subject.code,
      subjectColour: alloc.subject.colour,
      teacherId: alloc.teacherId,
      teacherName: alloc.teacher.name,
      teacherCode: alloc.teacher.code,
      roomId: roomId ?? null,
      roomName: rooms.find((r) => r.id === roomId)?.name ?? null,
      day,
      startPeriod,
      length: alloc.blockSize,
      locked: false,
    };

    const nextLessons = [...lessons, newLesson];
    const newIssues = auditSchedule(
      nextLessons,
      teachers,
      rooms,
      classes,
      periods
    );

    set({
      past: [...past, { lessons }],
      future: [],
      lessons: nextLessons,
      issues: newIssues,
      hasUnsavedChanges: true,
    });

    return { success: true };
  },

  moveLesson: ({ lessonId, day, startPeriod, roomId }) => {
    const {
      lessons,
      teachers,
      rooms,
      classes,
      periods,
      validationMode,
      past,
    } = get();

    const existing = lessons.find((l) => l.id === lessonId);
    if (!existing) return { success: false, reason: "Lesson not found" };
    if (existing.locked) return { success: false, reason: "Lesson is locked" };

    const remainingLessons = lessons.filter((l) => l.id !== lessonId);

    const targetRoomId = roomId !== undefined ? roomId : existing.roomId;

    const bounds = checkPlacementViability(
      {
        allocationId: existing.allocationId,
        classId: existing.classId,
        teacherId: existing.teacherId,
        roomId: targetRoomId,
        day,
        startPeriod,
        length: existing.length,
      },
      remainingLessons,
      teachers,
      rooms,
      classes,
      periods
    );

    if (validationMode === "STRICT" && bounds.status === "RED") {
      return {
        success: false,
        reason: bounds.issues[0]?.description || "Strict mode prevented clash",
      };
    }

    const updatedLesson: PlacedLesson = {
      ...existing,
      day,
      startPeriod,
      roomId: targetRoomId,
      roomName: rooms.find((r) => r.id === targetRoomId)?.name ?? null,
    };

    const nextLessons = [...remainingLessons, updatedLesson];
    const newIssues = auditSchedule(
      nextLessons,
      teachers,
      rooms,
      classes,
      periods
    );

    set({
      past: [...past, { lessons }],
      future: [],
      lessons: nextLessons,
      issues: newIssues,
      hasUnsavedChanges: true,
    });

    return { success: true };
  },

  unplaceLesson: (lessonId) => {
    const { lessons, teachers, rooms, classes, periods, past } = get();
    const existing = lessons.find((l) => l.id === lessonId);
    if (!existing || existing.locked) return;

    const nextLessons = lessons.filter((l) => l.id !== lessonId);
    const newIssues = auditSchedule(
      nextLessons,
      teachers,
      rooms,
      classes,
      periods
    );

    set({
      past: [...past, { lessons }],
      future: [],
      lessons: nextLessons,
      issues: newIssues,
      hasUnsavedChanges: true,
    });
  },

  toggleLockLesson: (lessonId) => {
    const { lessons } = get();
    const nextLessons = lessons.map((l) =>
      l.id === lessonId ? { ...l, locked: !l.locked } : l
    );
    set({ lessons: nextLessons, hasUnsavedChanges: true });
  },

  undo: () => {
    const { past, lessons, future, teachers, rooms, classes, periods } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newIssues = auditSchedule(
      previous.lessons,
      teachers,
      rooms,
      classes,
      periods
    );

    set({
      past: newPast,
      future: [{ lessons }, ...future],
      lessons: previous.lessons,
      issues: newIssues,
      hasUnsavedChanges: true,
    });
  },

  redo: () => {
    const { future, lessons, past, teachers, rooms, classes, periods } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newIssues = auditSchedule(
      next.lessons,
      teachers,
      rooms,
      classes,
      periods
    );

    set({
      past: [...past, { lessons }],
      future: newFuture,
      lessons: next.lessons,
      issues: newIssues,
      hasUnsavedChanges: true,
    });
  },

  setSaving: (isSaving) => set({ isSaving }),
  markSaved: () =>
    set({
      hasUnsavedChanges: false,
      isSaving: false,
      lastSavedAt: new Date(),
    }),

  setDraggedAllocation: (draggedAllocationId) => set({ draggedAllocationId }),
  setDraggedLesson: (draggedLessonId) => set({ draggedLessonId }),
}));
