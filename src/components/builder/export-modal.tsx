"use client";

import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Download,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { exportTimetablePDF } from "@/lib/exports/pdf-export";
import { exportTimetableExcel } from "@/lib/exports/excel-export";
import { exportTimetableIcsZip } from "@/lib/exports/ical-export";
import type { PlacedLesson, SchedulePeriod } from "@/lib/scheduling/rules";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: {
    name: string;
    academicYear: string;
    workingDays: number[];
  };
  periods: SchedulePeriod[];
  lessons: PlacedLesson[];
  classes: { id: string; name: string; studentCount: number }[];
  teachers: { id: string; name: string; code: string }[];
  rooms: { id: string; name: string }[];
}

export function ExportModal({
  isOpen,
  onClose,
  workspace,
  periods,
  lessons,
  classes,
  teachers,
  rooms,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"PDF" | "EXCEL" | "ICS">("PDF");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMessage("Preparing document...");

      if (selectedFormat === "PDF") {
        setStatusMessage("Generating high-resolution PDF...");
        await exportTimetablePDF({
          workspaceName: workspace.name,
          academicYear: workspace.academicYear,
          workingDays: workspace.workingDays,
          periods,
          lessons,
          classes,
          rooms,
          classId: selectedClassId === "ALL" ? undefined : selectedClassId,
        });
      } else if (selectedFormat === "EXCEL") {
        setStatusMessage("Formatting Excel worksheets...");
        await exportTimetableExcel({
          workspaceName: workspace.name,
          academicYear: workspace.academicYear,
          workingDays: workspace.workingDays,
          periods,
          lessons,
          classes: selectedClassId === "ALL" ? classes : classes.filter((c) => c.id === selectedClassId),
          rooms,
        });
      } else if (selectedFormat === "ICS") {
        setStatusMessage("Bundling iCalendar feeds into ZIP...");
        await exportTimetableIcsZip({
          workspaceName: workspace.name,
          academicYear: workspace.academicYear,
          workingDays: workspace.workingDays,
          periods,
          lessons,
          classes: selectedClassId === "ALL" ? classes : classes.filter((c) => c.id === selectedClassId),
          teachers,
          rooms,
        });
      }

      setStatusMessage("Export complete!");
      setTimeout(() => {
        setIsExporting(false);
        setStatusMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Export error:", err);
      setStatusMessage(`Failed: ${err.message || "Unknown error"}`);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          disabled={isExporting}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-ink">Export Timetable</h3>
            <p className="text-xs text-muted">
              Download conflict-free publication files for distribution
            </p>
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-2">
              Select Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat("PDF")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedFormat === "PDF"
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-line bg-bg hover:border-line/80"
                }`}
              >
                <FileText className={`w-6 h-6 mb-1.5 ${selectedFormat === "PDF" ? "text-accent" : "text-muted"}`} />
                <span className="text-xs font-bold text-ink">PDF Document</span>
                <span className="text-[10px] text-muted mt-0.5">Print ready (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("EXCEL")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedFormat === "EXCEL"
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-line bg-bg hover:border-line/80"
                }`}
              >
                <FileSpreadsheet className={`w-6 h-6 mb-1.5 ${selectedFormat === "EXCEL" ? "text-accent" : "text-muted"}`} />
                <span className="text-xs font-bold text-ink">Excel Sheet</span>
                <span className="text-[10px] text-muted mt-0.5">.xlsx workbooks</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat("ICS")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedFormat === "ICS"
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-line bg-bg hover:border-line/80"
                }`}
              >
                <Calendar className={`w-6 h-6 mb-1.5 ${selectedFormat === "ICS" ? "text-accent" : "text-muted"}`} />
                <span className="text-xs font-bold text-ink">iCalendar ZIP</span>
                <span className="text-[10px] text-muted mt-0.5">Google / Apple Cal</span>
              </button>
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">
              Class Scope
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-line bg-bg text-ink text-xs font-medium focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Classes ({classes.length} total)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status info */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Package</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

