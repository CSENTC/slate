"use client";

import React from "react";

const RULES = [
  "Teacher clash",
  "Room capacity",
  "Lab double periods",
  "Max 4 periods a day",
  "Lunch breaks",
  "Unavailable slots",
  "Consecutive limits",
  "Even distribution",
  "Class double-booked",
  "Break crossing prohibited",
  "Specialist room verification",
];

export function RulesMarquee() {
  return (
    <div className="w-full border-y border-line py-4 bg-surface/40 overflow-hidden relative select-none">
      <div className="animate-marquee flex items-center gap-8">
        {[...RULES, ...RULES].map((rule, idx) => (
          <div key={idx} className="flex items-center gap-6 whitespace-nowrap">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              {rule}
            </span>
            <span className="w-1.5 h-1.5 rounded-sm bg-accent inline-block" />
          </div>
        ))}
      </div>
    </div>
  );
}

