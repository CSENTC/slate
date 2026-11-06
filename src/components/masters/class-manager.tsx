"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertClass, deleteClass } from "@/lib/actions/master-data-actions";
import { AssetImage } from "@/components/ui/asset-image";
import { Plus, Search, Trash2, Edit2, GraduationCap, Building2 } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  studentCount: number;
  homeRoomId: string | null;
  homeRoom?: { name: string } | null;
  allocations: any[];
}

export function ClassManager({
  initialClasses,
  rooms,
}: {
  initialClasses: ClassData[];
  rooms: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [studentCount, setStudentCount] = useState(30);
  const [homeRoomId, setHomeRoomId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setStudentCount(30);
    setHomeRoomId("");
    setModalOpen(true);
  };

  const openEdit = (c: ClassData) => {
    setEditingId(c.id);
    setName(c.name);
    setStudentCount(c.studentCount);
    setHomeRoomId(c.homeRoomId || "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertClass({
        id: editingId || undefined,
        name,
        studentCount,
        homeRoomId: homeRoomId || null,
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save class group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete class "${name}"? All subject allocations and placed lessons will be removed.`)) {
      await deleteClass(id);
      router.refresh();
    }
  };

  const filtered = initialClasses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search classes or cohorts..."
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
          <span>Add Class Section</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-classes" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-ink">No class groups defined</h3>
          <p className="text-muted text-xs max-w-xs mt-1">
            Create student cohorts (sections) and configure cohort sizes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-line bg-surface flex flex-col justify-between hover:border-line/80 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent">
                    Cohort
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {c.studentCount} students
                  </span>
                </div>

                <h4 className="font-bold text-ink text-lg leading-snug">{c.name}</h4>

                {c.homeRoom && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted mt-2">
                    <Building2 className="w-3.5 h-3.5 text-accent" />
                    <span>Home Room: {c.homeRoom.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-line/50 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted">
                  {c.allocations.length} allocations
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                    title="Edit class"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 rounded-lg text-muted hover:text-conflict hover:bg-conflict/10 transition-colors"
                    title="Delete class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
              {editingId ? "Edit Class Section" : "Register Class Section"}
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Class / Section Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CSE-3A"
                className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Enrolled Students
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  required
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Home Room (Optional)
                </label>
                <select
                  value={homeRoomId}
                  onChange={(e) => setHomeRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  <option value="">None / Flexible</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
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
                {isSubmitting ? "Saving..." : "Save Class"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

