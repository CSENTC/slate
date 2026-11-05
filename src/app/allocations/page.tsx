"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetImage } from "@/components/ui/asset-image";

export default function AllocationsPage() {
  return (
    <AppShell title="Subject & Faculty Allocations">
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <div className="w-56 h-40 mb-4">
          <AssetImage assetKey="empty-allocations" className="w-full h-full object-contain" />
        </div>
        <h3 className="font-bold text-ink text-lg">No curriculum allocations mapped</h3>
        <p className="text-muted text-xs max-w-sm mt-1">
          Assign teacher workloads, periods per week, block sizes (1 or 2), and required room types.
        </p>
      </div>
    </AppShell>
  );
}

