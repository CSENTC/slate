"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AssetImage } from "@/components/ui/asset-image";

export default function SubjectsPage() {
  return (
    <AppShell title="Subject Catalog">
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <div className="w-56 h-40 mb-4">
          <AssetImage assetKey="empty-subjects" className="w-full h-full object-contain" />
        </div>
        <h3 className="font-bold text-ink text-lg">No subjects registered yet</h3>
        <p className="text-muted text-xs max-w-sm mt-1">
          Theory and lab subjects will be managed here with custom color swatches in Phase 2.
        </p>
      </div>
    </AppShell>
  );
}

