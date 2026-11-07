"use client";

import React from "react";
import { useBuilderStore } from "@/lib/scheduling/builder-store";
import {
  AlertTriangle,
  X,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IssuesPanel() {
  const {
    issues,
    activeIssuesDrawer,
    toggleIssuesDrawer,
    setHighlightedCell,
  } = useBuilderStore();

  if (!activeIssuesDrawer) return null;

  const hardIssues = issues.filter((i) => i.severity === "HARD");
  const softIssues = issues.filter((i) => i.severity === "SOFT");

  const handleJumpToIssue = (day?: number, periodPosition?: number) => {
    if (day && periodPosition) {
      setHighlightedCell({ day, periodPosition });
      setTimeout(() => setHighlightedCell(null), 3000); // clear pulse after 3 seconds
    }
  };

  return (
    <div className="w-80 border-l border-line bg-surface/90 backdrop-blur-md flex flex-col shrink-0 select-none shadow-lg z-30">
      {/* Header */}
      <div className="p-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
            Audit Issues ({issues.length})
          </span>
        </div>
        <button
          type="button"
          onClick={toggleIssuesDrawer}
          className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {issues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted text-xs">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="font-semibold text-ink text-sm">Clean Timetable</p>
            <p className="mt-1">
              Zero hard clashes or constraint violations detected in this schedule.
            </p>
          </div>
        ) : (
          <>
            {/* Hard Clashes */}
            {hardIssues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Hard Clashes ({hardIssues.length})</span>
                </div>

                {hardIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-ink text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-red-700 dark:text-red-300">
                        {issue.title}
                      </span>
                      {issue.day && issue.periodPosition && (
                        <button
                          type="button"
                          onClick={() =>
                            handleJumpToIssue(issue.day, issue.periodPosition)
                          }
                          className="flex items-center gap-0.5 text-[10px] font-mono text-accent hover:underline shrink-0"
                          title="Focus cell"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>D{issue.day} P{issue.periodPosition}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-muted leading-relaxed text-[11px]">
                      {issue.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Soft Issues */}
            {softIssues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Advisory Warnings ({softIssues.length})</span>
                </div>

                {softIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-ink text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {issue.title}
                      </span>
                      {issue.day && issue.periodPosition && (
                        <button
                          type="button"
                          onClick={() =>
                            handleJumpToIssue(issue.day, issue.periodPosition)
                          }
                          className="flex items-center gap-0.5 text-[10px] font-mono text-accent hover:underline shrink-0"
                          title="Focus cell"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>D{issue.day} P{issue.periodPosition}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-muted leading-relaxed text-[11px]">
                      {issue.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
