"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SaveEntriesPayload {
  entries: {
    id?: string;
    allocationId: string;
    day: number;
    startPeriod: number;
    length: number;
    roomId?: string | null;
    locked?: boolean;
  }[];
}

/**
 * Loads the complete dataset needed to power the interactive builder:
 * Workspace, Periods, Classes, Teachers, Rooms, Allocations, and placed Entries.
 */
export async function getBuilderData() {
  const workspace = await prisma.workspace.findFirst({
    include: {
      periods: {
        orderBy: { position: "asc" },
      },
      classes: {
        include: {
          homeRoom: true,
        },
        orderBy: { name: "asc" },
      },
      teachers: {
        include: {
          unavailability: true,
        },
        orderBy: { name: "asc" },
      },
      rooms: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!workspace) {
    return null;
  }

  // Fetch all allocations with related subject, teacher, class details
  const allocations = await prisma.allocation.findMany({
    where: {
      class: { workspaceId: workspace.id },
    },
    include: {
      subject: true,
      teacher: true,
      class: true,
      entries: {
        include: {
          room: true,
        },
      },
    },
  });

  // Extract all currently placed entries
  const entries = allocations.flatMap((alloc) =>
    alloc.entries.map((entry) => ({
      id: entry.id,
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
      roomId: entry.roomId,
      roomName: entry.room?.name || null,
      day: entry.day,
      startPeriod: entry.startPeriod,
      length: entry.length,
      locked: entry.locked,
    }))
  );

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      academicYear: workspace.academicYear,
      workingDays: workspace.workingDays,
    },
    periods: workspace.periods.map((p) => ({
      id: p.id,
      position: p.position,
      label: p.label,
      startTime: p.startTime,
      endTime: p.endTime,
      isBreak: p.isBreak,
    })),
    classes: workspace.classes.map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: c.studentCount,
      homeRoomId: c.homeRoomId,
      homeRoomName: c.homeRoom?.name || null,
    })),
    teachers: workspace.teachers.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      maxPerDay: t.maxPerDay,
      maxPerWeek: t.maxPerWeek,
      maxConsecutive: t.maxConsecutive,
      unavailability: t.unavailability.map((u) => ({
        day: u.day,
        periodPosition: u.periodPosition,
      })),
    })),
    rooms: workspace.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      capacity: r.capacity,
    })),
    allocations: allocations.map((a) => ({
      id: a.id,
      classId: a.classId,
      subjectId: a.subjectId,
      teacherId: a.teacherId,
      periodsPerWeek: a.periodsPerWeek,
      blockSize: a.blockSize,
      roomType: a.roomType,
      maxPerDay: a.maxPerDay,
      subject: {
        id: a.subject.id,
        name: a.subject.name,
        code: a.subject.code,
        colour: a.subject.colour,
        type: a.subject.type,
      },
      teacher: {
        id: a.teacher.id,
        name: a.teacher.name,
        code: a.teacher.code,
      },
      class: {
        id: a.class.id,
        name: a.class.name,
        studentCount: a.class.studentCount,
      },
      placedCount: a.entries.reduce((acc, e) => acc + e.length, 0),
    })),
    entries,
  };
}

/**
 * Transaction-safe batch sync of all schedule entries.
 * Deletes removed entries and upserts new/updated entries.
 */
export async function syncScheduleEntries(payload: SaveEntriesPayload) {
  try {
    const workspace = await prisma.workspace.findFirst({
      select: { id: true },
    });

    if (!workspace) {
      throw new Error("No active workspace found");
    }

    // Run in a single transaction
    await prisma.$transaction(async (tx) => {
      // Find all allocation IDs belonging to this workspace
      const validAllocations = await tx.allocation.findMany({
        where: { class: { workspaceId: workspace.id } },
        select: { id: true },
      });
      const validAllocIds = new Set(validAllocations.map((a) => a.id));

      // Remove existing entries for this workspace
      await tx.entry.deleteMany({
        where: {
          allocationId: { in: Array.from(validAllocIds) },
        },
      });

      // Filter payload entries to only valid workspace allocations
      const entriesToCreate = payload.entries
        .filter((e) => validAllocIds.has(e.allocationId))
        .map((e) => ({
          allocationId: e.allocationId,
          day: e.day,
          startPeriod: e.startPeriod,
          length: e.length,
          roomId: e.roomId || null,
          locked: e.locked ?? false,
        }));

      if (entriesToCreate.length > 0) {
        await tx.entry.createMany({
          data: entriesToCreate,
        });
      }
    });

    revalidatePath("/builder");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to sync timetable entries:", err);
    return { success: false, error: err.message || "Failed to save timetable" };
  }
}

/**
 * Phase 4: Auto-generate a full timetable via the greedy + backtracking solver.
 * Preserves locked entries. Syncs the result to the database.
 */
export async function runAutoGenerate(): Promise<{
  success: boolean;
  placed: number;
  total: number;
  hardClashes: number;
  unplacedCount: number;
  unplacedDetails: { allocationId: string; reason: string }[];
  error?: string;
}> {
  try {
    const data = await getBuilderData();

    if (!data) {
      return {
        success: false,
        placed: 0,
        total: 0,
        hardClashes: 0,
        unplacedCount: 0,
        unplacedDetails: [],
        error: "No workspace found",
      };
    }

    const { generateTimetable } = await import("@/lib/scheduling/generate");

    // Build locked entries from existing placed lessons
    const lockedEntries = data.entries.filter((e) => e.locked);

    // Map allocations to AllocationMeta format
    const allocations = data.allocations.map((a) => ({
      id: a.id,
      classId: a.classId,
      className: a.class.name,
      subjectId: a.subjectId,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      subjectColour: a.subject.colour,
      subjectType: a.subject.type,
      teacherId: a.teacherId,
      teacherName: a.teacher.name,
      teacherCode: a.teacher.code,
      periodsPerWeek: a.periodsPerWeek,
      blockSize: a.blockSize,
      roomType: a.roomType,
      maxPerDay: a.maxPerDay,
    }));

    const result = generateTimetable({
      workingDays: data.workspace.workingDays,
      periods: data.periods,
      teachers: data.teachers,
      rooms: data.rooms,
      classes: data.classes,
      allocations,
      lockedEntries,
    });

    // Sync generated entries to DB
    await syncScheduleEntries({
      entries: result.entries.map((e) => ({
        allocationId: e.allocationId,
        day: e.day,
        startPeriod: e.startPeriod,
        length: e.length,
        roomId: e.roomId,
        locked: e.locked ?? false,
      })),
    });

    revalidatePath("/builder");
    revalidatePath("/dashboard");

    return {
      success: result.success,
      placed: result.stats.placed,
      total: result.stats.total,
      hardClashes: result.stats.hardClashes,
      unplacedCount: result.unplacedAllocations.length,
      unplacedDetails: result.unplacedAllocations,
    };
  } catch (err: any) {
    console.error("Auto-generate failed:", err);
    return {
      success: false,
      placed: 0,
      total: 0,
      hardClashes: 0,
      unplacedCount: 0,
      unplacedDetails: [],
      error: err.message || "Auto-generate failed",
    };
  }
}
