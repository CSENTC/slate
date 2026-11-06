"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SetupWizardValues,
  BreakConfig,
  generateDaySchedule,
} from "@/lib/scheduling/setup-schema";
import {
  saveWorkspaceSettings,
  checkSettingsImpact,
} from "@/lib/actions/workspace-actions";
import { ScheduleLiveStrip } from "@/components/wizard/schedule-live-strip";
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Settings as SettingsIcon,
  HelpCircle,
} from "lucide-react";

const WEEKDAYS = [
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
  { id: 7, label: "Sun", full: "Sunday" },
];

export function SettingsManagerView({
  initialValues,
}: {
  initialValues?: Partial<SetupWizardValues>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"institution" | "schedule" | "breaks">("schedule");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [impactWarning, setImpactWarning] = useState<{
    count: number;
    lessons: any[];
  } | null>(null);

  // Form State
  const [institutionName, setInstitutionName] = useState(
    initialValues?.institutionName || "Faculty of Computer Science & Engineering"
  );
  const [academicYear, setAcademicYear] = useState(
    initialValues?.academicYear || "2026/27 — Semester 1"
  );
  const [workingDays, setWorkingDays] = useState<number[]>(
    initialValues?.workingDays || [1, 2, 3, 4, 5]
  );
  const [periodsPerDay, setPeriodsPerDay] = useState<number>(
    initialValues?.periodsPerDay || 7
  );
  const [dayStartTime, setDayStartTime] = useState<string>(
    initialValues?.dayStartTime || "09:00"
  );
  const [defaultPeriodMinutes, setDefaultPeriodMinutes] = useState<number>(
    initialValues?.defaultPeriodMinutes || 50
  );
  const [breaks, setBreaks] = useState<BreakConfig[]>(
    initialValues?.breaks || [
      { id: "b1", label: "Lunch", afterPeriod: 4, durationMinutes: 50 },
    ]
  );

  const previewSlots = useMemo(() => {
    return generateDaySchedule({
      dayStartTime,
      periodsPerDay,
      defaultPeriodMinutes,
      breaks,
    });
  }, [dayStartTime, periodsPerDay, defaultPeriodMinutes, breaks]);

  const toggleDay = (dayId: number) => {
    if (workingDays.includes(dayId)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== dayId));
      }
    } else {
      setWorkingDays([...workingDays, dayId].sort());
    }
  };

  const addBreak = () => {
    const nextAfter = Math.min(periodsPerDay, Math.max(1, Math.floor(periodsPerDay / 2)));
    setBreaks([
      ...breaks,
      {
        id: `b_${Date.now()}`,
        label: "Short Break",
        afterPeriod: nextAfter,
        durationMinutes: 15,
      },
    ]);
  };

  const removeBreak = (id: string) => {
    setBreaks(breaks.filter((b) => b.id !== id));
  };

  const updateBreak = (id: string, updates: Partial<BreakConfig>) => {
    setBreaks(breaks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const handlePreSaveCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Audit if changes affect existing scheduled entries
    const impact = await checkSettingsImpact({
      workingDays,
      maxPeriods: periodsPerDay,
    });

    if (impact.affectedEntriesCount > 0) {
      setImpactWarning({
        count: impact.affectedEntriesCount,
        lessons: impact.affectedLessons,
      });
      setIsSubmitting(false);
      return;
    }

    await executeSave();
  };

  const executeSave = async () => {
    setIsSubmitting(true);
    setImpactWarning(null);

    const result = await saveWorkspaceSettings({
      institutionName,
      academicYear,
      workingDays,
      periodsPerDay,
      dayStartTime,
      defaultPeriodMinutes,
      breaks,
    });

    setIsSubmitting(false);
    if (result.success) {
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
      router.refresh();
    } else {
      alert(result.error || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Workspace Configuration
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Institution & Schedule Settings
          </h2>
          <p className="text-xs text-muted mt-1">
            Manage academic term dates, active days of instruction, period architecture, and breaks.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePreSaveCheck}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm hover:shadow-accent/20 disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving changes..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "schedule"
              ? "bg-ink text-bg font-bold shadow-sm"
              : "text-muted hover:text-ink hover:bg-surface"
          }`}
        >
          Daily Rhythm & Periods
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("breaks")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "breaks"
              ? "bg-ink text-bg font-bold shadow-sm"
              : "text-muted hover:text-ink hover:bg-surface"
          }`}
        >
          Breaks & Intermissions ({breaks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("institution")}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === "institution"
              ? "bg-ink text-bg font-bold shadow-sm"
              : "text-muted hover:text-ink hover:bg-surface"
          }`}
        >
          Institution Details
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-line bg-surface shadow-sm">
        {/* Tab 1: Schedule & Working Days */}
        {activeTab === "schedule" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-ink uppercase font-mono tracking-wider mb-1">
                Active Teaching Days
              </h3>
              <p className="text-xs text-muted mb-4">
                Select which days classes take place. The builder grid creates columns for these days.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {WEEKDAYS.map((day) => {
                  const isSelected = workingDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-accent bg-accent/10 text-accent font-semibold shadow-sm"
                          : "border-line bg-bg/50 text-muted hover:border-line/80"
                      }`}
                    >
                      <div className="font-mono text-xs">{day.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{day.full}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-line/60">
              <h3 className="text-sm font-bold text-ink uppercase font-mono tracking-wider mb-1">
                Period Timings
              </h3>
              <p className="text-xs text-muted mb-4">
                Define the count and duration of teaching slots.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-2">
                    Periods Per Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={periodsPerDay}
                    onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-2">
                    Day Start Time
                  </label>
                  <input
                    type="time"
                    value={dayStartTime}
                    onChange={(e) => setDayStartTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted mb-2">
                    Slot Length (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    step={5}
                    value={defaultPeriodMinutes}
                    onChange={(e) => setDefaultPeriodMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Breaks */}
        {activeTab === "breaks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink uppercase font-mono tracking-wider mb-1">
                  Scheduled Intermissions
                </h3>
                <p className="text-xs text-muted">
                  Insert Lunch, Tea, or Assemblies after specific period slots.
                </p>
              </div>

              <button
                type="button"
                onClick={addBreak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-bg hover:border-accent text-ink text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-accent" />
                <span>Add Break</span>
              </button>
            </div>

            <div className="space-y-3 max-w-2xl">
              {breaks.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-line bg-bg flex flex-wrap items-center gap-4"
                >
                  <div className="flex-1 min-w-[140px]">
                    <span className="text-[10px] font-mono text-muted uppercase">Label</span>
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => updateBreak(b.id, { label: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-accent outline-none font-medium"
                    />
                  </div>

                  <div className="w-36">
                    <span className="text-[10px] font-mono text-muted uppercase">
                      After Period
                    </span>
                    <select
                      value={b.afterPeriod}
                      onChange={(e) =>
                        updateBreak(b.id, { afterPeriod: Number(e.target.value) })
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-accent outline-none font-mono"
                    >
                      {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>
                          Period {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <span className="text-[10px] font-mono text-muted uppercase">Duration</span>
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        step={5}
                        value={b.durationMinutes}
                        onChange={(e) =>
                          updateBreak(b.id, { durationMinutes: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-accent outline-none font-mono"
                      />
                      <span className="text-xs text-muted font-mono">m</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBreak(b.id)}
                    className="p-2 text-muted hover:text-conflict transition-colors mt-4"
                    title="Remove break"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Institution Details */}
        {activeTab === "institution" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Institution or Department Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-muted" />
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:border-accent outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Academic Year / Term Label
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-muted" />
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:border-accent outline-none font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Strip Schedule Calculation */}
        <div className="mt-8 pt-6 border-t border-line/60">
          <ScheduleLiveStrip slots={previewSlots} />
        </div>
      </div>

      {/* Impact Confirmation Modal */}
      {impactWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-warning">
              <span className="p-2 rounded-xl bg-warning/10">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-lg text-ink">Warning: Lessons will be affected</h3>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Reducing periods or days will invalidate{" "}
              <strong className="text-ink font-bold">{impactWarning.count}</strong> existing placed lessons in your timetable.
            </p>

            <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-bg border border-line text-[11px] font-mono space-y-1">
              {impactWarning.lessons.slice(0, 5).map((l, idx) => (
                <div key={idx} className="text-muted">
                  • {l.className}: {l.subjectName} ({l.teacherName}) on Day {l.day} P{l.startPeriod}
                </div>
              ))}
              {impactWarning.lessons.length > 5 && (
                <div className="text-muted/60">
                  ...and {impactWarning.lessons.length - 5} more
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setImpactWarning(null)}
                className="px-4 py-2 rounded-xl border border-line text-ink text-xs font-semibold hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm"
              >
                Confirm & Update Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-ink text-bg text-xs font-mono shadow-xl border border-line/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Timetable configuration updated successfully!</span>
        </div>
      )}
    </div>
  );
}

