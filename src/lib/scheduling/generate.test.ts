import { describe, it, expect } from "vitest";
import { generateTimetable } from "./generate";
import type { AllocationMeta, GenerateOptions } from "./generate";
import type {
  TeacherConstraint,
  RoomConstraint,
  ClassConstraint,
  SchedulePeriod,
  PlacedLesson,
} from "./rules";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const PERIODS: SchedulePeriod[] = [
  { position: 1, label: "Period 1", isBreak: false, startTime: "09:00", endTime: "09:50" },
  { position: 2, label: "Period 2", isBreak: false, startTime: "10:00", endTime: "10:50" },
  { position: 3, label: "Break",    isBreak: true,  startTime: "11:00", endTime: "11:20" },
  { position: 4, label: "Period 3", isBreak: false, startTime: "11:20", endTime: "12:10" },
  { position: 5, label: "Period 4", isBreak: false, startTime: "12:10", endTime: "13:00" },
];

const WORKING_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

const TEACHER_A: TeacherConstraint = {
  id: "t1",
  name: "Alice",
  code: "ALI",
  maxPerDay: 4,
  maxPerWeek: 20,
  maxConsecutive: 3,
  unavailability: [],
};

const CLASS_A: ClassConstraint = {
  id: "c1",
  name: "10-A",
  studentCount: 30,
};

const ROOM_A: RoomConstraint = {
  id: "r1",
  name: "Room 101",
  type: "CLASSROOM",
  capacity: 40,
};

const ALLOC_A: AllocationMeta = {
  id: "a1",
  classId: "c1",
  className: "10-A",
  subjectId: "s1",
  subjectName: "Math",
  subjectCode: "MTH",
  subjectColour: "#6366f1",
  subjectType: "THEORY",
  teacherId: "t1",
  teacherName: "Alice",
  teacherCode: "ALI",
  periodsPerWeek: 4,
  blockSize: 1,
  roomType: "CLASSROOM",
  maxPerDay: null,
};

function makeOptions(
  allocations: AllocationMeta[],
  overrides: Partial<GenerateOptions> = {}
): GenerateOptions {
  return {
    workingDays: WORKING_DAYS,
    periods: PERIODS,
    teachers: [TEACHER_A],
    rooms: [ROOM_A],
    classes: [CLASS_A],
    allocations,
    lockedEntries: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateTimetable", () => {
  it("produces an empty result for zero allocations", () => {
    const result = generateTimetable(makeOptions([]));
    expect(result.entries).toHaveLength(0);
    expect(result.unplacedAllocations).toHaveLength(0);
    expect(result.stats.placed).toBe(0);
    expect(result.stats.total).toBe(0);
  });

  it("places all sessions for a single simple allocation", () => {
    const result = generateTimetable(makeOptions([ALLOC_A]));

    // 4 periods/week, blockSize=1 → 4 sessions
    const sessions = result.entries.filter((e) => e.allocationId === "a1");
    expect(sessions).toHaveLength(4);
    expect(result.unplacedAllocations).toHaveLength(0);
  });

  it("places a double-block (lab) allocation with consecutive periods", () => {
    const labAlloc: AllocationMeta = {
      ...ALLOC_A,
      id: "a2",
      periodsPerWeek: 2, // 1 double-block session
      blockSize: 2,
      roomType: "LAB",
    };

    const labRoom: RoomConstraint = {
      id: "r2",
      name: "Lab 1",
      type: "LAB",
      capacity: 35,
    };

    const result = generateTimetable(
      makeOptions([labAlloc], { rooms: [ROOM_A, labRoom] })
    );

    const sessions = result.entries.filter((e) => e.allocationId === "a2");
    expect(sessions).toHaveLength(1); // 1 double session
    expect(sessions[0].length).toBe(2);

    // Ensure it doesn't span a break (position 3)
    for (const s of sessions) {
      const positions = [s.startPeriod, s.startPeriod + 1];
      expect(positions).not.toContain(3); // 3 is a break
    }
  });

  it("respects teacher unavailability — avoids blocked slots", () => {
    const busyTeacher: TeacherConstraint = {
      ...TEACHER_A,
      // Unavailable Monday periods 1 & 2
      unavailability: [
        { day: 1, periodPosition: 1 },
        { day: 1, periodPosition: 2 },
      ],
    };

    const result = generateTimetable(
      makeOptions([ALLOC_A], { teachers: [busyTeacher] })
    );

    // No placed session should be on day=1, period 1 or 2
    for (const entry of result.entries) {
      if (entry.day === 1) {
        const positions = Array.from(
          { length: entry.length },
          (_, i) => entry.startPeriod + i
        );
        expect(positions).not.toContain(1);
        expect(positions).not.toContain(2);
      }
    }
  });

  it("preserves locked entries unchanged", () => {
    const locked: PlacedLesson = {
      id: "locked-1",
      allocationId: "a1",
      classId: "c1",
      className: "10-A",
      subjectId: "s1",
      subjectName: "Math",
      subjectCode: "MTH",
      subjectColour: "#6366f1",
      teacherId: "t1",
      teacherName: "Alice",
      teacherCode: "ALI",
      roomId: "r1",
      roomName: "Room 101",
      day: 3,
      startPeriod: 1,
      length: 1,
      locked: true,
    };

    const result = generateTimetable(
      makeOptions([ALLOC_A], { lockedEntries: [locked] })
    );

    // The locked entry must be in the result unchanged
    const found = result.entries.find((e) => e.id === "locked-1");
    expect(found).toBeDefined();
    expect(found?.day).toBe(3);
    expect(found?.startPeriod).toBe(1);
    expect(found?.locked).toBe(true);
  });

  it("records unplaced allocation when schedule is over-constrained", () => {
    // 20 teachers all unavailable every slot except 1 per week
    // but all 20 allocations fight for those same few slots
    const tinyPeriods: SchedulePeriod[] = [
      { position: 1, label: "P1", isBreak: false },
    ];
    const oneDayWork = [1]; // only Monday

    // 2 allocations, same teacher, same class — only 1 slot available
    const a1: AllocationMeta = { ...ALLOC_A, id: "aA", periodsPerWeek: 1, blockSize: 1 };
    const a2: AllocationMeta = {
      ...ALLOC_A,
      id: "aB",
      periodsPerWeek: 1,
      blockSize: 1,
      subjectId: "s2",
      subjectName: "English",
      subjectCode: "ENG",
    };

    const result = generateTimetable({
      workingDays: oneDayWork,
      periods: tinyPeriods,
      teachers: [TEACHER_A],
      rooms: [ROOM_A],
      classes: [CLASS_A],
      allocations: [a1, a2],
      lockedEntries: [],
    });

    // Both compete for the same 1 slot + same class → one must be unplaced
    expect(result.unplacedAllocations.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onProgress at least at start and end", () => {
    const messages: string[] = [];
    generateTimetable(
      makeOptions([ALLOC_A], {
        onProgress: (msg) => messages.push(msg),
      })
    );
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[0]).toMatch(/Initialising/i);
    expect(messages[messages.length - 1]).toMatch(/Done/i);
  });
});

