import { describe, it, expect } from "vitest";
import { generateDaySchedule, BreakConfig } from "./setup-schema";

describe("generateDaySchedule calculation", () => {
  it("calculates sequential periods with 0 breaks correctly", () => {
    const slots = generateDaySchedule({
      dayStartTime: "09:00",
      periodsPerDay: 4,
      defaultPeriodMinutes: 60,
      breaks: [],
    });

    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({
      position: 1,
      label: "Period 1",
      startTime: "09:00",
      endTime: "10:00",
      isBreak: false,
    });
    expect(slots[3]).toEqual({
      position: 4,
      label: "Period 4",
      startTime: "12:00",
      endTime: "13:00",
      isBreak: false,
    });
  });

  it("inserts lunch break accurately and shifts subsequent periods", () => {
    const breaks: BreakConfig[] = [
      { id: "b1", label: "Lunch", afterPeriod: 2, durationMinutes: 45 },
    ];

    const slots = generateDaySchedule({
      dayStartTime: "09:00",
      periodsPerDay: 3,
      defaultPeriodMinutes: 50,
      breaks,
    });

    // Period 1: 09:00 - 09:50
    // Period 2: 09:50 - 10:40
    // Lunch:    10:40 - 11:25
    // Period 3: 11:25 - 12:15
    expect(slots).toHaveLength(4);
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[0].endTime).toBe("09:50");

    expect(slots[1].startTime).toBe("09:50");
    expect(slots[1].endTime).toBe("10:40");

    expect(slots[2].isBreak).toBe(true);
    expect(slots[2].label).toBe("Lunch");
    expect(slots[2].startTime).toBe("10:40");
    expect(slots[2].endTime).toBe("11:25");

    expect(slots[3].isBreak).toBe(false);
    expect(slots[3].label).toBe("Period 3");
    expect(slots[3].startTime).toBe("11:25");
    expect(slots[3].endTime).toBe("12:15");
  });
});

