"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertTeacher, deleteTeacher } from "@/lib/actions/master-data-actions";
import { AssetImage } from "@/components/ui/asset-image";
import { Plus, Search, Trash2, Edit2, CalendarOff, Users } from "lucide-react";

interface TeacherData {
  id: string;
  name: string;
  code: string;
  maxPerDay: number;
  maxPerWeek: number;
  maxConsecutive: number;
  unavailability: { day: number; periodPosition: number }[];
}

const DAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
];

export function TeacherManager({
  initialTeachers,
  periodsPerDay = 7,
}: {
  initialTeachers: TeacherData[];
  periodsPerDay?: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [maxPerDay, setMaxPerDay] = useState(4);
  const [maxPerWeek, setMaxPerWeek] = useState(16);
  const [maxConsecutive, setMaxConsecutive] = useState(2);
  const [unavailabilities, setUnavailabilities] = useState<{ day: number; periodPosition: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setMaxPerDay(4);
    setMaxPerWeek(16);
    setMaxConsecutive(2);
    setUnavailabilities([]);
    setModalOpen(true);
  };

  const openEdit = (t: TeacherData) => {
    setEditingId(t.id);
    setName(t.name);
    setCode(t.code);
    setMaxPerDay(t.maxPerDay);
    setMaxPerWeek(t.maxPerWeek);
    setMaxConsecutive(t.maxConsecutive);
    setUnavailabilities(t.unavailability);
    setModalOpen(true);
  };

  const toggleUnavailabilitySlot = (day: number, periodPosition: number) => {
    const exists = unavailabilities.some(
      (u) => u.day === day && u.periodPosition === periodPosition
    );
    if (exists) {
      setUnavailabilities(
        unavailabilities.filter(
          (u) => !(u.day === day && u.periodPosition === periodPosition)
        )
      );
    } else {
      setUnavailabilities([...unavailabilities, { day, periodPosition }]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertTeacher({
        id: editingId || undefined,
        name,
        code,
        maxPerDay,
        maxPerWeek,
        maxConsecutive,
        unavailability: unavailabilities,
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from faculty roster? Their allocations will also be deleted.`)) {
      await deleteTeacher(id);
      router.refresh();
    }
  };

  const filtered = initialTeachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search faculty by name or code..."
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
          <span>Add Faculty Member</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-teachers" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-ink">No faculty found</h3>
          <p className="text-muted text-xs max-w-xs mt-1">
            Enroll your teaching staff and calibrate their daily and weekly quotas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl border border-line bg-surface flex flex-col justify-between hover:border-line/80 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                    {t.code}
                  </span>
                  {t.unavailability.length > 0 && (
                    <span className="font-mono text-[10px] text-muted flex items-center gap-1">
                      <CalendarOff className="w-3 h-3 text-warning" />
                      <span>{t.unavailability.length} blocked</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-ink text-sm leading-snug">{t.name}</h4>

                <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-line/40 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-bg">
                    <div className="text-[9px] text-muted uppercase">Daily</div>
                    <div className="text-xs font-bold text-ink">{t.maxPerDay}h</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-bg">
                    <div className="text-[9px] text-muted uppercase">Weekly</div>
                    <div className="text-xs font-bold text-ink">{t.maxPerWeek}h</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-bg">
                    <div className="text-[9px] text-muted uppercase">Consec</div>
                    <div className="text-xs font-bold text-ink">{t.maxConsecutive}h</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-line/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                  title="Edit faculty member"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id, t.name)}
                  className="p-1.5 rounded-lg text-muted hover:text-conflict hover:bg-conflict/10 transition-colors"
                  title="Delete faculty member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog with Availability Mini-Grid */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8"
          >
            <h3 className="font-bold text-lg text-ink">
              {editingId ? "Edit Faculty Profile" : "Add Faculty Member"}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Vikram Rao"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VR"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Max / Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Max / Week
                </label>
                <input
                  type="number"
                  min={1}
                  max={35}
                  value={maxPerWeek}
                  onChange={(e) => setMaxPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Max Consec
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={maxConsecutive}
                  onChange={(e) => setMaxConsecutive(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>
            </div>

            {/* Unavailability Mini-Grid */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase text-muted">
                  Availability Grid (Click slot to block)
                </label>
                <span className="text-[10px] font-mono text-conflict">
                  {unavailabilities.length} blocked
                </span>
              </div>

              <div className="border border-line rounded-xl p-3 bg-bg/50">
                <div className="grid grid-cols-6 gap-1.5 text-center font-mono text-[10px] text-muted mb-1">
                  <div>Period</div>
                  {DAYS.map((d) => (
                    <div key={d.id}>{d.label}</div>
                  ))}
                </div>

                <div className="space-y-1">
                  {Array.from({ length: Math.min(periodsPerDay, 8) }, (_, idx) => idx + 1).map(
                    (p) => (
                      <div key={p} className="grid grid-cols-6 gap-1.5 items-center">
                        <span className="font-mono text-[10px] text-muted text-center">
                          P{p}
                        </span>
                        {DAYS.map((d) => {
                          const isBlocked = unavailabilities.some(
                            (u) => u.day === d.id && u.periodPosition === p
                          );
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => toggleUnavailabilitySlot(d.id, p)}
                              className={`h-7 rounded-lg border text-[10px] font-mono transition-colors ${
                                isBlocked
                                  ? "border-conflict bg-conflict/20 text-conflict font-bold"
                                  : "border-line bg-surface hover:border-line/80 text-muted"
                              }`}
                              title={
                                isBlocked
                                  ? `${d.label} Period ${p} blocked`
                                  : `Click to mark ${d.label} Period ${p} unavailable`
                              }
                            >
                              {isBlocked ? "✕" : "✓"}
                            </button>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
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
                {isSubmitting ? "Saving..." : "Save Faculty"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

