import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getWorkspace } from "@/lib/actions/workspace-actions";
import { SettingsManagerView } from "@/components/masters/settings-manager-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const workspace = await getWorkspace();

  const initialValues = workspace
    ? {
        institutionName: workspace.name,
        academicYear: workspace.academicYear,
        workingDays: workspace.workingDays,
        periodsPerDay: workspace.periods.filter((p) => !p.isBreak).length || 7,
        dayStartTime: workspace.periods[0]?.startTime || "09:00",
        defaultPeriodMinutes: 50,
        breaks: workspace.periods
          .filter((p) => p.isBreak)
          .map((b) => ({
            id: b.id,
            label: b.label,
            afterPeriod: 4,
            durationMinutes: 45,
          })),
      }
    : undefined;

  return (
    <AppShell title="Institution & Schedule Settings">
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <SettingsManagerView initialValues={initialValues} />
      </div>
    </AppShell>
  );
}
