"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- SUBJECTS ---

export async function getSubjects() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) return [];
    return await prisma.subject.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to query subjects:", err);
    return [];
  }
}

export async function upsertSubject(data: {
  id?: string;
  name: string;
  code: string;
  type: "THEORY" | "LAB";
  colour: string;
}) {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) throw new Error("No active workspace found.");

  if (data.id) {
    const updated = await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        colour: data.colour,
      },
    });
    revalidatePath("/subjects");
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return updated;
  }

  const created = await prisma.subject.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      code: data.code,
      type: data.type,
      colour: data.colour,
    },
  });
  revalidatePath("/subjects");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return created;
}

export async function deleteSubject(id: string) {
  // Cascades to allocations & entries
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/subjects");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return { success: true };
}

// --- TEACHERS ---

export async function getTeachers() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) return [];
    return await prisma.teacher.findMany({
      where: { workspaceId: workspace.id },
      include: {
        unavailability: true,
        allocations: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to query teachers:", err);
    return [];
  }
}

export async function upsertTeacher(data: {
  id?: string;
  name: string;
  code: string;
  maxPerDay: number;
  maxPerWeek: number;
  maxConsecutive: number;
  unavailability?: { day: number; periodPosition: number }[];
}) {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) throw new Error("No active workspace found.");

  return prisma.$transaction(async (tx) => {
    let teacher;
    if (data.id) {
      teacher = await tx.teacher.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          maxPerDay: data.maxPerDay,
          maxPerWeek: data.maxPerWeek,
          maxConsecutive: data.maxConsecutive,
        },
      });

      // Clear previous unavailabilities
      await tx.teacherUnavailability.deleteMany({
        where: { teacherId: data.id },
      });
    } else {
      teacher = await tx.teacher.create({
        data: {
          workspaceId: workspace.id,
          name: data.name,
          code: data.code,
          maxPerDay: data.maxPerDay,
          maxPerWeek: data.maxPerWeek,
          maxConsecutive: data.maxConsecutive,
        },
      });
    }

    // Insert updated unavailabilities
    if (data.unavailability && data.unavailability.length > 0) {
      await tx.teacherUnavailability.createMany({
        data: data.unavailability.map((u) => ({
          teacherId: teacher.id,
          day: u.day,
          periodPosition: u.periodPosition,
        })),
      });
    }

    revalidatePath("/teachers");
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return teacher;
  });
}

export async function deleteTeacher(id: string) {
  await prisma.teacher.delete({ where: { id } });
  revalidatePath("/teachers");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return { success: true };
}

// --- ROOMS ---

export async function getRooms() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) return [];
    return await prisma.room.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to query rooms:", err);
    return [];
  }
}

export async function upsertRoom(data: {
  id?: string;
  name: string;
  type: "CLASSROOM" | "LAB" | "OTHER";
  capacity: number;
}) {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) throw new Error("No active workspace found.");

  if (data.id) {
    const updated = await prisma.room.update({
      where: { id: data.id },
      data: {
        name: data.name,
        type: data.type,
        capacity: data.capacity,
      },
    });
    revalidatePath("/rooms");
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return updated;
  }

  const created = await prisma.room.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      type: data.type,
      capacity: data.capacity,
    },
  });
  revalidatePath("/rooms");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return created;
}

export async function deleteRoom(id: string) {
  await prisma.room.delete({ where: { id } });
  revalidatePath("/rooms");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return { success: true };
}

// --- CLASSES ---

export async function getClasses() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) return [];
    return await prisma.classGroup.findMany({
      where: { workspaceId: workspace.id },
      include: {
        homeRoom: true,
        allocations: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to query classes:", err);
    return [];
  }
}

export async function upsertClass(data: {
  id?: string;
  name: string;
  studentCount: number;
  homeRoomId?: string | null;
}) {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) throw new Error("No active workspace found.");

  if (data.id) {
    const updated = await prisma.classGroup.update({
      where: { id: data.id },
      data: {
        name: data.name,
        studentCount: data.studentCount,
        homeRoomId: data.homeRoomId || null,
      },
    });
    revalidatePath("/classes");
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return updated;
  }

  const created = await prisma.classGroup.create({
    data: {
      workspaceId: workspace.id,
      name: data.name,
      studentCount: data.studentCount,
      homeRoomId: data.homeRoomId || null,
    },
  });
  revalidatePath("/classes");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return created;
}

export async function deleteClass(id: string) {
  await prisma.classGroup.delete({ where: { id } });
  revalidatePath("/classes");
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return { success: true };
}

// --- ALLOCATIONS ---

export async function getAllocations() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) return [];
    return await prisma.allocation.findMany({
      where: {
        class: { workspaceId: workspace.id },
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
        entries: true,
      },
      orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
    });
  } catch (err) {
    console.error("Failed to query allocations:", err);
    return [];
  }
}

export async function upsertAllocation(data: {
  id?: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  blockSize: number;
  roomType: "CLASSROOM" | "LAB" | "OTHER";
  maxPerDay?: number | null;
}) {
  if (data.id) {
    const updated = await prisma.allocation.update({
      where: { id: data.id },
      data: {
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        periodsPerWeek: data.periodsPerWeek,
        blockSize: data.blockSize,
        roomType: data.roomType,
        maxPerDay: data.maxPerDay || null,
      },
    });
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return updated;
  }

  const created = await prisma.allocation.create({
    data: {
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      periodsPerWeek: data.periodsPerWeek,
      blockSize: data.blockSize,
      roomType: data.roomType,
      maxPerDay: data.maxPerDay || null,
    },
  });
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return created;
}

export async function deleteAllocation(id: string) {
  await prisma.allocation.delete({ where: { id } });
  revalidatePath("/allocations");
  revalidatePath("/builder");
  return { success: true };
}

