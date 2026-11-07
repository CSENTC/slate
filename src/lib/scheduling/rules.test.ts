import { describe, it, expect } from "vitest";
import {
  auditSchedule,
  checkPlacementViability,
  getOccupiedPeriods,
  validateBoundsAndBreaks,
  PlacedLesson,
  TeacherConstraint,
  RoomConstraint,
  ClassConstraint,
  SchedulePeriod,
} from "./rules";

describe("Scheduling Rules & Clash Engine", () => {
  const periods: SchedulePeriod[] = [
    { position: 1, label: "P1", isBreak: false },
    { position: 2, label: "P2", isBreak: false },
    { position: 3, label: "Break", isBreak: true },
    { position: 4, label: "P3", isBreak: false },
    { position: 5, label: "P4", isBreak: false },
  ];

  const teachers: TeacherConstraint[] = [
    {
      id: "t1",
      name: "Dr. Alan Turing",
      code: "AT",
      maxPerDay: 2,
      maxPerWeek: 5,
      maxConsecutive: 1,
      unavailability: [{ day: 1, periodPosition: 1 }],
    },
    {
      id: "t2",
      name: "Prof. Ada Lovelace",
      code: "AL",
      maxPerDay: 4,
      maxPerWeek: 10,
      maxConsecutive: 3,
      unavailability: [],
    },
  ];

  const rooms: RoomConstraint[] = [
    { id: "r1", name: "Room 101", type: "CLASSROOM", capacity: 30 },
    { id: "r2", name: "Lab A", type: "LAB", capacity: 20 },
  ];

  const classes: ClassConstraint[] = [
    { id: "c1", name: "CS-1A", studentCount: 25 },
    { id: "c2", name: "CS-1B", studentCount: 15 },
  ];

  it("calculates occupied period indices for single and double blocks", () => {
    expect(getOccupiedPeriods(1, 1)).toEqual([1]);
    expect(getOccupiedPeriods(2, 2)).toEqual([2, 3]);
    expect(getOccupiedPeriods(4, 2)).toEqual([4, 5]);
  });

  it("flags placement overlapping with breaks or out of bounds", () => {
    // Overlapping break position 3
    const breakIssues = validateBoundsAndBreaks(1, 2, 2, periods); // spans 2 and 3
    expect(breakIssues.length).toBe(1);
    expect(breakIssues[0].code).toBe("OVERLAPS_BREAK");
    expect(breakIssues[0].severity).toBe("HARD");

    // Out of bounds (starts at 5 with length 2 -> pos 5 and 6)
    const oobIssues = validateBoundsAndBreaks(1, 5, 2, periods);
    expect(oobIssues.some((i) => i.code === "OUT_OF_BOUNDS")).toBe(true);
  });

  it("detects teacher double booking (HARD conflict)", () => {
    const lessons: PlacedLesson[] = [
      {
        id: "l1",
        allocationId: "a1",
        classId: "c1",
        className: "CS-1A",
        subjectId: "s1",
        subjectName: "Math",
        subjectCode: "MTH",
        subjectColour: "#FF5A1F",
        teacherId: "t1",
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r1",
        day: 1,
        startPeriod: 2,
        length: 1,
      },
      {
        id: "l2",
        allocationId: "a2",
        classId: "c2",
        className: "CS-1B",
        subjectId: "s2",
        subjectName: "Physics",
        subjectCode: "PHY",
        subjectColour: "#000000",
        teacherId: "t1", // Same teacher
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r2",
        day: 1,
        startPeriod: 2, // Same day & period
        length: 1,
      },
    ];

    const issues = auditSchedule(lessons, teachers, rooms, classes, periods);
    const teacherDouble = issues.find((i) => i.code === "TEACHER_DOUBLE_BOOKED");
    expect(teacherDouble).toBeDefined();
    expect(teacherDouble?.severity).toBe("HARD");
    expect(teacherDouble?.affectedTeacherId).toBe("t1");
  });

  it("detects room double booking (HARD conflict)", () => {
    const lessons: PlacedLesson[] = [
      {
        id: "l1",
        allocationId: "a1",
        classId: "c1",
        className: "CS-1A",
        subjectId: "s1",
        subjectName: "Math",
        subjectCode: "MTH",
        subjectColour: "#FF5A1F",
        teacherId: "t1",
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r1", // Room 101
        day: 2,
        startPeriod: 4,
        length: 1,
      },
      {
        id: "l2",
        allocationId: "a2",
        classId: "c2",
        className: "CS-1B",
        subjectId: "s2",
        subjectName: "Physics",
        subjectCode: "PHY",
        subjectColour: "#000000",
        teacherId: "t2",
        teacherName: "Prof. Lovelace",
        teacherCode: "AL",
        roomId: "r1", // Same Room 101
        day: 2,
        startPeriod: 4, // Same slot
        length: 1,
      },
    ];

    const issues = auditSchedule(lessons, teachers, rooms, classes, periods);
    const roomDouble = issues.find((i) => i.code === "ROOM_DOUBLE_BOOKED");
    expect(roomDouble).toBeDefined();
    expect(roomDouble?.severity).toBe("HARD");
    expect(roomDouble?.affectedRoomId).toBe("r1");
  });

  it("detects teacher unavailability (HARD conflict)", () => {
    const lessons: PlacedLesson[] = [
      {
        id: "l1",
        allocationId: "a1",
        classId: "c1",
        className: "CS-1A",
        subjectId: "s1",
        subjectName: "Math",
        subjectCode: "MTH",
        subjectColour: "#FF5A1F",
        teacherId: "t1", // t1 is unavailable at Day 1, P1
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r1",
        day: 1,
        startPeriod: 1,
        length: 1,
      },
    ];

    const issues = auditSchedule(lessons, teachers, rooms, classes, periods);
    const unavail = issues.find((i) => i.code === "TEACHER_UNAVAILABLE");
    expect(unavail).toBeDefined();
    expect(unavail?.severity).toBe("HARD");
  });

  it("detects soft constraints: room capacity and teacher max per day", () => {
    const lessons: PlacedLesson[] = [
      // c1 has 25 students, assigned to r2 (capacity 20) -> capacity exceeded
      {
        id: "l1",
        allocationId: "a1",
        classId: "c1",
        className: "CS-1A",
        subjectId: "s1",
        subjectName: "Lab",
        subjectCode: "LAB",
        subjectColour: "#FF5A1F",
        teacherId: "t1",
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r2",
        day: 2,
        startPeriod: 1,
        length: 1,
      },
      // t1 has maxPerDay: 2. Adding 2 more periods on Day 2 makes 3 periods -> exceeds maxPerDay
      {
        id: "l2",
        allocationId: "a2",
        classId: "c2",
        className: "CS-1B",
        subjectId: "s2",
        subjectName: "Math",
        subjectCode: "MTH",
        subjectColour: "#FF5A1F",
        teacherId: "t1",
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r1",
        day: 2,
        startPeriod: 4,
        length: 2, // 2 periods: pos 4 and 5
      },
    ];

    const issues = auditSchedule(lessons, teachers, rooms, classes, periods);

    const capIssue = issues.find((i) => i.code === "ROOM_CAPACITY_EXCEEDED");
    expect(capIssue).toBeDefined();
    expect(capIssue?.severity).toBe("SOFT");

    const maxDayIssue = issues.find((i) => i.code === "TEACHER_MAX_DAY_EXCEEDED");
    expect(maxDayIssue).toBeDefined();
    expect(maxDayIssue?.severity).toBe("SOFT");
  });

  it("provides live viability preview (GREEN, AMBER, RED)", () => {
    const existing: PlacedLesson[] = [
      {
        id: "l1",
        allocationId: "a1",
        classId: "c1",
        className: "CS-1A",
        subjectId: "s1",
        subjectName: "Math",
        subjectCode: "MTH",
        subjectColour: "#FF5A1F",
        teacherId: "t1",
        teacherName: "Dr. Turing",
        teacherCode: "AT",
        roomId: "r1",
        day: 1,
        startPeriod: 2,
        length: 1,
      },
    ];

    // Candidate 1: Collides with existing teacher slot -> RED
    const redCheck = checkPlacementViability(
      {
        allocationId: "a2",
        classId: "c2",
        teacherId: "t1",
        day: 1,
        startPeriod: 2,
        length: 1,
      },
      existing,
      teachers,
      rooms,
      classes,
      periods
    );
    expect(redCheck.status).toBe("RED");

    // Candidate 2: Clear slot with clear constraints -> GREEN
    const greenCheck = checkPlacementViability(
      {
        allocationId: "a3",
        classId: "c2",
        teacherId: "t2",
        day: 1,
        startPeriod: 4,
        length: 1,
        roomId: "r1",
      },
      existing,
      teachers,
      rooms,
      classes,
      periods
    );
    expect(greenCheck.status).toBe("GREEN");

    // Candidate 3: Exceeds room capacity (c1 has 25 students, r2 capacity is 20) -> AMBER
    const amberCheck = checkPlacementViability(
      {
        allocationId: "a4",
        classId: "c1",
        teacherId: "t2",
        day: 2,
        startPeriod: 1,
        length: 1,
        roomId: "r2",
      },
      existing,
      teachers,
      rooms,
      classes,
      periods
    );
    expect(amberCheck.status).toBe("AMBER");
  });
});
