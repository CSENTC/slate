"use client";

import React from "react";
import { useBuilderStore } from "@/lib/scheduling/builder-store";
import {
  Users,
  GraduationCap,
  Building2,
  Undo2,
  Redo2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Check,
  Sparkles,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuilderToolbarProps {
  onAutoGenerate?: () => void;
  isGenerating?: boolean;
  onExportClick?: () => void;
}

export function BuilderToolbar({
  onAutoGenerate,
  isGenerating = false,
  onExportClick,
}: BuilderToolbarProps) {
  const {
    viewMode,
    setViewMode,
    classes,
    teachers,
    rooms,
    selectedEntityId,
    setSelectedEntityId,
    validationMode,
    setValidationMode,
    past,
    future,
    undo,
    redo,
    issues,
    toggleIssuesDrawer,
    activeIssuesDrawer,
    isSaving,
    hasUnsavedChanges,
  } = useBuilderStore();

  const hardIssuesCount = issues.filter((i) => i.severity === "HARD").length;
  const softIssuesCount = issues.filter((i) => i.severity === "SOFT").length;

  return (
    <div className="h-14 border-b border-line bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: View Mode Switcher + Entity Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-bg p-1 rounded-xl border border-line text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode("BY_CLASS")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
              viewMode === "BY_CLASS"
                ? "bg-accent text-white font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Class</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("BY_TEACHER")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
              viewMode === "BY_TEACHER"
                ? "bg-accent text-white font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("BY_ROOM")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
              viewMode === "BY_ROOM"
                ? "bg-accent text-white font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room</span>
          </button>
        </div>

        <div className="relative">
          <select
            value={selectedEntityId || ""}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="h-8 px-3 pr-8 rounded-lg border border-line bg-surface text-ink text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
          >
            {viewMode === "BY_CLASS" &&
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.name} ({c.studentCount} students)
                </option>
              ))}
            {viewMode === "BY_TEACHER" &&
              teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            {viewMode === "BY_ROOM" &&
              rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Cap {r.capacity} · {r.type})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Center: Auto-Generate + Strict/Warn + Undo/Redo */}
      <div className="flex items-center gap-2">
        {/* Auto-Generate Button */}
        {onAutoGenerate && (
          <button
            type="button"
            onClick={onAutoGenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
              isGenerating
                ? "border-accent/40 bg-accent/10 text-accent cursor-wait"
                : "border-accent bg-accent text-white hover:bg-accent/90 shadow-sm"
            )}
            title="Auto-generate a full conflict-free timetable"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? "Generating…" : "Auto-Generate"}</span>
          </button>
        )}

        {/* Strict / Warn mode */}
        <div className="flex items-center gap-1 border border-line bg-bg p-0.5 rounded-lg text-xs font-mono">
          <button
            type="button"
            onClick={() => setValidationMode("STRICT")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors",
              validationMode === "STRICT"
                ? "bg-surface text-ink font-semibold shadow-xs border border-line/60"
                : "text-muted hover:text-ink"
            )}
            title="Strict mode: blocks hard clashes completely"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Strict</span>
          </button>
          <button
            type="button"
            onClick={() => setValidationMode("WARN")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors",
              validationMode === "WARN"
                ? "bg-surface text-ink font-semibold shadow-xs border border-line/60"
                : "text-muted hover:text-ink"
            )}
            title="Warn mode: permits drops with clash alerts"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Warn</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center border border-line rounded-lg overflow-hidden bg-surface">
          <button
            type="button"
            disabled={past.length === 0}
            onClick={undo}
            className="p-1.5 text-muted hover:text-ink hover:bg-bg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-line" />
          <button
            type="button"
            disabled={future.length === 0}
            onClick={redo}
            className="p-1.5 text-muted hover:text-ink hover:bg-bg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Export Button + Autosave + Issues */}
      <div className="flex items-center gap-3">
        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-surface hover:border-accent text-ink text-xs font-semibold transition-colors shadow-2xs"
            title="Export Timetable as PDF, Excel, or iCalendar"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
          {isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span>Saving...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Unsaved edits</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Synced</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleIssuesDrawer}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all",
            hardIssuesCount > 0
              ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
              : softIssuesCount > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "bg-surface border-line text-muted hover:text-ink hover:border-line/80",
            activeIssuesDrawer && "ring-2 ring-accent"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{hardIssuesCount + softIssuesCount} Issues</span>
          {hardIssuesCount > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
              {hardIssuesCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
