"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { PlacedLesson, ScheduleIssue } from "@/lib/scheduling/rules";
import { PlacedLessonCard } from "./placed-lesson-card";
import { cn } from "@/lib/utils";

interface TimetableCellProps {
  day: number;
  periodPosition: number;
  isBreak: boolean;
  breakLabel?: string;
  lesson?: PlacedLesson;
  isOccupiedByDoubleSpan?: boolean; // If period before this started a length 2 block
  hasHardIssue?: boolean;
  hasSoftIssue?: boolean;
  isHighlighted?: boolean;
  onUnplace?: () => void;
  onToggleLock?: () => void;
}

export function TimetableCell({
  day,
  periodPosition,
  isBreak,
  breakLabel,
  lesson,
  isOccupiedByDoubleSpan = false,
  hasHardIssue = false,
  hasSoftIssue = false,
  isHighlighted = false,
  onUnplace,
  onToggleLock,
}: TimetableCellProps) {
  const cellId = `cell-${day}-${periodPosition}`;

  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    disabled: isBreak || isOccupiedByDoubleSpan,
    data: {
      type: "TIMETABLE_CELL",
      day,
      periodPosition,
    },
  });

  // Break Slot
  if (isBreak) {
    return (
      <div className="h-16 rounded-xl border border-dashed border-line/60 bg-bg/60 flex items-center justify-center select-none text-[11px] font-mono text-muted/60">
        <span>{breakLabel || "Break"}</span>
      </div>
    );
  }

  // If this cell is the second slot of a double block, render continuation visual
  if (isOccupiedByDoubleSpan && !lesson) {
    return (
      <div className="h-16 rounded-xl border-2 border-dashed border-line/50 bg-surface/30 flex items-center justify-center select-none text-[10px] font-mono text-muted/50">
        <span>Continuation (2hr)</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-xl transition-all duration-150 select-none",
        lesson && lesson.length > 1 ? "h-[8.5rem]" : "h-16",
        isHighlighted && "ring-2 ring-accent ring-offset-2 ring-offset-bg animate-pulse",
        isOver && "ring-2 ring-accent bg-accent/10 border-accent",
        !lesson && !isOver && "border border-line/70 bg-surface/40 hover:border-line hover:bg-surface/70"
      )}
    >
      {lesson ? (
        <PlacedLessonCard
          lesson={lesson}
          hasHardIssue={hasHardIssue}
          hasSoftIssue={hasSoftIssue}
          onUnplace={onUnplace}
          onToggleLock={onToggleLock}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-muted/30">
          <span>{isOver ? "Release to drop" : "Empty"}</span>
        </div>
      )}
    </div>
  );
}
