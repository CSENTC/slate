import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  getAllocations,
  getClasses,
  getSubjects,
  getTeachers,
} from "@/lib/actions/master-data-actions";
import { getWorkspace } from "@/lib/actions/workspace-actions";
import { AllocationManager } from "@/components/masters/allocation-manager";
import { MasterDataToolbar } from "@/components/masters/master-toolbar";

export const dynamic = "force-dynamic";

export default async function AllocationsPage() {
  const [allocations, classes, subjects, teachers, workspace] = await Promise.all([
    getAllocations(),
    getClasses(),
    getSubjects(),
    getTeachers(),
    getWorkspace(),
  ]);

  const workingDaysCount = workspace?.workingDays.length || 5;
  const periodsPerDayCount = workspace?.periods.filter((p) => !p.isBreak).length || 7;

  return (
    <AppShell title="Curriculum & Teaching Allocations">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Master Data
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Curriculum Allocations
            </h2>
          </div>

          <MasterDataToolbar />
        </div>

        <AllocationManager
          initialAllocations={allocations}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          workingDaysCount={workingDaysCount}
          periodsPerDayCount={periodsPerDayCount}
        />
      </div>
    </AppShell>
  );
}
