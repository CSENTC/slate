"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell title="Timetable & Institution Settings">
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">Configuration</span>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">Institution Parameters</h2>
        </div>

        <div className="p-6 rounded-2xl border border-line bg-surface space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <div className="font-semibold text-sm text-ink">Institution Details</div>
              <div className="text-xs text-muted">College name, academic term label, and active working days</div>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
              Phase 1 Target
            </span>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <div className="font-semibold text-sm text-ink">Period Grid Architecture</div>
              <div className="text-xs text-muted">Periods per day, default slot length, and break positions</div>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
              Phase 1 Target
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

