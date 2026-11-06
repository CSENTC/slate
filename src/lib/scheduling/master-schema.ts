import { z } from "zod";

// Curated palette for subjects matching the calm editorial aesthetic
export const SUBJECT_PALETTE = [
  "#FF5A1F", // Slate Accent Orange
  "#2563EB", // Royal Blue
  "#059669", // Emerald Green
  "#7C3AED", // Violet
  "#D97706", // Amber
  "#DB2777", // Rose
  "#0891B2", // Cyan
  "#4F46E5", // Indigo
  "#475569", // Slate Grey
  "#9333EA", // Purple
];

export const SubjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  code: z.string().min(2, "Subject code is required").max(10),
  type: z.enum(["THEORY", "LAB"]),
  colour: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

export const TeacherSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Teacher name must be at least 2 characters"),
  code: z.string().min(1, "Short code is required").max(6),
  maxPerDay: z.number().int().min(1).max(10),
  maxPerWeek: z.number().int().min(1).max(40),
  maxConsecutive: z.number().int().min(1).max(6),
  unavailability: z.array(
    z.object({
      day: z.number().int().min(1).max(7),
      periodPosition: z.number().int().min(1),
    })
  ).default([]),
});

export const RoomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Room name is required"),
  type: z.enum(["CLASSROOM", "LAB", "OTHER"]),
  capacity: z.number().int().min(1).max(500),
});

export const ClassGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Class name is required"),
  studentCount: z.number().int().min(1).max(500),
  homeRoomId: z.string().optional().nullable(),
});

export const AllocationSchema = z.object({
  id: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  periodsPerWeek: z.number().int().min(1).max(30),
  blockSize: z.number().int().min(1).max(4).default(1),
  roomType: z.enum(["CLASSROOM", "LAB", "OTHER"]).default("CLASSROOM"),
  maxPerDay: z.number().int().min(1).max(4).optional().nullable(),
});

