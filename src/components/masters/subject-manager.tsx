"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertSubject, deleteSubject } from "@/lib/actions/master-data-actions";
import { SUBJECT_PALETTE } from "@/lib/scheduling/master-schema";
import { AssetImage } from "@/components/ui/asset-image";
import { Plus, Search, Trash2, Edit2, Check, BookOpen } from "lucide-react";

interface SubjectData {
  id: string;
  name: string;
  code: string;
  type: "THEORY" | "LAB";
  colour: string;
}

export function SubjectManager({ initialSubjects }: { initialSubjects: SubjectData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"THEORY" | "LAB">("THEORY");
  const [colour, setColour] = useState(SUBJECT_PALETTE[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setType("THEORY");
    setColour(SUBJECT_PALETTE[0]);
    setModalOpen(true);
  };

  const openEdit = (sub: SubjectData) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setType(sub.type);
    setColour(sub.colour);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertSubject({
        id: editingId || undefined,
        name,
        code,
        type,
        colour,
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete subject "${name}"? Placed lessons using this subject will also be removed.`)) {
      await deleteSubject(id);
      router.refresh();
    }
  };

  const filtered = initialSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search subjects or codes..."
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
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-subjects" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-ink">No subjects match your query</h3>
          <p className="text-muted text-xs max-w-xs mt-1">
            Create your curriculum subjects or click &quot;Load demo data&quot; above to populate the catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl border border-line bg-surface flex flex-col justify-between hover:border-line/80 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: sub.colour }}
                  />
                  <span
                    className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      sub.type === "LAB"
                        ? "bg-accent/10 text-accent"
                        : "bg-line/50 text-muted"
                    }`}
                  >
                    {sub.type}
                  </span>
                </div>

                <h4 className="font-bold text-ink text-sm leading-snug">{sub.name}</h4>
                <div className="font-mono text-xs text-muted mt-1">{sub.code}</div>
              </div>

              <div className="mt-5 pt-3 border-t border-line/50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(sub)}
                  className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                  title="Edit subject"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="p-1.5 rounded-lg text-muted hover:text-conflict hover:bg-conflict/10 transition-colors"
                  title="Delete subject"
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
              {editingId ? "Edit Subject" : "Create New Subject"}
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1">
                Subject Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CS401"
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "THEORY" | "LAB")}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab Session</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-2">
                Color Swatch
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColour(c)}
                    className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {colour === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
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
                {isSubmitting ? "Saving..." : "Save Subject"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

