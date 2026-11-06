"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Loads a realistic engineering department demo dataset:
 * - 4 Classes: CSE-3A, CSE-3B, ECE-2A, MECH-4A
 * - 12 Teachers with calibrated capacities & unavailability slots
 * - 8 Rooms (6 classrooms, 2 labs)
 * - 10 Subjects (including 2 lab subjects with blockSize=2)
 * - Realistic allocations designed for a 5-day, 7-period schedule
 */
export async function loadDemoData() {
  const workspace = await prisma.workspace.findFirst({
    include: { periods: true },
  });

  if (!workspace) {
    throw new Error("Please complete the setup wizard first.");
  }

  return prisma.$transaction(async (tx) => {
    const wsId = workspace.id;

    // 1. Clear existing master data
    await tx.entry.deleteMany({
      where: { allocation: { class: { workspaceId: wsId } } },
    });
    await tx.allocation.deleteMany({
      where: { class: { workspaceId: wsId } },
    });
    await tx.classGroup.deleteMany({ where: { workspaceId: wsId } });
    await tx.room.deleteMany({ where: { workspaceId: wsId } });
    await tx.teacher.deleteMany({ where: { workspaceId: wsId } });
    await tx.subject.deleteMany({ where: { workspaceId: wsId } });

    // 2. Seed Subjects
    const subjects = await Promise.all([
      tx.subject.create({
        data: { workspaceId: wsId, name: "Data Structures & Algorithms", code: "CS201", type: "THEORY", colour: "#FF5A1F" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Algorithms Lab", code: "CS201L", type: "LAB", colour: "#EA580C" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Database Management Systems", code: "CS202", type: "THEORY", colour: "#2563EB" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Database Engineering Lab", code: "CS202L", type: "LAB", colour: "#1D4ED8" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Computer Networks", code: "CS301", type: "THEORY", colour: "#059669" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Operating Systems", code: "CS302", type: "THEORY", colour: "#7C3AED" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Discrete Mathematics", code: "MA201", type: "THEORY", colour: "#D97706" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Digital Signal Processing", code: "EC201", type: "THEORY", colour: "#0891B2" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Thermodynamics & Fluid Flow", code: "ME301", type: "THEORY", colour: "#475569" },
      }),
      tx.subject.create({
        data: { workspaceId: wsId, name: "Engineering Economics", code: "HS101", type: "THEORY", colour: "#DB2777" },
      }),
    ]);

    // 3. Seed Rooms
    const rooms = await Promise.all([
      tx.room.create({ data: { workspaceId: wsId, name: "Hall 101", type: "CLASSROOM", capacity: 60 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Hall 102", type: "CLASSROOM", capacity: 60 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Room 201", type: "CLASSROOM", capacity: 45 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Room 202", type: "CLASSROOM", capacity: 45 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Seminar Room A", type: "CLASSROOM", capacity: 40 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Seminar Room B", type: "CLASSROOM", capacity: 40 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Software Lab 1", type: "LAB", capacity: 35 } }),
      tx.room.create({ data: { workspaceId: wsId, name: "Hardware & Networks Lab", type: "LAB", capacity: 35 } }),
    ]);

    // 4. Seed Classes
    const classes = await Promise.all([
      tx.classGroup.create({ data: { workspaceId: wsId, name: "CSE-3A", studentCount: 40, homeRoomId: rooms[0].id } }),
      tx.classGroup.create({ data: { workspaceId: wsId, name: "CSE-3B", studentCount: 38, homeRoomId: rooms[1].id } }),
      tx.classGroup.create({ data: { workspaceId: wsId, name: "ECE-2A", studentCount: 35, homeRoomId: rooms[2].id } }),
      tx.classGroup.create({ data: { workspaceId: wsId, name: "MECH-4A", studentCount: 32, homeRoomId: rooms[3].id } }),
    ]);

    // 5. Seed Teachers
    const teachers = await Promise.all([
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Vikram Rao",
          code: "VR",
          maxPerDay: 4,
          maxPerWeek: 16,
          maxConsecutive: 2,
          unavailability: {
            create: [
              { day: 1, periodPosition: 1 }, // Unavailable Mon 1st period
              { day: 5, periodPosition: 6 }, // Unavailable Fri afternoon
            ],
          },
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Sunita Sen",
          code: "SS",
          maxPerDay: 4,
          maxPerWeek: 15,
          maxConsecutive: 2,
          unavailability: {
            create: [{ day: 3, periodPosition: 2 }],
          },
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Ananya Gupta",
          code: "AG",
          maxPerDay: 4,
          maxPerWeek: 16,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Rajesh Sharma",
          code: "RS",
          maxPerDay: 3,
          maxPerWeek: 12,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Meera Iyer",
          code: "MI",
          maxPerDay: 4,
          maxPerWeek: 14,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Kabir Patel",
          code: "KP",
          maxPerDay: 4,
          maxPerWeek: 14,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Farah Khan",
          code: "FK",
          maxPerDay: 3,
          maxPerWeek: 12,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Devendra Joshi",
          code: "DJ",
          maxPerDay: 4,
          maxPerWeek: 15,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Neha Verma",
          code: "NV",
          maxPerDay: 4,
          maxPerWeek: 14,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Alok Nair",
          code: "AN",
          maxPerDay: 3,
          maxPerWeek: 12,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Dr. Pooja Reddy",
          code: "PR",
          maxPerDay: 4,
          maxPerWeek: 14,
          maxConsecutive: 2,
        },
      }),
      tx.teacher.create({
        data: {
          workspaceId: wsId,
          name: "Prof. Rohan Banerjee",
          code: "RB",
          maxPerDay: 3,
          maxPerWeek: 10,
          maxConsecutive: 2,
        },
      }),
    ]);

    // 6. Seed Allocations
    // Helper maps
    const sub = (code: string) => subjects.find((s) => s.code === code)!.id;
    const tea = (code: string) => teachers.find((t) => t.code === code)!.id;

    // CSE-3A Allocations (Total 24 periods)
    await tx.allocation.createMany({
      data: [
        { classId: classes[0].id, subjectId: sub("CS201"), teacherId: tea("VR"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("CS201L"), teacherId: tea("VR"), periodsPerWeek: 2, blockSize: 2, roomType: "LAB", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("CS202"), teacherId: tea("SS"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("CS202L"), teacherId: tea("SS"), periodsPerWeek: 2, blockSize: 2, roomType: "LAB", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("CS301"), teacherId: tea("AG"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("CS302"), teacherId: tea("RS"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[0].id, subjectId: sub("MA201"), teacherId: tea("MI"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
      ],
    });

    // CSE-3B Allocations (Total 24 periods)
    await tx.allocation.createMany({
      data: [
        { classId: classes[1].id, subjectId: sub("CS201"), teacherId: tea("KP"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("CS201L"), teacherId: tea("KP"), periodsPerWeek: 2, blockSize: 2, roomType: "LAB", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("CS202"), teacherId: tea("FK"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("CS202L"), teacherId: tea("FK"), periodsPerWeek: 2, blockSize: 2, roomType: "LAB", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("CS301"), teacherId: tea("DJ"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("CS302"), teacherId: tea("NV"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[1].id, subjectId: sub("HS101"), teacherId: tea("AN"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
      ],
    });

    // ECE-2A Allocations (Total 20 periods)
    await tx.allocation.createMany({
      data: [
        { classId: classes[2].id, subjectId: sub("EC201"), teacherId: tea("PR"), periodsPerWeek: 5, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[2].id, subjectId: sub("CS201"), teacherId: tea("VR"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[2].id, subjectId: sub("MA201"), teacherId: tea("MI"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[2].id, subjectId: sub("CS301"), teacherId: tea("AG"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[2].id, subjectId: sub("HS101"), teacherId: tea("AN"), periodsPerWeek: 3, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
      ],
    });

    // MECH-4A Allocations (Total 18 periods)
    await tx.allocation.createMany({
      data: [
        { classId: classes[3].id, subjectId: sub("ME301"), teacherId: tea("RB"), periodsPerWeek: 5, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[3].id, subjectId: sub("MA201"), teacherId: tea("MI"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[3].id, subjectId: sub("HS101"), teacherId: tea("AN"), periodsPerWeek: 4, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
        { classId: classes[3].id, subjectId: sub("CS302"), teacherId: tea("RS"), periodsPerWeek: 5, blockSize: 1, roomType: "CLASSROOM", maxPerDay: 1 },
      ],
    });

    return { success: true };
  });
}

/**
 * Resets all master data and scheduled timetable entries cleanly.
 */
export async function clearAllMasterData() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) return { success: true };

  return prisma.$transaction(async (tx) => {
    const wsId = workspace.id;
    await tx.entry.deleteMany({
      where: { allocation: { class: { workspaceId: wsId } } },
    });
    await tx.allocation.deleteMany({
      where: { class: { workspaceId: wsId } },
    });
    await tx.classGroup.deleteMany({ where: { workspaceId: wsId } });
    await tx.room.deleteMany({ where: { workspaceId: wsId } });
    await tx.teacher.deleteMany({ where: { workspaceId: wsId } });
    await tx.subject.deleteMany({ where: { workspaceId: wsId } });

    revalidatePath("/subjects");
    revalidatePath("/teachers");
    revalidatePath("/rooms");
    revalidatePath("/classes");
    revalidatePath("/allocations");
    revalidatePath("/builder");
    return { success: true };
  });
}

