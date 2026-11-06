"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertRoom, deleteRoom } from "@/lib/actions/master-data-actions";
import { AssetImage } from "@/components/ui/asset-image";
import { Plus, Search, Trash2, Edit2, Building2, Users } from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  type: "CLASSROOM" | "LAB" | "OTHER";
  capacity: number;
}

export function RoomManager({ initialRooms }: { initialRooms: RoomData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"CLASSROOM" | "LAB" | "OTHER">("CLASSROOM");
  const [capacity, setCapacity] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setType("CLASSROOM");
    setCapacity(40);
    setModalOpen(true);
  };

  const openEdit = (r: RoomData) => {
    setEditingId(r.id);
    setName(r.name);
    setType(r.type);
    setCapacity(r.capacity);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertRoom({
        id: editingId || undefined,
        name,
        type,
        capacity,
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete room "${name}"? Placed timetable lessons will have their room unassigned.`)) {
      await deleteRoom(id);
      router.refresh();
    }
  };

  const filtered = initialRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search rooms and facilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus:border-accent outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-bg text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-rooms" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-ink">No rooms registered</h3>
          <p className="text-muted text-xs max-w-xs mt-1">
            Configure lecture halls, classrooms, and specialized laboratory facilities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-line bg-surface flex flex-col justify-between hover:border-line/80 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      r.type === "LAB"
                        ? "bg-accent/10 text-accent"
                        : r.type === "CLASSROOM"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-line/50 text-muted"
                    }`}
                  >
                    {r.type}
                  </span>
                  <span className="font-mono text-xs text-muted flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{r.capacity} seats</span>
                  </span>
                </div>

                <h4 className="font-bold text-ink text-base leading-snug">{r.name}</h4>
              </div>

              <div className="mt-5 pt-3 border-t border-line/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(r)}
                  className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                  title="Edit room"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id, r.name)}
                  className="p-1.5 rounded-lg text-muted hover:text-conflict hover:bg-conflict/10 transition-colors"
                  title="Delete room"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSave}
            className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-lg text-ink">
              {editingId ? "Edit Room Details" : "Register Room"}
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Room Label / Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hall 101 or Computer Lab 2"
                className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "CLASSROOM" | "LAB" | "OTHER")
                  }
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  <option value="CLASSROOM">Classroom</option>
                  <option value="LAB">Laboratory</option>
                  <option value="OTHER">Other Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-line text-ink text-xs font-semibold hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm"
              >
                {isSubmitting ? "Saving..." : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

