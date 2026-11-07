/**
 * Pure scheduling rule types and clash detection engine.
 * No React or database dependencies. Pure computation.
 */

export type IssueSeverity = "HARD" | "SOFT";

export interface SchedulePeriod {
  position: number;
  label: string;
  startTime?: string;
  endTime?: string;
  isBreak: boolean;
}

export interface PlacedLesson {
  id: string; // Entry ID or temporary ID
  allocationId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColour: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  roomId?: string | null;
  roomName?: string | null;
  day: number; // 1 (Mon) .. 7 (Sun)
  startPeriod: number; // position 1..N
  length: number; // 1 or 2
  locked?: boolean;
}

export interface TeacherConstraint {
  id: string;
  name: string;
  code: string;
  maxPerDay: number;
  maxPerWeek: number;
  maxConsecutive: number;
  unavailability: { day: number; periodPosition: number }[];
}

export interface RoomConstraint {
  id: string;
  name: string;
  type: "CLASSROOM" | "LAB" | "OTHER";
  capacity: number;
}

export interface ClassConstraint {
  id: string;
  name: string;
  studentCount: number;
}

export interface ScheduleIssue {
  id: string;
  severity: IssueSeverity;
  code:
    | "TEACHER_DOUBLE_BOOKED"
    | "ROOM_DOUBLE_BOOKED"
    | "CLASS_DOUBLE_BOOKED"
    | "TEACHER_UNAVAILABLE"
    | "TEACHER_MAX_DAY_EXCEEDED"
    | "TEACHER_MAX_WEEK_EXCEEDED"
    | "TEACHER_CONSECUTIVE_EXCEEDED"
    | "ROOM_CAPACITY_EXCEEDED"
    | "OVERLAPS_BREAK"
    | "OUT_OF_BOUNDS";
  title: string;
  description: string;
  day?: number;
  periodPosition?: number;
  lessonIds: string[];
  affectedTeacherId?: string;
  affectedRoomId?: string;
  affectedClassId?: string;
}

/**
 * Returns all period positions occupied by a lesson.
 * E.g. startPeriod=2, length=2 -> [2, 3]
 */
export function getOccupiedPeriods(startPeriod: number, length: number): number[] {
  const periods: number[] = [];
  for (let i = 0; i < length; i++) {
    periods.push(startPeriod + i);
  }
  return periods;
}

/**
 * Checks if a candidate lesson placement overlaps with break periods or exceeds day boundaries.
 */
export function validateBoundsAndBreaks(
  day: number,
  startPeriod: number,
  length: number,
  periods: SchedulePeriod[]
): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];
  const occupied = getOccupiedPeriods(startPeriod, length);
  const maxPosition = Math.max(...periods.map((p) => p.position), 0);
  const periodMap = new Map(periods.map((p) => [p.position, p]));

  for (const pos of occupied) {
    if (pos > maxPosition || pos < 1) {
      issues.push({
        id: `out-of-bounds-${day}-${pos}`,
        severity: "HARD",
        code: "OUT_OF_BOUNDS",
        title: "Out of Bounds",
        description: `Lesson extends beyond the configured periods of the day.`,
        day,
        periodPosition: pos,
        lessonIds: [],
      });
      continue;
    }

    const p = periodMap.get(pos);
    if (p && p.isBreak) {
      issues.push({
        id: `break-overlap-${day}-${pos}`,
        severity: "HARD",
        code: "OVERLAPS_BREAK",
        title: "Overlaps Break",
        description: `Cannot schedule lessons during break "${p.label}".`,
        day,
        periodPosition: pos,
        lessonIds: [],
      });
    }
  }

  return issues;
}

/**
 * Detects all clashes and rule violations across the current timetable entries.
 */
export function auditSchedule(
  lessons: PlacedLesson[],
  teachers: TeacherConstraint[],
  rooms: RoomConstraint[],
  classes: ClassConstraint[],
  periods: SchedulePeriod[]
): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const periodMap = new Map(periods.map((p) => [p.position, p]));

  // 1. Break overlap & out of bounds per lesson
  for (const lesson of lessons) {
    const boundIssues = validateBoundsAndBreaks(
      lesson.day,
      lesson.startPeriod,
      lesson.length,
      periods
    );
    for (const b of boundIssues) {
      b.lessonIds = [lesson.id];
      issues.push(b);
    }
  }

  // 2. Hard Clashes: Double bookings at (day, periodPosition)
  // Maps to track occupancy: key = `${day}-${pos}`
  const teacherSlots = new Map<string, PlacedLesson[]>();
  const roomSlots = new Map<string, PlacedLesson[]>();
  const classSlots = new Map<string, PlacedLesson[]>();

  for (const lesson of lessons) {
    const occupied = getOccupiedPeriods(lesson.startPeriod, lesson.length);
    for (const pos of occupied) {
      const key = `${lesson.day}-${pos}`;

      // Teacher slot
      const tKey = `${lesson.teacherId}@${key}`;
      const tList = teacherSlots.get(tKey) || [];
      tList.push(lesson);
      teacherSlots.set(tKey, tList);

      // Room slot (if assigned)
      if (lesson.roomId) {
        const rKey = `${lesson.roomId}@${key}`;
        const rList = roomSlots.get(rKey) || [];
        rList.push(lesson);
        roomSlots.set(rKey, rList);
      }

      // Class slot
      const cKey = `${lesson.classId}@${key}`;
      const cList = classSlots.get(cKey) || [];
      cList.push(lesson);
      classSlots.set(cKey, cList);
    }
  }

  // Check Teacher double bookings
  for (const [key, list] of teacherSlots.entries()) {
    if (list.length > 1) {
      const [teacherId, slot] = key.split("@");
      const [dayStr, posStr] = slot.split("-");
      const day = Number(dayStr);
      const pos = Number(posStr);
      const teacher = teacherMap.get(teacherId);
      const tName = teacher ? teacher.name : "Teacher";

      issues.push({
        id: `teacher-double-${key}`,
        severity: "HARD",
        code: "TEACHER_DOUBLE_BOOKED",
        title: "Teacher Double-Booked",
        description: `${tName} is scheduled for multiple lessons simultaneously on Day ${day}, Period ${pos}.`,
        day,
        periodPosition: pos,
        lessonIds: list.map((l) => l.id),
        affectedTeacherId: teacherId,
      });
    }
  }

  // Check Room double bookings
  for (const [key, list] of roomSlots.entries()) {
    if (list.length > 1) {
      const [roomId, slot] = key.split("@");
      const [dayStr, posStr] = slot.split("-");
      const day = Number(dayStr);
      const pos = Number(posStr);
      const room = roomMap.get(roomId);
      const rName = room ? room.name : "Room";

      issues.push({
        id: `room-double-${key}`,
        severity: "HARD",
        code: "ROOM_DOUBLE_BOOKED",
        title: "Room Double-Booked",
        description: `Room ${rName} has multiple lessons booked at the same time on Day ${day}, Period ${pos}.`,
        day,
        periodPosition: pos,
        lessonIds: list.map((l) => l.id),
        affectedRoomId: roomId,
      });
    }
  }

  // Check Class double bookings
  for (const [key, list] of classSlots.entries()) {
    if (list.length > 1) {
      const [classId, slot] = key.split("@");
      const [dayStr, posStr] = slot.split("-");
      const day = Number(dayStr);
      const pos = Number(posStr);
      const cls = classMap.get(classId);
      const cName = cls ? cls.name : "Class";

      issues.push({
        id: `class-double-${key}`,
        severity: "HARD",
        code: "CLASS_DOUBLE_BOOKED",
        title: "Class Double-Booked",
        description: `Class ${cName} is assigned to multiple lessons at the same time on Day ${day}, Period ${pos}.`,
        day,
        periodPosition: pos,
        lessonIds: list.map((l) => l.id),
        affectedClassId: classId,
      });
    }
  }

  // 3. Teacher Unavailability (HARD)
  for (const lesson of lessons) {
    const teacher = teacherMap.get(lesson.teacherId);
    if (!teacher || !teacher.unavailability.length) continue;

    const unavailSet = new Set(
      teacher.unavailability.map((u) => `${u.day}-${u.periodPosition}`)
    );
    const occupied = getOccupiedPeriods(lesson.startPeriod, lesson.length);

    for (const pos of occupied) {
      if (unavailSet.has(`${lesson.day}-${pos}`)) {
        issues.push({
          id: `unavail-${lesson.id}-${lesson.day}-${pos}`,
          severity: "HARD",
          code: "TEACHER_UNAVAILABLE",
          title: "Teacher Unavailable",
          description: `${teacher.name} is marked unavailable on Day ${lesson.day}, Period ${pos}.`,
          day: lesson.day,
          periodPosition: pos,
          lessonIds: [lesson.id],
          affectedTeacherId: teacher.id,
        });
      }
    }
  }

  // 4. Room Capacity Constraint (SOFT)
  for (const lesson of lessons) {
    if (!lesson.roomId) continue;
    const room = roomMap.get(lesson.roomId);
    const cls = classMap.get(lesson.classId);
    if (room && cls && room.capacity < cls.studentCount) {
      issues.push({
        id: `capacity-${lesson.id}`,
        severity: "SOFT",
        code: "ROOM_CAPACITY_EXCEEDED",
        title: "Room Capacity Exceeded",
        description: `Class ${cls.name} has ${cls.studentCount} students, but room ${room.name} only holds ${room.capacity}.`,
        day: lesson.day,
        periodPosition: lesson.startPeriod,
        lessonIds: [lesson.id],
        affectedRoomId: room.id,
        affectedClassId: cls.id,
      });
    }
  }

  // 5. Teacher Workload Constraints (SOFT)
  // Group lessons by teacher
  const lessonsByTeacher = new Map<string, PlacedLesson[]>();
  for (const lesson of lessons) {
    const list = lessonsByTeacher.get(lesson.teacherId) || [];
    list.push(lesson);
    lessonsByTeacher.set(lesson.teacherId, list);
  }

  for (const [teacherId, teacherLessons] of lessonsByTeacher.entries()) {
    const teacher = teacherMap.get(teacherId);
    if (!teacher) continue;

    // Total weekly periods
    const totalWeeklyPeriods = teacherLessons.reduce((acc, l) => acc + l.length, 0);
    if (teacher.maxPerWeek > 0 && totalWeeklyPeriods > teacher.maxPerWeek) {
      issues.push({
        id: `teacher-max-week-${teacherId}`,
        severity: "SOFT",
        code: "TEACHER_MAX_WEEK_EXCEEDED",
        title: "Max Weekly Periods Exceeded",
        description: `${teacher.name} is assigned ${totalWeeklyPeriods} periods this week (max allowed is ${teacher.maxPerWeek}).`,
        lessonIds: teacherLessons.map((l) => l.id),
        affectedTeacherId: teacherId,
      });
    }

    // Daily breakdown for maxPerDay & maxConsecutive
    const lessonsByDay = new Map<number, PlacedLesson[]>();
    for (const l of teacherLessons) {
      const dList = lessonsByDay.get(l.day) || [];
      dList.push(l);
      lessonsByDay.set(l.day, dList);
    }

    for (const [day, dayLessons] of lessonsByDay.entries()) {
      const dailyPeriods = dayLessons.reduce((acc, l) => acc + l.length, 0);

      // Max per day
      if (teacher.maxPerDay > 0 && dailyPeriods > teacher.maxPerDay) {
        issues.push({
          id: `teacher-max-day-${teacherId}-${day}`,
          severity: "SOFT",
          code: "TEACHER_MAX_DAY_EXCEEDED",
          title: "Max Daily Periods Exceeded",
          description: `${teacher.name} has ${dailyPeriods} periods on Day ${day} (limit is ${teacher.maxPerDay}).`,
          day,
          lessonIds: dayLessons.map((l) => l.id),
          affectedTeacherId: teacherId,
        });
      }

      // Max consecutive periods
      if (teacher.maxConsecutive > 0) {
        // Collect all distinct active period positions for this teacher on this day (ignoring breaks)
        const occupiedSet = new Set<number>();
        for (const l of dayLessons) {
          for (const pos of getOccupiedPeriods(l.startPeriod, l.length)) {
            occupiedSet.add(pos);
          }
        }

        // Sort positions and detect contiguous streaks that are not interrupted by breaks
        // Note: periods are consecutive if pos[i+1] === pos[i] + 1
        const sortedPos = Array.from(occupiedSet).sort((a, b) => a - b);
        let currentStreak = 0;
        let prevPos: number | null = null;
        let maxConsecutiveFound = 0;

        for (const pos of sortedPos) {
          if (prevPos !== null && pos === prevPos + 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
          prevPos = pos;
          if (currentStreak > maxConsecutiveFound) {
            maxConsecutiveFound = currentStreak;
          }
        }

        if (maxConsecutiveFound > teacher.maxConsecutive) {
          issues.push({
            id: `teacher-consecutive-${teacherId}-${day}`,
            severity: "SOFT",
            code: "TEACHER_CONSECUTIVE_EXCEEDED",
            title: "Max Consecutive Periods Exceeded",
            description: `${teacher.name} has ${maxConsecutiveFound} consecutive periods on Day ${day} (limit is ${teacher.maxConsecutive}).`,
            day,
            lessonIds: dayLessons.map((l) => l.id),
            affectedTeacherId: teacherId,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Fast conflict preview for a single candidate placement (used for live drag tinting).
 * Returns:
 *  - "RED" if there is a hard conflict (teacher/room/class double-booked, unavailable, break overlap)
 *  - "AMBER" if there is a soft conflict (teacher quotas, room capacity)
 *  - "GREEN" if clear
 */
export function checkPlacementViability(
  candidate: {
    allocationId: string;
    classId: string;
    teacherId: string;
    roomId?: string | null;
    day: number;
    startPeriod: number;
    length: number;
  },
  existingLessons: PlacedLesson[],
  teachers: TeacherConstraint[],
  rooms: RoomConstraint[],
  classes: ClassConstraint[],
  periods: SchedulePeriod[]
): { status: "GREEN" | "AMBER" | "RED"; issues: ScheduleIssue[] } {
  // Synthesize candidate as a PlacedLesson
  const tempLesson: PlacedLesson = {
    id: "temp-candidate",
    allocationId: candidate.allocationId,
    classId: candidate.classId,
    className: classes.find((c) => c.id === candidate.classId)?.name || "",
    subjectId: "",
    subjectName: "",
    subjectCode: "",
    subjectColour: "",
    teacherId: candidate.teacherId,
    teacherName: teachers.find((t) => t.id === candidate.teacherId)?.name || "",
    teacherCode: teachers.find((t) => t.id === candidate.teacherId)?.code || "",
    roomId: candidate.roomId,
    roomName: rooms.find((r) => r.id === candidate.roomId)?.name || null,
    day: candidate.day,
    startPeriod: candidate.startPeriod,
    length: candidate.length,
  };

  const audit = auditSchedule(
    [...existingLessons, tempLesson],
    teachers,
    rooms,
    classes,
    periods
  );

  // Filter issues affecting the candidate
  const candidateIssues = audit.filter((i) => i.lessonIds.includes("temp-candidate"));

  const hasHard = candidateIssues.some((i) => i.severity === "HARD");
  if (hasHard) {
    return { status: "RED", issues: candidateIssues };
  }

  const hasSoft = candidateIssues.some((i) => i.severity === "SOFT");
  if (hasSoft) {
    return { status: "AMBER", issues: candidateIssues };
  }

  return { status: "GREEN", issues: [] };
}
