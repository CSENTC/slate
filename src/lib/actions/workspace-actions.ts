"use server";

import { prisma } from "@/lib/prisma";
import { SetupWizardValues, generateDaySchedule } from "@/lib/scheduling/setup-schema";
import { revalidatePath } from "next/cache";

/**
 * Returns the current workspace or null if none exists yet.
 */
export async function getWorkspace() {
  try {
    const workspace = await prisma.workspace.findFirst({
      include: {
        periods: {
          orderBy: { position: "asc" },
        },
      },
    });
    return workspace;
  } catch (error) {
    console.error("Failed to query workspace:", error);
    return null;
  }
}

/**
 * Saves or updates workspace settings and regenerates period records.
 */
export async function saveWorkspaceSettings(values: SetupWizardValues) {
  try {
    const periodSlots = generateDaySchedule({
      dayStartTime: values.dayStartTime,
      periodsPerDay: values.periodsPerDay,
      defaultPeriodMinutes: values.defaultPeriodMinutes,
      breaks: values.breaks,
    });

    // Check if workspace exists
    const existing = await prisma.workspace.findFirst();

    if (existing) {
      // Update existing workspace
      const updated = await prisma.$transaction(async (tx) => {
        // Delete previous periods
        await tx.period.deleteMany({
          where: { workspaceId: existing.id },
        });

        // Update workspace
        const ws = await tx.workspace.update({
          where: { id: existing.id },
          data: {
            name: values.institutionName,
            academicYear: values.academicYear,
            workingDays: values.workingDays,
            setupDone: true,
          },
        });

        // Insert regenerated periods
        await tx.period.createMany({
          data: periodSlots.map((slot) => ({
            workspaceId: ws.id,
            position: slot.position,
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBreak: slot.isBreak,
          })),
        });

        return ws;
      });

      revalidatePath("/settings");
      revalidatePath("/builder");
      revalidatePath("/dashboard");
      return { success: true, workspace: updated };
    } else {
      // Create new workspace
      const created = await prisma.$transaction(async (tx) => {
        const ws = await tx.workspace.create({
          data: {
            name: values.institutionName,
            academicYear: values.academicYear,
            workingDays: values.workingDays,
            setupDone: true,
          },
        });

        await tx.period.createMany({
          data: periodSlots.map((slot) => ({
            workspaceId: ws.id,
            position: slot.position,
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBreak: slot.isBreak,
          })),
        });

        return ws;
      });

      revalidatePath("/settings");
      revalidatePath("/builder");
      revalidatePath("/dashboard");
      return { success: true, workspace: created };
    }
  } catch (error: any) {
    console.error("Error saving workspace settings:", error);
    return { success: false, error: error.message || "Failed to save settings" };
  }
}

/**
 * Checks if shrinking periods/days will invalidate existing placed lessons.
 */
export async function checkSettingsImpact(params: {
  workingDays: number[];
  maxPeriods: number;
}) {
  try {
    const existing = await prisma.workspace.findFirst();
    if (!existing) return { affectedEntriesCount: 0, affectedLessons: [] };

    // Find entries that are outside the candidate workingDays or period threshold
    const entries = await prisma.entry.findMany({
      where: {
        allocation: {
          class: {
            workspaceId: existing.id,
          },
        },
      },
      include: {
        allocation: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          },
        },
      },
    });

    const affected = entries.filter((e) => {
      const dayInvalid = !params.workingDays.includes(e.day);
      const periodInvalid = e.startPeriod + e.length - 1 > params.maxPeriods;
      return dayInvalid || periodInvalid;
    });

    return {
      affectedEntriesCount: affected.length,
      affectedLessons: affected.map((a) => ({
        id: a.id,
        className: a.allocation.class.name,
        subjectName: a.allocation.subject.name,
        teacherName: a.allocation.teacher.name,
        day: a.day,
        startPeriod: a.startPeriod,
      })),
    };
  } catch (error) {
    console.error("Error checking settings impact:", error);
    return { affectedEntriesCount: 0, affectedLessons: [] };
  }
}

