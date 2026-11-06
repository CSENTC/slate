import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getRooms } from "@/lib/actions/master-data-actions";
import { RoomManager } from "@/components/masters/room-manager";
import { MasterDataToolbar } from "@/components/masters/master-toolbar";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <AppShell title="Campus Facilities & Laboratories">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Master Data
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
              Rooms & Laboratories
            </h2>
          </div>

          <MasterDataToolbar />
        </div>

        <RoomManager initialRooms={rooms} />
      </div>
    </AppShell>
  );
}
