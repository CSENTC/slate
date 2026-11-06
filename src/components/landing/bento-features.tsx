"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertCircle, Terminal, FileText, Calendar, Sun, Moon } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";

export function BentoFeatures() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
          Engineered Precision
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-ink">
          Built for dense, uncompromising requirements.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tile 1: Clash Messages (Wide 2-col) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-2 rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between overflow-hidden relative shadow-sm"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-conflict/10 text-conflict">
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-lg text-ink">Zero-Clash Assurance</h3>
            </div>
            <p className="text-muted text-sm max-w-md">
              Hard conflicts are caught instantaneously. Every overlap reveals plain-English reasons naming people, rooms, and constraints.
            </p>
          </div>

          <div className="my-4 rounded-xl overflow-hidden border border-line/50 max-h-48">
            <AssetImage assetKey="feature-clash" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2 font-mono text-xs relative z-10">
            <div className="p-3 rounded-xl border border-conflict/40 bg-conflict/5 flex items-center justify-between text-conflict">
              <span>Dr. V. Rao double-booked in Lab 2 & Room 301</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-conflict text-white">
                Hard rule
              </span>
            </div>
            <div className="p-3 rounded-xl border border-warning/40 bg-warning/5 flex items-center justify-between text-warning dark:text-amber-300">
              <span>Prof. Sharma exceeds 4 max daily periods (currently 5)</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-warning text-white">
                Soft rule
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tile 2: Workload Meters */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between shadow-sm overflow-hidden"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Faculty Quotas
            </span>
            <h3 className="font-bold text-lg text-ink mt-1">Live Workload Limits</h3>
            <p className="text-muted text-xs mt-1">
              Guaranteed fairness across weekly hours and daily consecutive thresholds.
            </p>
          </div>

          <div className="my-4 rounded-xl overflow-hidden border border-line/50 max-h-40">
            <AssetImage assetKey="feature-workload" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-muted text-[11px] mb-1">
                <span>Dr. Rao (Networks)</span>
                <span className="text-ink font-semibold">14 / 16 hrs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: "87%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-muted text-[11px] mb-1">
                <span>Prof. Sen (Databases)</span>
                <span className="text-ink font-semibold">12 / 12 hrs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tile 3: Auto-generate readout */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between shadow-sm overflow-hidden"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-accent/10 text-accent">
                <Terminal className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-lg text-ink">Web Worker Solver</h3>
            </div>
            <p className="text-muted text-xs">
              Backtracking heuristic placing hardest blocks first without freezing UI.
            </p>
          </div>

          <div className="my-4 rounded-xl overflow-hidden border border-line/50 max-h-36">
            <AssetImage assetKey="feature-generate" className="w-full h-full object-cover" />
          </div>

          <div className="p-3 rounded-xl bg-ink text-bg font-mono text-[11px] space-y-1.5 leading-relaxed overflow-hidden">
            <div className="text-muted">[0.12s] Running feasibility check...</div>
            <div className="text-emerald-400">✓ Feasible: 120 slots, 114 required</div>
            <div className="text-accent">→ Locking fixed lab double blocks</div>
            <div className="text-muted">[0.84s] 114/114 lessons placed</div>
          </div>
        </motion.div>

        {/* Tile 4: Export Chips */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between shadow-sm overflow-hidden"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Formats
            </span>
            <h3 className="font-bold text-lg text-ink mt-1">Multi-Channel Export</h3>
            <p className="text-muted text-xs mt-1">
              Publish print-ready landscape PDFs, color-coded Excel sheets, and live calendar subscriptions.
            </p>
          </div>

          <div className="my-4 rounded-xl overflow-hidden border border-line/50 max-h-36">
            <AssetImage assetKey="feature-export" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-bg font-mono text-xs font-semibold text-ink shadow-sm">
              <FileText className="w-4 h-4 text-accent" />
              <span>.PDF</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-bg font-mono text-xs font-semibold text-ink shadow-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>.XLSX</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line bg-bg font-mono text-xs font-semibold text-ink shadow-sm">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>.ICS</span>
            </div>
          </div>
        </motion.div>

        {/* Tile 5: Period Strip */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-line bg-surface p-6 flex flex-col justify-between shadow-sm"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Period Architecture
            </span>
            <h3 className="font-bold text-lg text-ink mt-1">Configurable Days</h3>
            <p className="text-muted text-xs mt-1">
              Arbitrary start times, custom break positions, and individual period overrides.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-1.5 overflow-hidden">
            <div className="flex-1 py-3 text-center rounded-lg bg-bg border border-line font-mono text-[10px] font-semibold text-ink">
              P1
            </div>
            <div className="flex-1 py-3 text-center rounded-lg bg-bg border border-line font-mono text-[10px] font-semibold text-ink">
              P2
            </div>
            <div className="px-2 py-3 text-center rounded-lg bg-line/60 font-mono text-[9px] text-muted uppercase tracking-wider">
              Tea
            </div>
            <div className="flex-1 py-3 text-center rounded-lg bg-bg border border-line font-mono text-[10px] font-semibold text-ink">
              P3
            </div>
            <div className="px-3 py-3 text-center rounded-lg bg-line/80 font-mono text-[9px] text-muted uppercase tracking-wider">
              Lunch
            </div>
            <div className="flex-1 py-3 text-center rounded-lg bg-bg border border-line font-mono text-[10px] font-semibold text-ink">
              P4
            </div>
          </div>
        </motion.div>

        {/* Tile 6: Theme Preview (Wide 3-col) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-3 rounded-2xl border border-line bg-surface p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden"
        >
          <div className="max-w-md shrink-0">
            <div className="flex items-center gap-2 mb-2 text-accent">
              <Sun className="w-4 h-4" />
              <Moon className="w-4 h-4" />
              <span className="font-mono text-xs uppercase font-semibold">First-class Themes</span>
            </div>
            <h3 className="text-2xl font-bold text-ink">
              Quiet paper cream by day. Obsidian deep ink by night.
            </h3>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Engineered with WCAG AA contrast tokens, subtle hairline borders, and zero eye fatigue during extended scheduling marathons.
            </p>
          </div>

          <div className="w-full md:w-[460px] h-[260px] rounded-xl overflow-hidden border border-line shrink-0 bg-bg/50">
            <AssetImage assetKey="feature-themes" className="w-full h-full object-cover object-top" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
