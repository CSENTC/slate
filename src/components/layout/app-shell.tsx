import React from "react";
import { AppRail } from "./app-rail";
import { AppTopBar } from "./app-top-bar";

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink">
      <AppRail />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AppTopBar title={title} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

