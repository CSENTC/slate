"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { PlacedLesson } from "@/lib/scheduling/rules";
import { Lock, Unlock, X, AlertTriangle, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlacedLessonCardProps {
  lesson: PlacedLesson;
  hasHardIssue?: boolean;
  hasSoftIssue?: boolean;
  onUnplace?: () => void;
  onToggleLock?: () => void;
}

export function PlacedLessonCard({
  lesson,
  hasHardIssue = false,
  hasSoftIssue = false,
  onUnplace,
  onToggleLock,
}: PlacedLessonCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-lesson-${lesson.id}`,
    disabled: lesson.locked,
    data: {
      type: "PLACED_LESSON",
      lesson,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative w-full h-full p-2.5 rounded-xl border flex flex-col justify-between transition-all select-none touch-none",
        lesson.locked
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing hover:shadow-md",
        isDragging && "opacity-20 scale-95",
        hasHardIssue
          ? "border-red-500 bg-red-500/10 text-ink dark:text-red-200"
          : hasSoftIssue
          ? "border-amber-500 bg-amber-500/10 text-ink dark:text-amber-200"
          : "border-line bg-surface hover:border-accent/80 text-ink"
      )}
      style={{
        borderLeftColor: hasHardIssue ? "#EF4444" : hasSoftIssue ? "#F59E0B" : lesson.subjectColour,
        borderLeftWidth: "4px",
      }}
    >
      {/* Header: Subject + Action buttons */}
      <div className="flex items-start justify-between gap-1">
        <div className="truncate">
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs font-bold truncate">
              {lesson.subjectName}
            </span>
            {hasHardIssue && (
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
            )}
          </div>
          <span className="font-mono text-[10px] text-muted uppercase">
            {lesson.subjectCode} {lesson.length > 1 && "· 2hr"}
          </span>
        </div>

        {/* Hover quick-actions: Lock & Unplace */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {onToggleLock && (
            <button
              type="button"
              onClick={onToggleLock}
              aria-label={lesson.locked ? `Unlock ${lesson.subjectName}` : `Lock ${lesson.subjectName}`}
              className="p-1 rounded-md hover:bg-bg text-muted hover:text-ink transition-colors focus-visible:ring-1 focus-visible:ring-accent"
              title={lesson.locked ? "Unlock lesson" : "Lock lesson in place"}
            >
              {lesson.locked ? (
                <Lock className="w-3 h-3 text-accent" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </button>
          )}

          {!lesson.locked && onUnplace && (
            <button
              type="button"
              onClick={onUnplace}
              aria-label={`Unplace ${lesson.subjectName}`}
              className="p-1 rounded-md hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors focus-visible:ring-1 focus-visible:ring-red-500"
              title="Unplace lesson"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Meta: Teacher & Room */}
      <div className="mt-1 pt-1 border-t border-line/40 flex items-center justify-between text-[10px] text-muted font-mono">
        <span className="flex items-center gap-1 truncate" title={lesson.teacherName}>
          <User className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{lesson.teacherCode || lesson.teacherName}</span>
        </span>

        <span className="flex items-center gap-1 shrink-0 ml-1" title={lesson.roomName || "No room assigned"}>
          <Building2 className="w-2.5 h-2.5 shrink-0" />
          <span>{lesson.roomName || "—"}</span>
        </span>
      </div>
    </div>
  );
}
