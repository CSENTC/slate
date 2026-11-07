"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { AllocationWithMeta } from "@/lib/scheduling/builder-store";
import { BookOpen, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableAllocationTrayItemProps {
  allocation: AllocationWithMeta;
  remainingCount: number;
}

export function DraggableAllocationTrayItem({
  allocation,
  remainingCount,
}: DraggableAllocationTrayItemProps) {
  const isExhausted = remainingCount <= 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tray-alloc-${allocation.id}`,
    disabled: isExhausted,
    data: {
      type: "TRAY_ITEM",
      allocation,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative p-3 rounded-xl border transition-all select-none touch-none",
        isExhausted
          ? "border-line/40 bg-surface/30 opacity-40 cursor-not-allowed"
          : "border-line bg-surface hover:border-accent/60 hover:shadow-sm cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30 scale-95"
      )}
      style={{
        borderLeftColor: allocation.subject.colour,
        borderLeftWidth: "4px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="font-mono text-xs font-bold text-ink truncate">
            {allocation.subject.name}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg text-muted uppercase">
            {allocation.subject.code}
          </span>
        </div>

        {/* Remaining Badge */}
        <span
          className={cn(
            "font-mono text-xs px-2 py-0.5 rounded-full font-semibold shrink-0",
            isExhausted
              ? "bg-bg text-muted"
              : "bg-accent/15 text-accent"
          )}
        >
          ×{Math.max(remainingCount, 0)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1 truncate">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">{allocation.teacher.name}</span>
        </span>

        <span className="font-mono text-[10px] text-muted shrink-0">
          {allocation.blockSize === 2 ? "2-hr block" : "1 hr"}
        </span>
      </div>
    </div>
  );
}
