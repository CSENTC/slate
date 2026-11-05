"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetImage } from "@/components/ui/asset-image";
import { Sparkles, Play, ShieldAlert } from "lucide-react";

export default function BuilderPage() {
  return (
    <AppShell title="Slate Timetable Builder — Class CSE-3A">
      {/* Small Screen Warning */}
      <div className="lg:hidden m-6 p-4 rounded-xl border border-warning/40 bg-warning/10 text-ink flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold">Desktop display recommended</p>
          <p className="text-muted mt-1">
            The full weekly conflict grid is optimized for wide screens (1024px+). On smaller screens, you can still view masters and settings.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="w-56 h-40 mb-6">
            <AssetImage assetKey="empty-timetable" className="w-full h-full object-contain" />
          </div>

          <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
            Builder Canvas Initialized
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-2">
            Ready for Scheduling Engine (Phase 3)
          </h2>
          <p className="text-muted text-xs leading-relaxed mt-2">
            The design tokens, app rail, top bar, and theme sync are fully active. Next, Phase 1 will connect our PostgreSQL schema and onboarding wizard.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

