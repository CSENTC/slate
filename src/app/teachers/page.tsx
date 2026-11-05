"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetImage } from "@/components/ui/asset-image";

export default function TeachersPage() {
  return (
    <AppShell title="Faculty Roster">
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <div className="w-56 h-40 mb-4">
          <AssetImage assetKey="empty-teachers" className="w-full h-full object-contain" />
        </div>
        <h3 className="font-bold text-ink text-lg">No teachers enrolled</h3>
        <p className="text-muted text-xs max-w-sm mt-1">
          Faculty max periods per day/week, consecutive constraints, and availability grids are set here.
        </p>
      </div>
    </AppShell>
  );
}

