"use client";

import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useBuilderStore } from "@/lib/scheduling/builder-store";
import { DraggableAllocationTrayItem } from "./tray-item";
import { Layers, Sparkles, AlertCircle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LessonTray() {
  const {
    viewMode,
    selectedEntityId,
    allocations,
    lessons,
  } = useBuilderStore();

  // Droppable zone so lessons dragged out of the grid back into the tray are unplaced
  const { setNodeRef, isOver } = useDroppable({
    id: "tray-unplace-dropzone",
    data: {
      type: "TRAY_DROPZONE",
    },
  });

  // Filter allocations applicable to the currently selected view entity
  const relevantAllocations = useMemo(() => {
    if (!selectedEntityId) return [];

    if (viewMode === "BY_CLASS") {
      return allocations.filter((a) => a.classId === selectedEntityId);
    }
    if (viewMode === "BY_TEACHER") {
      return allocations.filter((a) => a.teacherId === selectedEntityId);
    }
    // BY_ROOM: all allocations can theoretically be scheduled in rooms matching type
    return allocations;
  }, [allocations, viewMode, selectedEntityId]);

  // Compute remaining sessions for each allocation
  // Note: periodsPerWeek represents total periods. If blockSize=2, each session takes 2 periods.
  // remaining sessions = (periodsPerWeek - placedPeriods) / blockSize
  const allocationRemaining = useMemo(() => {
    const placedCounts = new Map<string, number>();
    for (const l of lessons) {
      const count = placedCounts.get(l.allocationId) || 0;
      placedCounts.set(l.allocationId, count + l.length);
    }

    const remainingMap = new Map<string, number>();
    for (const alloc of relevantAllocations) {
      const placed = placedCounts.get(alloc.id) || 0;
      const remainingPeriods = Math.max(alloc.periodsPerWeek - placed, 0);
      const remainingSessions = Math.ceil(remainingPeriods / alloc.blockSize);
      remainingMap.set(alloc.id, remainingSessions);
    }
    return remainingMap;
  }, [relevantAllocations, lessons]);

  const totalRemainingSessions = useMemo(() => {
    let sum = 0;
    for (const count of allocationRemaining.values()) {
      sum += count;
    }
    return sum;
  }, [allocationRemaining]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 border-r border-line bg-surface/50 flex flex-col shrink-0 select-none transition-colors",
        isOver && "bg-accent/5 ring-2 ring-inset ring-accent"
      )}
    >
      {/* Tray Header */}
      <div className="p-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
            Unplaced Lessons
          </span>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-bg text-muted border border-line">
          {totalRemainingSessions} left
        </span>
      </div>

      {/* Unplace drop helper when dragging a placed lesson */}
      {isOver && (
        <div className="m-3 p-3 rounded-xl border border-dashed border-accent bg-accent/10 text-accent flex items-center justify-center gap-2 text-xs font-mono animate-pulse">
          <ArrowDown className="w-4 h-4" />
          <span>Drop here to unplace</span>
        </div>
      )}

      {/* Scrollable Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {relevantAllocations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted text-xs">
            <AlertCircle className="w-8 h-8 stroke-[1.5] mb-2 text-line" />
            <p className="font-medium text-ink">No Allocations Configured</p>
            <p className="mt-1">
              Configure curriculum allocations in the master data tab first.
            </p>
          </div>
        ) : (
          relevantAllocations.map((alloc) => (
            <DraggableAllocationTrayItem
              key={alloc.id}
              allocation={alloc}
              remainingCount={allocationRemaining.get(alloc.id) ?? 0}
            />
          ))
        )}
      </div>

      {/* Instructions footer */}
      <div className="p-3 border-t border-line/60 bg-bg/50 text-[11px] text-muted font-mono flex items-center justify-between">
        <span>Drag cards to timetable cells</span>
        <span className="text-accent">DND Active</span>
      </div>
    </div>
  );
}
