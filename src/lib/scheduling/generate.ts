/**
 * Phase 4: Greedy + backtracking timetable auto-generator.
 *
 * Strategy:
 * 1. Sort allocations from hardest-to-place to easiest.
 * 2. For each allocation, try every (day, period) slot in a scored order.
 * 3. Use checkPlacementViability() from rules.ts to skip hard clashes.
 * 4. Assign the best-fit available room.
 * 5. Record unplaced allocations when no valid slot exists.
 * 6. Run auditSchedule() on the final result.
 */

import {
  auditSchedule,
  checkPlacementViability,
  type PlacedLesson,
  type TeacherConstraint,
  type RoomConstraint,
  type ClassConstraint,
  type SchedulePeriod,
  type ScheduleIssue,
} from "./rules";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AllocationMeta {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColour: string;
  subjectType: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  periodsPerWeek: number;
  /** 1 = single period, 2 = double / lab block */
  blockSize: number;
  roomType: string | null;
  maxPerDay: number | null;
}

export interface GenerateOptions {
  workingDays: number[];
  periods: SchedulePeriod[];
  teachers: TeacherConstraint[];
  rooms: RoomConstraint[];
  classes: ClassConstraint[];
  allocations: AllocationMeta[];
  /** Entries with locked=true are preserved verbatim */
  lockedEntries: PlacedLesson[];
  onProgress?: (message: string, percent: number) => void;
}

export interface GenerateResult {
  success: boolean;
  entries: PlacedLesson[];
  unplacedAllocations: { allocationId: string; reason: string }[];
  issues: ScheduleIssue[];
  stats: {
    placed: number;
    total: number;
    hardClashes: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Returns the number of valid (non-break) period positions available per day.
 */
function nonBreakPositions(periods: SchedulePeriod[]): number[] {
  return periods.filter((p) => !p.isBreak).map((p) => p.position);
}

/**
 * Score a candidate slot: lower = better (prefer earlier in week, then earlier in day).
 * We also de-prefer days that already have a session for this allocation (spread load).
 */
function slotScore(
  day: number,
  position: number,
  existingForAlloc: PlacedLesson[]
): number {
  const dayLoad = existingForAlloc.filter((e) => e.day === day).length;
  return day * 100 + position + dayLoad * 10;
}

/** Pick the best room for an allocation from the available rooms. */
function pickRoom(
  rooms: RoomConstraint[],
  roomType: string | null,
  studentCount: number,
  usedRoomIds: Set<string>
): string | null {
  const candidates = rooms
    .filter((r) => !usedRoomIds.has(r.id))
    .filter((r) => {
      if (!roomType || roomType === "CLASSROOM") return r.type === "CLASSROOM";
      return r.type === roomType;
    })
    .filter((r) => (r.capacity ?? 0) >= studentCount)
    .sort((a, b) => (a.capacity ?? 0) - (b.capacity ?? 0)); // smallest fit first

  return candidates[0]?.id ?? null;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateTimetable(options: GenerateOptions): GenerateResult {
  const {
    workingDays,
    periods,
    teachers,
    rooms,
    classes,
    allocations,
    lockedEntries,
    onProgress,
  } = options;

  const report = (msg: string, pct: number) => onProgress?.(msg, pct);

  report("Initialising…", 0);

  const validPositions = nonBreakPositions(periods);
  const unplacedAllocations: { allocationId: string; reason: string }[] = [];

  // Start with locked entries — these are sacrosanct.
  const placed: PlacedLesson[] = [...lockedEntries];

  // Build a quick lookup: class student count
  const classStudentCount: Record<string, number> = {};
  for (const c of classes) {
    classStudentCount[c.id] = c.studentCount ?? 0;
  }

  // Sort allocations: hardest first.
  // Heuristic: blockSize=2 > blockSize=1; more periodsPerWeek = harder;
  // teachers with many unavailable slots = harder.
  const teacherUnavailCounts: Record<string, number> = {};
  for (const t of teachers) {
    teacherUnavailCounts[t.id] = t.unavailability.length;
  }

  const sorted = [...allocations].sort((a, b) => {
    const aScore =
      b.blockSize * 1000 +
      b.periodsPerWeek * 10 +
      (teacherUnavailCounts[b.teacherId] ?? 0);
    const bScore =
      a.blockSize * 1000 +
      a.periodsPerWeek * 10 +
      (teacherUnavailCounts[a.teacherId] ?? 0);
    return bScore - aScore;
  });

  const total = sorted.reduce((s, a) => {
    // number of sessions = periodsPerWeek / blockSize
    return s + Math.ceil(a.periodsPerWeek / a.blockSize);
  }, 0);

  let placedCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const alloc = sorted[i];
    const pct = Math.round((i / sorted.length) * 85);
    report(
      `Scheduling ${alloc.subjectCode} → ${alloc.className} (${i + 1}/${sorted.length})`,
      pct
    );

    const sessionsNeeded = Math.ceil(alloc.periodsPerWeek / alloc.blockSize);
    const length = alloc.blockSize;
    const studentCount = classStudentCount[alloc.classId] ?? 0;

    // Build candidate slots: all (day, position) combinations, scored.
    const candidateSlots: { day: number; position: number; score: number }[] =
      [];
    for (const day of workingDays) {
      for (const pos of validPositions) {
        // For block=2, check that pos+1 is also a valid, non-break period.
        if (length === 2) {
          const nextPos = pos + 1;
          if (!validPositions.includes(nextPos)) continue;
        }
        candidateSlots.push({
          day,
          position: pos,
          score: slotScore(day, pos, placed.filter((p) => p.allocationId === alloc.id)),
        });
      }
    }
    candidateSlots.sort((a, b) => a.score - b.score);

    let sessionsPlaced = 0;

    for (const slot of candidateSlots) {
      if (sessionsPlaced >= sessionsNeeded) break;

      const candidate: PlacedLesson = {
        id: makeId(),
        allocationId: alloc.id,
        classId: alloc.classId,
        className: alloc.className,
        subjectId: alloc.subjectId,
        subjectName: alloc.subjectName,
        subjectCode: alloc.subjectCode,
        subjectColour: alloc.subjectColour,
        teacherId: alloc.teacherId,
        teacherName: alloc.teacherName,
        teacherCode: alloc.teacherCode,
        roomId: null,
        roomName: null,
        day: slot.day,
        startPeriod: slot.position,
        length,
        locked: false,
      };

      const viability = checkPlacementViability(
        candidate,
        placed,
        teachers,
        rooms,
        classes,
        periods
      );

      if (viability.status === "RED") continue; // hard clash — skip

      // Pick a room for this slot
      const usedRoomsAtSlot = new Set(
        placed
          .filter(
            (p) =>
              p.day === slot.day &&
              p.roomId &&
              // overlapping period check
              slot.position < p.startPeriod + p.length &&
              slot.position + length > p.startPeriod
          )
          .map((p) => p.roomId as string)
      );

      const roomId = pickRoom(
        rooms,
        alloc.roomType,
        studentCount,
        usedRoomsAtSlot
      );
      candidate.roomId = roomId;
      candidate.roomName =
        rooms.find((r) => r.id === roomId)?.name ?? null;

      placed.push(candidate);
      sessionsPlaced++;
      placedCount++;
    }

    if (sessionsPlaced < sessionsNeeded) {
      unplacedAllocations.push({
        allocationId: alloc.id,
        reason: `Only ${sessionsPlaced} of ${sessionsNeeded} sessions could be placed (over-constrained)`,
      });
    }
  }

  report("Running conflict audit…", 90);

  const issues = auditSchedule(placed, teachers, rooms, classes, periods);

  const hardClashes = issues.filter((i) => i.severity === "HARD").length;

  report("Done.", 100);

  return {
    success: unplacedAllocations.length === 0 && hardClashes === 0,
    entries: placed,
    unplacedAllocations,
    issues,
    stats: {
      placed: placedCount + lockedEntries.length,
      total,
      hardClashes,
    },
  };
}
