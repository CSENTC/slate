import { describe, it, expect } from "vitest";
import {
  calculateClassSlotTotals,
  calculateTeacherWorkloads,
} from "./master-calculations";

describe("calculateClassSlotTotals", () => {
  it("computes allocated periods and warns if exceeds available weekly slots", () => {
    const classes = [{ id: "c1", name: "CS-4A" }];
    const allocations = [
      { classId: "c1", periodsPerWeek: 15 },
      { classId: "c1", periodsPerWeek: 12 },
    ];

    // 5 days * 5 periods = 25 available slots
    const result = calculateClassSlotTotals({
      classes,
      allocations,
      workingDaysCount: 5,
      periodsPerDayCount: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].totalPeriodsRequired).toBe(27);
    expect(result[0].availableWeeklySlots).toBe(25);
    expect(result[0].isOverCapacity).toBe(true);
  });
});

describe("calculateTeacherWorkloads", () => {
  it("flags faculty members who exceed their weekly teaching quota", () => {
    const teachers = [
      { id: "t1", name: "Dr. Rao", code: "VR", maxPerWeek: 14 },
      { id: "t2", name: "Prof. Sen", code: "SS", maxPerWeek: 16 },
    ];
    const allocations = [
      { teacherId: "t1", periodsPerWeek: 16 },
      { teacherId: "t2", periodsPerWeek: 12 },
    ];

    const result = calculateTeacherWorkloads({ teachers, allocations });

    expect(result[0].isOverAllocated).toBe(true);
    expect(result[0].allocatedPeriods).toBe(16);
    expect(result[1].isOverAllocated).toBe(false);
    expect(result[1].allocatedPeriods).toBe(12);
  });
});

