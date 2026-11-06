export interface AllocationTotals {
  classId: string;
  className: string;
  totalPeriodsRequired: number;
  availableWeeklySlots: number;
  isOverCapacity: boolean;
}

export interface TeacherWorkloadTotals {
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  allocatedPeriods: number;
  maxPerWeek: number;
  isOverAllocated: boolean;
}

/**
 * Pure function: Computes slot usage per class group.
 */
export function calculateClassSlotTotals(params: {
  classes: { id: string; name: string }[];
  allocations: { classId: string; periodsPerWeek: number }[];
  workingDaysCount: number;
  periodsPerDayCount: number;
}): AllocationTotals[] {
  const { classes, allocations, workingDaysCount, periodsPerDayCount } = params;
  const availableWeeklySlots = workingDaysCount * periodsPerDayCount;

  return classes.map((c) => {
    const totalPeriodsRequired = allocations
      .filter((a) => a.classId === c.id)
      .reduce((sum, a) => sum + a.periodsPerWeek, 0);

    return {
      classId: c.id,
      className: c.name,
      totalPeriodsRequired,
      availableWeeklySlots,
      isOverCapacity: totalPeriodsRequired > availableWeeklySlots,
    };
  });
}

/**
 * Pure function: Computes total workload per faculty member against max limits.
 */
export function calculateTeacherWorkloads(params: {
  teachers: { id: string; name: string; code: string; maxPerWeek: number }[];
  allocations: { teacherId: string; periodsPerWeek: number }[];
}): TeacherWorkloadTotals[] {
  const { teachers, allocations } = params;

  return teachers.map((t) => {
    const allocatedPeriods = allocations
      .filter((a) => a.teacherId === t.id)
      .reduce((sum, a) => sum + a.periodsPerWeek, 0);

    return {
      teacherId: t.id,
      teacherName: t.name,
      teacherCode: t.code,
      allocatedPeriods,
      maxPerWeek: t.maxPerWeek,
      isOverAllocated: allocatedPeriods > t.maxPerWeek,
    };
  });
}

