/**
 * Phase 5: iCalendar (.ics) Export & ZIP Bundling
 * Generates RFC 5545 compatible .ics files for classes or teachers,
 * bundled into a ZIP file using JSZip.
 */

import type { PlacedLesson, SchedulePeriod } from "@/lib/scheduling/rules";
import { saveAs } from "./save-as";

export interface IcalExportOptions {
  workspaceName: string;
  academicYear: string;
  workingDays: number[];
  periods: SchedulePeriod[];
  lessons: PlacedLesson[];
  classes: { id: string; name: string; studentCount: number }[];
  teachers: { id: string; name: string; code: string }[];
  rooms: { id: string; name: string }[];
}

const DAY_MAP: Record<number, string> = {
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
  7: "SU",
};

/**
 * Format a reference term start date (e.g. next Monday) with specified HH:MM
 */
function formatIcsDateTime(dayOffset: number, timeStr?: string): string {
  // Use a fixed Monday baseline for recurring rules
  // 2026-09-07 is a Monday
  const baseYear = 2026;
  const baseMonth = 9; // Sept
  const baseDay = 7 + (dayOffset - 1);

  const [hh, mm] = timeStr ? timeStr.split(":").map(Number) : [9, 0];
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${baseYear}${pad(baseMonth)}${pad(baseDay)}T${pad(hh)}${pad(mm)}00`;
}

function generateIcsForLessons(
  title: string,
  lessons: PlacedLesson[],
  periods: SchedulePeriod[],
  rooms: { id: string; name: string }[]
): string {
  const periodMap = new Map(periods.map((p) => [p.position, p]));
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Slate//Timetable Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${title}`,
    "X-WR-TIMEZONE:UTC",
  ];

  for (const lesson of lessons) {
    const startPeriod = periodMap.get(lesson.startPeriod);
    const endPeriodPos = lesson.startPeriod + lesson.length - 1;
    const endPeriod = periodMap.get(endPeriodPos);

    const startTime = startPeriod?.startTime || "09:00";
    const endTime = endPeriod?.endTime || "10:00";

    const dtStart = formatIcsDateTime(lesson.day, startTime);
    const dtEnd = formatIcsDateTime(lesson.day, endTime);
    const roomName = lesson.roomId ? roomMap.get(lesson.roomId) || "TBD" : "TBD";
    const dayCode = DAY_MAP[lesson.day] || "MO";

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:slate-${lesson.id}@timetables`);
    lines.push(`DTSTAMP:${formatIcsDateTime(1, "00:00")}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`);
    lines.push(`SUMMARY:${lesson.subjectName} (${lesson.className})`);
    lines.push(
      `DESCRIPTION:Subject: ${lesson.subjectName}\\nClass: ${lesson.className}\\nFaculty: ${lesson.teacherName}\\nRoom: ${roomName}`
    );
    lines.push(`LOCATION:${roomName}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export async function exportTimetableIcsZip(
  options: IcalExportOptions
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const {
    workspaceName,
    academicYear,
    periods,
    lessons,
    classes,
    teachers,
    rooms,
  } = options;

  // 1. By Class calendars folder
  const classFolder = zip.folder("classes");
  for (const cls of classes) {
    const classLessons = lessons.filter((l) => l.classId === cls.id);
    const icsContent = generateIcsForLessons(
      `${cls.name} - ${workspaceName}`,
      classLessons,
      periods,
      rooms
    );
    classFolder?.file(`${cls.name.replace(/\s+/g, "_")}.ics`, icsContent);
  }

  // 2. By Faculty calendars folder
  const facultyFolder = zip.folder("faculty");
  for (const teacher of teachers) {
    const teacherLessons = lessons.filter((l) => l.teacherId === teacher.id);
    const icsContent = generateIcsForLessons(
      `${teacher.name} - ${workspaceName}`,
      teacherLessons,
      periods,
      rooms
    );
    facultyFolder?.file(
      `${teacher.code || teacher.name.replace(/\s+/g, "_")}.ics`,
      icsContent
    );
  }

  // 3. Complete Master Calendar
  const masterContent = generateIcsForLessons(
    `All Classes - ${workspaceName}`,
    lessons,
    periods,
    rooms
  );
  zip.file("master_timetable.ics", masterContent);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(
    content,
    `timetable-ics-${workspaceName.replace(/\s+/g, "-").toLowerCase()}-${academicYear}.zip`
  );
}

