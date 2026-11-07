/**
 * Phase 5: PDF Export
 * Generates a per-class timetable PDF using jsPDF + jsPDF-AutoTable.
 * Runs entirely on the client (browser) — no server needed.
 */

import type { PlacedLesson, SchedulePeriod } from "@/lib/scheduling/rules";

export interface PdfExportOptions {
  workspaceName: string;
  academicYear: string;
  workingDays: number[];
  periods: SchedulePeriod[];
  lessons: PlacedLesson[];
  classes: { id: string; name: string; studentCount: number }[];
  rooms: { id: string; name: string }[];
  /** Filter to a single class ID, or export all if undefined */
  classId?: string;
}

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Returns the lesson at a given day + startPeriod for a class, or null */
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

export async function exportTimetablePDF(options: PdfExportOptions): Promise<void> {
  // Dynamic import so jsPDF is never bundled server-side
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const { workspaceName, academicYear, workingDays, periods, lessons, classes, rooms } =
    options;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const teachingPeriods = periods.filter((p) => !p.isBreak);
  const targetClasses = options.classId
    ? classes.filter((c) => c.id === options.classId)
    : classes;

  // Accent colour
  const ACCENT = [255, 90, 31] as [number, number, number];
  const INK = [18, 18, 16] as [number, number, number];
  const CREAM = [244, 242, 236] as [number, number, number];
  const MUTED = [120, 113, 108] as [number, number, number];

  targetClasses.forEach((cls, pageIdx) => {
    if (pageIdx > 0) doc.addPage("a4", "landscape");

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(...ACCENT);
    doc.roundedRect(10, 8, pageW - 20, 14, 2, 2, "F");

    // Slate mark (small orange square with grid) — drawn manually
    doc.setFillColor(255, 255, 255);
    const mx = 13, my = 10, ms = 10;
    doc.roundedRect(mx, my, ms, ms, 1, 1, "F");
    // 3×3 dots
    doc.setFillColor(...ACCENT);
    const dotSize = 2.2, gap = 1.2;
    [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]].forEach(([col, row], i) => {
      const fill = (col === 1 && row === 1) ? INK : [255,255,255] as [number,number,number];
      doc.setFillColor(...fill);
      doc.roundedRect(
        mx + 1 + col * (dotSize + gap),
        my + 1 + row * (dotSize + gap),
        dotSize, dotSize, 0.4, 0.4, "F"
      );
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Slate  ·  ${workspaceName}  —  ${academicYear}`, 27, 16.5);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
      pageW - 12,
      16.5,
      { align: "right" }
    );

    // ── Class title ──────────────────────────────────────────────────────────
    doc.setTextColor(...INK);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Class ${cls.name}`, 10, 32);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${cls.studentCount} students`, 10, 37);

    // ── Table ────────────────────────────────────────────────────────────────
    const colHeaders = [
      { content: "Period", styles: { halign: "center" as const, fontStyle: "bold" as const } },
      { content: "Time", styles: { halign: "center" as const } },
      ...workingDays.map((d) => ({
        content: DAY_NAMES[d],
        styles: { halign: "center" as const, fontStyle: "bold" as const },
      })),
    ];

    // Build all rows: for each period position (including breaks)
    const rows = periods.map((period) => {
      if (period.isBreak) {
        return [
          {
            content: period.label,
            colSpan: 2 + workingDays.length,
            styles: {
              fillColor: CREAM,
              textColor: MUTED,
              fontStyle: "italic" as const,
              halign: "center" as const,
              fontSize: 7,
            },
          },
        ];
      }

      const timeStr =
        period.startTime && period.endTime
          ? `${period.startTime}–${period.endTime}`
          : `P${period.position}`;

      const dayCells = workingDays.map((day) => {
        const lesson = findLesson(lessons, cls.id, day, period.position);
        if (!lesson) return { content: "", styles: { textColor: MUTED } };

        // Skip continuation rows of a double block
        if (lesson.startPeriod !== period.position) {
          return {
            content: "↑",
            styles: { textColor: MUTED, halign: "center" as const, fontSize: 7 },
          };
        }

        const roomName = rooms.find((r) => r.id === lesson.roomId)?.name ?? "";
        const content = [
          lesson.subjectCode,
          lesson.teacherCode,
          roomName,
          lesson.length === 2 ? "(double)" : "",
        ]
          .filter(Boolean)
          .join("\n");

        return {
          content,
          styles: {
            halign: "center" as const,
            fontSize: 7.5,
            fontStyle: "bold" as const,
            fillColor: hexToRgb(lesson.subjectColour) ?? [240, 237, 230],
            textColor: contrastColor(lesson.subjectColour),
          },
        };
      });

      return [
        {
          content: `P${period.position}`,
          styles: {
            halign: "center" as const,
            fontStyle: "bold" as const,
            fontSize: 8,
            fillColor: [248, 246, 240] as [number, number, number],
          },
        },
        {
          content: timeStr,
          styles: { halign: "center" as const, fontSize: 7, textColor: MUTED },
        },
        ...dayCells,
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [colHeaders],
      body: rows as any,
      theme: "plain",
      tableWidth: pageW - 20,
      margin: { left: 10, right: 10 },
      styles: {
        cellPadding: 2.5,
        lineColor: [220, 215, 205],
        lineWidth: 0.2,
        font: "helvetica",
        fontSize: 8,
        overflow: "linebreak",
        cellWidth: "auto",
      },
      headStyles: {
        fillColor: INK,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 248, 244] as [number,number,number] },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 20 },
      },
    });

    // Page footer
    const finalY = pageH - 6;
    doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `${workspaceName}  ·  ${academicYear}  ·  Slate timetable`,
      pageW / 2,
      finalY,
      { align: "center" }
    );
  });

  doc.save(
    `timetable-${workspaceName.replace(/\s+/g, "-").toLowerCase()}-${academicYear}.pdf`
  );
}

// ── Colour helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/** Returns black or white depending on background luminance */
function contrastColor(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [18, 18, 16];
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? [18, 18, 16] : [255, 255, 255];
}

