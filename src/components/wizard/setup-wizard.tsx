"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SetupWizardValues,
  BreakConfig,
  generateDaySchedule,
} from "@/lib/scheduling/setup-schema";
import { saveWorkspaceSettings } from "@/lib/actions/workspace-actions";
import { ScheduleLiveStrip } from "./schedule-live-strip";
import { AssetImage } from "@/components/ui/asset-image";
import { Logo } from "@/components/brand/Logo";
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
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

interface SetupWizardProps {
  initialValues?: Partial<SetupWizardValues>;
  isSettingsMode?: boolean;
}

export function SetupWizard({
  initialValues,
  isSettingsMode = false,
}: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Computed schedule preview strip
  const previewSlots = useMemo(() => {
    return generateDaySchedule({
      dayStartTime,
      periodsPerDay,
      defaultPeriodMinutes,
      breaks,
    });
  }, [dayStartTime, periodsPerDay, defaultPeriodMinutes, breaks]);

  // Working day toggle
  const toggleDay = (dayId: number) => {
    if (workingDays.includes(dayId)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== dayId));
      }
    } else {
      setWorkingDays([...workingDays, dayId].sort());
    }
  };

  // Add / remove break
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
    setBreaks(
      breaks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  // Submission handler
  const handleComplete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await saveWorkspaceSettings({
      institutionName,
      academicYear,
      workingDays,
      periodsPerDay,
      dayStartTime,
      defaultPeriodMinutes,
      breaks,
    });

    if (result.success) {
      if (isSettingsMode) {
        router.refresh();
      } else {
        router.push("/builder");
      }
    } else {
      setErrorMessage(result.error || "Unable to save workspace settings.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-bg text-ink">
      {/* Left Editorial Visual Side */}
      <div className="lg:col-span-4 border-r border-line bg-surface/60 p-8 flex flex-col justify-between hidden lg:flex select-none">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Logo variant="lockup" size={40} href="/" />
          </div>

          <span className="font-mono text-[11px] text-accent uppercase tracking-wider font-semibold">
            {isSettingsMode ? "Configuration Manager" : `Step ${step} of 4`}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-ink mt-2">
            {step === 1 && "Define the Institution"}
            {step === 2 && "Active Teaching Days"}
            {step === 3 && "Daily Rhythm & Slots"}
            {step === 4 && "Intermissions & Breaks"}
          </h2>
          <p className="text-muted text-xs leading-relaxed mt-2">
            {step === 1 &&
              "Every schedule is anchored to your academic calendar. These labels appear on exported PDFs and timetable publications."}
            {step === 2 &&
              "Toggle the days where scheduled lessons occur. Master allocations and teacher availability automatically align to this scope."}
            {step === 3 &&
              "Set the daily start time, slot count, and default lesson duration in minutes."}
            {step === 4 &&
              "Designate custom intermissions (such as lunch or morning tea) placed neatly between periods."}
          </p>

          <div className="w-full mt-8 rounded-2xl overflow-hidden border border-line bg-bg/50 p-4">
            <AssetImage assetKey="setup-side" className="w-full h-auto object-cover rounded-xl" />
          </div>
        </div>

        <div className="pt-6 border-t border-line font-mono text-[10px] text-muted flex items-center justify-between">
          <span>Deterministic Scheduler v1</span>
          <span>Zero-conflict guarantee</span>
        </div>
      </div>

      {/* Right Interactive Form Area */}
      <div className="lg:col-span-8 p-6 md:p-12 flex flex-col justify-between">
        <div>
          {/* Step Indicators */}
          <div className="flex items-center gap-2 mb-8 border-b border-line pb-4">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  step === s
                    ? "bg-accent text-white font-semibold"
                    : s < step
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span>0{s}</span>
                <span className="hidden sm:inline">
                  {s === 1 && "Institution"}
                  {s === 2 && "Working Days"}
                  {s === 3 && "Periods"}
                  {s === 4 && "Breaks"}
                </span>
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-conflict bg-conflict/10 text-conflict text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* Step 1: Institution Details */}
          {step === 1 && (
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
                    placeholder="e.g. Cambridge School of Computing"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-surface text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
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
                    placeholder="e.g. 2026/27 — Semester 1 (Autumn)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-surface text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Working Days */}
          {step === 2 && (
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                  Select Active Days
                </label>
                <p className="text-xs text-muted mb-4">
                  Choose which days of the week timetable periods are generated for.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {WEEKDAYS.map((day) => {
                    const isSelected = workingDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-accent bg-accent/10 text-accent font-semibold shadow-sm"
                            : "border-line bg-surface text-muted hover:border-line/80"
                        }`}
                      >
                        <div className="font-mono text-sm">{day.label}</div>
                        <div className="text-[11px] opacity-70 mt-0.5">{day.full}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Periods & Times */}
          {step === 3 && (
            <div className="space-y-6 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                    Periods Per Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={periodsPerDay}
                    onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface text-ink text-sm focus:border-accent outline-none font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                    Day Start Time
                  </label>
                  <input
                    type="time"
                    value={dayStartTime}
                    onChange={(e) => setDayStartTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus:border-accent outline-none font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                    Period Length (Min)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    step={5}
                    value={defaultPeriodMinutes}
                    onChange={(e) => setDefaultPeriodMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface text-ink text-sm focus:border-accent outline-none font-mono font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Breaks Configuration */}
          {step === 4 && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted">
                    Scheduled Breaks
                  </label>
                  <p className="text-xs text-muted mt-0.5">
                    Insert Lunch, Tea, or Assemblies after specific periods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addBreak}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent text-ink text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" />
                  <span>Add Break</span>
                </button>
              </div>

              <div className="space-y-3">
                {breaks.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-line bg-surface flex flex-wrap items-center gap-4"
                  >
                    <div className="flex-1 min-w-[140px]">
                      <span className="text-[10px] font-mono text-muted uppercase">Label</span>
                      <input
                        type="text"
                        value={b.label}
                        onChange={(e) => updateBreak(b.id, { label: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-medium"
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
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
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
                          className="w-full px-2.5 py-1.5 rounded-lg border border-line bg-bg text-ink text-xs focus:border-accent outline-none font-mono"
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

          {/* Live Strip Preview (Shown on all steps for live clarity) */}
          <div className="mt-12 pt-8 border-t border-line">
            <ScheduleLiveStrip slots={previewSlots} />
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="mt-12 pt-6 border-t border-line flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface text-ink text-xs font-semibold hover:bg-bg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-bg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all shadow-md hover:shadow-accent/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? "Saving to database..."
                  : isSettingsMode
                  ? "Update Timetable Settings"
                  : "Complete Setup & Launch Builder"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

