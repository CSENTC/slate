import React from "react";
import { getWorkspace } from "@/lib/actions/workspace-actions";
import { SetupWizard } from "@/components/wizard/setup-wizard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const workspace = await getWorkspace();

  // If already setup, redirect directly to dashboard or builder
  if (workspace?.setupDone) {
    redirect("/builder");
  }

  return <SetupWizard />;
}
