import { z } from "zod";

export const BreakConfigSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Break label is required"), // e.g. "Lunch" or "Short Break"
  afterPeriod: z.number().int().min(1), // After which period position the break sits
  durationMinutes: z.number().int().min(5).max(180),
});

export type BreakConfig = z.infer<typeof BreakConfigSchema>;

export const SetupWizardSchema = z.object({
  institutionName: z.string().min(2, "Institution name must be at least 2 characters"),
  academicYear: z.string().min(2, "Term or academic year label is required"),
  workingDays: z.array(z.number().int().min(1).max(7)).min(1, "Select at least 1 working day"),
  periodsPerDay: z.number().int().min(1).max(14),
  dayStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  defaultPeriodMinutes: z.number().int().min(15).max(180),
  breaks: z.array(BreakConfigSchema),
});

export type SetupWizardValues = z.infer<typeof SetupWizardSchema>;

export interface GeneratedPeriodSlot {
  position: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

/**
 * Calculates start and end times for all periods and breaks based on wizard inputs.
 */
export function generateDaySchedule(params: {
  dayStartTime: string;
  periodsPerDay: number;
  defaultPeriodMinutes: number;
  breaks: BreakConfig[];
}): GeneratedPeriodSlot[] {
  const { dayStartTime, periodsPerDay, defaultPeriodMinutes, breaks } = params;
  const slots: GeneratedPeriodSlot[] = [];

  const [startHour, startMin] = dayStartTime.split(":").map(Number);
  let currentMinutes = startHour * 60 + startMin;

  function toTimeString(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  // Sort breaks by afterPeriod
  const sortedBreaks = [...breaks].sort((a, b) => a.afterPeriod - b.afterPeriod);

  let periodCounter = 1;

  for (let p = 1; p <= periodsPerDay; p++) {
    const pStart = toTimeString(currentMinutes);
    currentMinutes += defaultPeriodMinutes;
    const pEnd = toTimeString(currentMinutes);

    slots.push({
      position: periodCounter++,
      label: `Period ${p}`,
      startTime: pStart,
      endTime: pEnd,
      isBreak: false,
    });

    // Check if any break is placed after this period
    const breaksAfter = sortedBreaks.filter((b) => b.afterPeriod === p);
    for (const b of breaksAfter) {
      const bStart = toTimeString(currentMinutes);
      currentMinutes += b.durationMinutes;
      const bEnd = toTimeString(currentMinutes);

      slots.push({
        position: periodCounter++,
        label: b.label,
        startTime: bStart,
        endTime: bEnd,
        isBreak: true,
      });
    }
  }

  return slots;
}

