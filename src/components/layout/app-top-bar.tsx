"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Check, Download, AlertTriangle } from "lucide-react";

interface AppTopBarProps {
  title?: string;
  isSaving?: boolean;
  onExportClick?: () => void;
}

export function AppTopBar({
  title = "Academic Timetable 2026/27",
  isSaving = false,
  onExportClick,
}: AppTopBarProps) {
  return (
    <header className="h-14 border-b border-line bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold text-ink tracking-tight">{title}</h1>

        {/* Autosave status indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full border border-line bg-bg/50">
          {isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
              <span className="text-muted">Saving changes...</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-muted">Saved to database</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent text-ink text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export</span>
          </button>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}

