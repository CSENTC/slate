"use client";

import React from "react";
import { GeneratedPeriodSlot } from "@/lib/scheduling/setup-schema";
import { Coffee, Clock } from "lucide-react";

interface ScheduleLiveStripProps {
  slots: GeneratedPeriodSlot[];
}

export function ScheduleLiveStrip({ slots }: ScheduleLiveStripProps) {
  if (slots.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-line text-center text-xs font-mono text-muted">
        Configure period count and duration to preview your day.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>Calculated Day Schedule ({slots.length} segments)</span>
        </span>
        <span>
          {slots[0]?.startTime} → {slots[slots.length - 1]?.endTime}
        </span>
      </div>

      <div className="flex items-stretch gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {slots.map((slot) => {
          if (slot.isBreak) {
            return (
              <div
                key={slot.position}
                className="shrink-0 flex flex-col justify-between items-center px-3 py-2.5 rounded-xl border border-line bg-line/40 text-center min-w-[80px]"
              >
                <div className="flex items-center gap-1 text-[10px] font-mono text-muted uppercase font-semibold">
                  <Coffee className="w-3 h-3 text-accent" />
                  <span>{slot.label}</span>
                </div>
                <div className="font-mono text-[9px] text-muted/80 mt-1">
                  {slot.startTime}–{slot.endTime}
                </div>
              </div>
            );
          }

          return (
            <div
              key={slot.position}
              className="shrink-0 flex flex-col justify-between p-2.5 rounded-xl border border-line bg-surface text-center min-w-[95px] shadow-sm"
            >
              <div className="font-mono text-[11px] font-bold text-ink">
                {slot.label}
              </div>
              <div className="font-mono text-[9px] text-muted mt-1">
                {slot.startTime}–{slot.endTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

