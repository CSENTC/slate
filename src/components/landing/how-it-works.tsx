"use client";

import React from "react";
import { AssetImage } from "@/components/ui/asset-image";

const STEPS = [
  {
    num: "01",
    title: "Set the week",
    desc: "Define academic terms, active days, period lengths, and designated breaks.",
    assetKey: "step-1-setup" as const,
  },
  {
    num: "02",
    title: "Add the people",
    desc: "Register faculty with daily limits and unavailabilities, rooms, and sections.",
    assetKey: "step-2-people" as const,
  },
  {
    num: "03",
    title: "Build or generate",
    desc: "Drag into the interactive grid with live constraint checks or trigger auto-generation.",
    assetKey: "step-3-build" as const,
  },
  {
    num: "04",
    title: "Export everywhere",
    desc: "Distribute print-ready landscape PDFs, structured Excel books, and sync-ready calendars.",
    assetKey: "step-4-export" as const,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-line">
      <div className="mb-14">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Methodology
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-ink">
          From curriculum outline to clash-free schedule.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-line bg-surface hover:border-accent/50 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-4xl font-extrabold text-muted/30 group-hover:text-accent transition-colors duration-300">
                  {step.num}
                </span>
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg/50 p-2 border border-line/50">
                  <AssetImage assetKey={step.assetKey} className="w-full h-full object-contain" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-muted text-xs leading-relaxed">{step.desc}</p>
            </div>

            <div className="mt-8 pt-4 border-t border-line/40 flex items-center justify-between font-mono text-[10px] text-muted">
              <span>Phase {step.num}</span>
              <span className="group-hover:translate-x-1 transition-transform text-accent">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

