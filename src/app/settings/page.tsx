import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getWorkspace } from "@/lib/actions/workspace-actions";
import { SetupWizard } from "@/components/wizard/setup-wizard";

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
          .map((b, idx) => ({
            id: b.id,
            label: b.label,
            afterPeriod: 4, // default anchor
            durationMinutes: 45,
          })),
      }
    : undefined;

  return (
    <AppShell title="Institution & Schedule Settings">
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <SetupWizard initialValues={initialValues} isSettingsMode={true} />
      </div>
    </AppShell>
  );
}
