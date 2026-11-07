/**
 * Phase 5: Excel Export
 * Generates one worksheet per class using ExcelJS.
 * Runs on the client via dynamic import.
 */

import type { PlacedLesson, SchedulePeriod } from "@/lib/scheduling/rules";

export interface ExcelExportOptions {
  workspaceName: string;
  academicYear: string;
  workingDays: number[];
  periods: SchedulePeriod[];
  lessons: PlacedLesson[];
  classes: { id: string; name: string; studentCount: number }[];
  rooms: { id: string; name: string }[];
}

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ACCENT_HEX = "FF5A1F";
const INK_HEX = "121210";

function findLesson(
  lessons: PlacedLesson[],
  classId: string,
  day: number,
  position: number
): PlacedLesson | null {
  return (
    lessons.find(
      (l) =>
        l.classId === classId &&
        l.day === day &&
        position >= l.startPeriod &&
        position < l.startPeriod + l.length
    ) || null
  );
}

/** Lighten a hex colour for cell fills */
function lightenHex(hex: string, amount = 0.5): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "F4F2EC";
  const r = Math.min(255, Math.round(parseInt(result[1], 16) + (255 - parseInt(result[1], 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(result[2], 16) + (255 - parseInt(result[2], 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(result[3], 16) + (255 - parseInt(result[3], 16)) * amount));
  return [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function exportTimetableExcel(options: ExcelExportOptions): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const { saveAs } = await import("./save-as");

  const {
    workspaceName,
    academicYear,
    workingDays,
    periods,
    lessons,
    classes,
    rooms,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Slate Timetable";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const teachingPeriods = periods.filter((p) => !p.isBreak);

  for (const cls of classes) {
    const sheet = workbook.addWorksheet(`Class ${cls.name}`, {
      pageSetup: {
        paperSize: 9, // A4
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });

    // ── Column widths ────────────────────────────────────────────────────────
    sheet.columns = [
      { header: "", key: "period", width: 12 },
      { header: "", key: "time", width: 14 },
      ...workingDays.map((d) => ({
        header: "",
        key: `day_${d}`,
        width: 22,
      })),
    ];

    // ── Title rows ───────────────────────────────────────────────────────────
    const titleRow = sheet.addRow([`Slate · ${workspaceName} — ${academicYear}`]);
    sheet.mergeCells(titleRow.number, 1, titleRow.number, 2 + workingDays.length);
    titleRow.height = 20;
    titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: `FF${INK_HEX}` } };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${ACCENT_HEX}` },
    };
    titleRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    const classRow = sheet.addRow([`Class ${cls.name}  (${cls.studentCount} students)`]);
    sheet.mergeCells(classRow.number, 1, classRow.number, 2 + workingDays.length);
    classRow.height = 16;
    classRow.getCell(1).font = { bold: true, size: 10, color: { argb: `FF${INK_HEX}` } };
    classRow.getCell(1).alignment = { vertical: "middle", indent: 1 };

    sheet.addRow([]); // spacer

    // ── Header row ───────────────────────────────────────────────────────────
    const headerRow = sheet.addRow([
      "Period",
      "Time",
      ...workingDays.map((d) => DAY_NAMES[d]),
    ]);
    headerRow.height = 16;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${INK_HEX}` },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF444440" } },
      };
    });

    // ── Data rows ────────────────────────────────────────────────────────────
    for (const period of periods) {
      if (period.isBreak) {
        const breakRow = sheet.addRow([period.label, "", ...workingDays.map(() => "")]);
        sheet.mergeCells(
          breakRow.number,
          1,
          breakRow.number,
          2 + workingDays.length
        );
        breakRow.height = 10;
        breakRow.getCell(1).font = {
          italic: true,
          size: 7.5,
          color: { argb: "FF78716C" },
        };
        breakRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F2EC" },
        };
        breakRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        continue;
      }

      const timeStr =
        period.startTime && period.endTime
          ? `${period.startTime}–${period.endTime}`
          : `P${period.position}`;

      const rowValues: (string)[] = [`P${period.position}`, timeStr];
      for (const day of workingDays) {
        const lesson = findLesson(lessons, cls.id, day, period.position);
        if (!lesson) {
          rowValues.push("");
        } else if (lesson.startPeriod !== period.position) {
          rowValues.push("↑ cont.");
        } else {
          const roomName = rooms.find((r) => r.id === lesson.roomId)?.name ?? "";
          rowValues.push(
            [
              lesson.subjectName,
              lesson.teacherName,
              roomName,
              lesson.length === 2 ? "(double period)" : "",
            ]
              .filter(Boolean)
              .join("\n")
          );
        }
      }

      const dataRow = sheet.addRow(rowValues);
      dataRow.height = 36;

      // Style period + time cells
      dataRow.getCell(1).font = { bold: true, size: 8 };
      dataRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8F6F0" },
      };
      dataRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      dataRow.getCell(2).font = { size: 7.5, color: { argb: "FF78716C" } };
      dataRow.getCell(2).alignment = { vertical: "middle", horizontal: "center" };

      // Style day cells
      workingDays.forEach((day, dayIdx) => {
        const cell = dataRow.getCell(3 + dayIdx);
        const lesson = findLesson(lessons, cls.id, day, period.position);
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.font = { size: 8 };
        cell.border = {
          top: { style: "hair", color: { argb: "FFD4CFC5" } },
          bottom: { style: "hair", color: { argb: "FFD4CFC5" } },
          left: { style: "hair", color: { argb: "FFD4CFC5" } },
          right: { style: "hair", color: { argb: "FFD4CFC5" } },
        };

        if (lesson && lesson.startPeriod === period.position) {
          const lightFill = lightenHex(lesson.subjectColour, 0.65);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${lightFill}` },
          };
          cell.font = { size: 8, bold: true };
        }
      });
    }

    // ── Generated footer ─────────────────────────────────────────────────────
    sheet.addRow([]);
    const footerRow = sheet.addRow([
      `Generated by Slate · ${new Date().toLocaleDateString("en-GB")}`,
    ]);
    sheet.mergeCells(footerRow.number, 1, footerRow.number, 2 + workingDays.length);
    footerRow.getCell(1).font = {
      italic: true,
      size: 7,
      color: { argb: "FF78716C" },
    };

    // Print area
    sheet.pageSetup.printArea = `A1:${String.fromCharCode(65 + 1 + workingDays.length)}${footerRow.number}`;
  }

  // Write to buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(
    blob,
    `timetable-${workspaceName.replace(/\s+/g, "-").toLowerCase()}-${academicYear}.xlsx`
  );
}

