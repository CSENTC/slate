"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { upsertAllocation, deleteAllocation } from "@/lib/actions/master-data-actions";
import {
  calculateClassSlotTotals,
  calculateTeacherWorkloads,
} from "@/lib/scheduling/master-calculations";
import { AssetImage } from "@/components/ui/asset-image";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertTriangle,
  Layers,
  Clock,
  Building2,
  Users,
} from "lucide-react";

interface AllocationData {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodsPerWeek: number;
  blockSize: number;
  roomType: "CLASSROOM" | "LAB" | "OTHER";
  maxPerDay: number | null;
  class: { id: string; name: string };
  subject: { id: string; name: string; code: string; colour: string; type: string };
  teacher: { id: string; name: string; code: string; maxPerWeek: number };
}

export function AllocationManager({
  initialAllocations,
  classes,
  subjects,
  teachers,
  workingDaysCount = 5,
  periodsPerDayCount = 7,
}: {
  initialAllocations: AllocationData[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string; code: string; type: string; colour: string }[];
  teachers: { id: string; name: string; code: string; maxPerWeek: number }[];
  workingDaysCount?: number;
  periodsPerDayCount?: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || "");
  const [periodsPerWeek, setPeriodsPerWeek] = useState(4);
  const [blockSize, setBlockSize] = useState(1);
  const [roomType, setRoomType] = useState<"CLASSROOM" | "LAB" | "OTHER">("CLASSROOM");
  const [maxPerDay, setMaxPerDay] = useState<number | "">(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Totals & Warnings
  const classSlotTotals = useMemo(() => {
    return calculateClassSlotTotals({
      classes,
      allocations: initialAllocations,
      workingDaysCount,
      periodsPerDayCount,
    });
  }, [classes, initialAllocations, workingDaysCount, periodsPerDayCount]);

  const teacherWorkloads = useMemo(() => {
    return calculateTeacherWorkloads({
      teachers,
      allocations: initialAllocations,
    });
  }, [teachers, initialAllocations]);

  const openNew = () => {
    setEditingId(null);
    setClassId(classes[0]?.id || "");
    setSubjectId(subjects[0]?.id || "");
    setTeacherId(teachers[0]?.id || "");
    setPeriodsPerWeek(4);
    setBlockSize(1);
    setRoomType("CLASSROOM");
    setMaxPerDay(1);
    setModalOpen(true);
  };

  const openEdit = (a: AllocationData) => {
    setEditingId(a.id);
    setClassId(a.classId);
    setSubjectId(a.subjectId);
    setTeacherId(a.teacherId);
    setPeriodsPerWeek(a.periodsPerWeek);
    setBlockSize(a.blockSize);
    setRoomType(a.roomType);
    setMaxPerDay(a.maxPerDay ?? "");
    setModalOpen(true);
  };

  const handleSubjectChange = (subId: string) => {
    setSubjectId(subId);
    const sub = subjects.find((s) => s.id === subId);
    if (sub && sub.type === "LAB") {
      setBlockSize(2);
      setRoomType("LAB");
    } else {
      setBlockSize(1);
      setRoomType("CLASSROOM");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertAllocation({
        id: editingId || undefined,
        classId,
        subjectId,
        teacherId,
        periodsPerWeek,
        blockSize,
        roomType,
        maxPerDay: maxPerDay === "" ? null : Number(maxPerDay),
      });
      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save allocation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this allocation? Associated placed timetable slots will be removed.")) {
      await deleteAllocation(id);
      router.refresh();
    }
  };

  const filtered = initialAllocations.filter((a) => {
    const matchesSearch =
      a.class.name.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.name.toLowerCase().includes(search.toLowerCase()) ||
      a.teacher.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass =
      selectedClassFilter === "ALL" || a.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8">
      {/* Overview Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Capacity Check */}
        <div className="p-5 rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
              Class Schedule Capacity
            </span>
            <span className="font-mono text-xs text-muted">
              {workingDaysCount * periodsPerDayCount} weekly slots
            </span>
          </div>

          <div className="space-y-2.5">
            {classSlotTotals.map((tot) => (
              <div key={tot.classId} className="flex items-center justify-between text-xs font-mono">
                <span className="font-medium text-ink">{tot.className}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      tot.isOverCapacity
                        ? "text-conflict font-bold"
                        : "text-muted"
                    }
                  >
                    {tot.totalPeriodsRequired} / {tot.availableWeeklySlots} slots
                  </span>
                  {tot.isOverCapacity && (
                    <span className="p-0.5 rounded bg-conflict/10 text-conflict" title="Exceeds available periods">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Workload Check */}
        <div className="p-5 rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
              Faculty Workload Quotas
            </span>
            <span className="font-mono text-xs text-muted">Weekly limit check</span>
          </div>

          <div className="space-y-2.5 max-h-40 overflow-y-auto scrollbar-none pr-1">
            {teacherWorkloads.map((tw) => (
              <div key={tw.teacherId} className="flex items-center justify-between text-xs font-mono">
                <span className="font-medium text-ink">
                  {tw.teacherName} ({tw.teacherCode})
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      tw.isOverAllocated
                        ? "text-conflict font-bold"
                        : "text-muted"
                    }
                  >
                    {tw.allocatedPeriods} / {tw.maxPerWeek}h
                  </span>
                  {tw.isOverAllocated && (
                    <span className="p-0.5 rounded bg-conflict/10 text-conflict" title="Faculty max limit exceeded">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search allocations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus:border-accent outline-none"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus:border-accent outline-none font-mono"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openNew}
          disabled={classes.length === 0 || subjects.length === 0 || teachers.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-bg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Allocation</span>
        </button>
      </div>

      {/* Allocation List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-line bg-surface flex flex-col items-center text-center">
          <div className="w-48 h-36 mb-4">
            <AssetImage assetKey="empty-allocations" className="w-full h-full object-contain" />
          </div>
          <h3 className="font-bold text-ink">No allocations match your criteria</h3>
          <p className="text-muted text-xs max-w-xs mt-1">
            Map which faculty member teaches which subject to each class section.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-bg/50 font-mono text-[10px] uppercase text-muted tracking-wider">
                <tr>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Weekly Periods</th>
                  <th className="py-3 px-4">Block Size</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-bg/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-ink">
                      {a.class.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: a.subject.colour }}
                        />
                        <span className="font-semibold text-ink">{a.subject.name}</span>
                        <span className="font-mono text-[10px] text-muted">
                          ({a.subject.code})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {a.teacher.name}{" "}
                      <span className="font-mono text-muted text-[10px]">
                        ({a.teacher.code})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-ink">
                      {a.periodsPerWeek}h / wk
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {a.blockSize === 2 ? (
                        <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-semibold text-[10px]">
                          Double (2h)
                        </span>
                      ) : (
                        <span className="text-muted text-[11px]">Single (1h)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted">
                      {a.roomType}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded-lg text-muted hover:text-conflict hover:bg-conflict/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSave}
            className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-lg text-ink">
              {editingId ? "Edit Allocation" : "Create Subject Allocation"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Class Section
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Assigned Faculty
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Required Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) =>
                    setRoomType(e.target.value as "CLASSROOM" | "LAB" | "OTHER")
                  }
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  <option value="CLASSROOM">Classroom</option>
                  <option value="LAB">Lab Facility</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Periods / Wk
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Block Size
                </label>
                <select
                  value={blockSize}
                  onChange={(e) => setBlockSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
                >
                  <option value={1}>1 (Single period)</option>
                  <option value={2}>2 (Consecutive double)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                  Max / Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="None"
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
                {isSubmitting ? "Saving..." : "Save Allocation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

