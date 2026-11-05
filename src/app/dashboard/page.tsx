"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetImage } from "@/components/ui/asset-image";

export default function DashboardPage() {
  return (
    <AppShell title="Department Overview — Computer Science">
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">Workspace Status</span>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">Academic Year 2026/27</h2>
        </div>

        <div className="p-8 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-timetable" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-semibold text-ink">Setup wizard awaits database connection</h3>
          <p className="text-muted text-xs max-w-sm mt-1">
            In Phase 1, we will configure the institution profile, periods per day, and break placements.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

