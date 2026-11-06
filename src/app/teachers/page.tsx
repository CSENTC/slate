import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getTeachers } from "@/lib/actions/master-data-actions";
import { getWorkspace } from "@/lib/actions/workspace-actions";
import { TeacherManager } from "@/components/masters/teacher-manager";
import { MasterDataToolbar } from "@/components/masters/master-toolbar";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const [teachers, workspace] = await Promise.all([getTeachers(), getWorkspace()]);
  const periodsCount = workspace?.periods.filter((p) => !p.isBreak).length || 7;

  return (
    <AppShell title="Faculty Roster & Availability">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Master Data
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Faculty Staff
            </h2>
          </div>

          <MasterDataToolbar />
        </div>

        <TeacherManager initialTeachers={teachers} periodsPerDay={periodsCount} />
      </div>
    </AppShell>
  );
}
