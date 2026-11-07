import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getBuilderData } from "@/lib/actions/builder-actions";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const data = await getBuilderData();

  if (!data) {
    return (
      <AppShell title="Slate Timetable Builder">
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            No Active Workspace Found
          </h2>
          <p className="text-muted text-sm max-w-md mt-2">
            Please run the setup wizard to configure your academic timetable parameters.
          </p>
          <Link
            href="/setup"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            <span>Launch Setup Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Timetable Builder — ${data.workspace.academicYear}`}>
      <BuilderCanvas initialData={data} />
    </AppShell>
  );
}
