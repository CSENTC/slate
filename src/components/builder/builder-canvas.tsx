"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useBuilderStore,
  AllocationWithMeta,
} from "@/lib/scheduling/builder-store";
import { PlacedLesson } from "@/lib/scheduling/rules";
import {
  syncScheduleEntries,
  runAutoGenerate,
  getBuilderData,
} from "@/lib/actions/builder-actions";
import { BuilderToolbar } from "./builder-toolbar";
import { LessonTray } from "./lesson-tray";
import { TimetableGrid } from "./timetable-grid";
import { IssuesPanel } from "./issues-panel";
import { WorkloadPanel } from "./workload-panel";
import { PlacedLessonCard } from "./placed-lesson-card";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface BuilderCanvasProps {
  initialData: any;
}

interface GenerateBanner {
  type: "success" | "partial" | "error";
  message: string;
}

export function BuilderCanvas({ initialData }: BuilderCanvasProps) {
  const {
    initialize,
    placeLesson,
    moveLesson,
    unplaceLesson,
    lessons,
    hasUnsavedChanges,
    setSaving,
    markSaved,
  } = useBuilderStore();

  const [activeDragItem, setActiveDragItem] = useState<{
    type: "TRAY_ITEM" | "PLACED_LESSON";
    allocation?: AllocationWithMeta;
    lesson?: PlacedLesson;
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateBanner, setGenerateBanner] = useState<GenerateBanner | null>(
    null
  );

  // ── Initialise store from server data ──────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      initialize({
        periods: initialData.periods,
        workingDays: initialData.workspace.workingDays,
        classes: initialData.classes,
        teachers: initialData.teachers,
        rooms: initialData.rooms,
        allocations: initialData.allocations,
        entries: initialData.entries,
      });
    }
  }, [initialData, initialize]);

  // ── Debounced Autosave ─────────────────────────────────────────────────────
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      const payload = {
        entries: lessons.map((l) => ({
          allocationId: l.allocationId,
          day: l.day,
          startPeriod: l.startPeriod,
          length: l.length,
          roomId: l.roomId || null,
          locked: l.locked || false,
        })),
      };

      const res = await syncScheduleEntries(payload);
      if (res.success) {
        markSaved();
      } else {
        setSaving(false);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [lessons, hasUnsavedChanges, setSaving, markSaved]);

  // ── Auto-Generate handler ──────────────────────────────────────────────────
  const handleAutoGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerateBanner(null);

    try {
      const result = await runAutoGenerate();

      if (result.error) {
        setGenerateBanner({ type: "error", message: result.error });
        return;
      }

      // Re-load fresh data from DB into the store
      const freshData = await getBuilderData();
      if (freshData) {
        initialize({
          periods: freshData.periods,
          workingDays: freshData.workspace.workingDays,
          classes: freshData.classes,
          teachers: freshData.teachers,
          rooms: freshData.rooms,
          allocations: freshData.allocations,
          entries: freshData.entries,
        });
      }

      if (result.unplacedCount > 0) {
        setGenerateBanner({
          type: "partial",
          message: `Generated ${result.placed} of ${result.total} sessions. ${result.unplacedCount} allocation${result.unplacedCount > 1 ? "s" : ""} could not be placed (over-constrained).`,
        });
      } else {
        setGenerateBanner({
          type: "success",
          message: `✓ Generated all ${result.placed} sessions with ${result.hardClashes} hard clashes.`,
        });
      }
    } catch (err: any) {
      setGenerateBanner({
        type: "error",
        message: err.message || "Generation failed",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerateBanner(null), 8000);
    }
  }, [initialize]);

  // ── DnD sensors ───────────────────────────────────────────────────────────
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!data) return;
    if (data.type === "TRAY_ITEM") {
      setActiveDragItem({ type: "TRAY_ITEM", allocation: data.allocation });
    } else if (data.type === "PLACED_LESSON") {
      setActiveDragItem({ type: "PLACED_LESSON", lesson: data.lesson });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    const overData = over.data.current;
    const activeData = active.data.current;
    if (!activeData || !overData) return;

    if (activeData.type === "TRAY_ITEM" && overData.type === "TIMETABLE_CELL") {
      placeLesson({
        allocationId: activeData.allocation.id,
        day: overData.day,
        startPeriod: overData.periodPosition,
      });
    } else if (
      activeData.type === "PLACED_LESSON" &&
      overData.type === "TIMETABLE_CELL"
    ) {
      moveLesson({
        lessonId: activeData.lesson.id,
        day: overData.day,
        startPeriod: overData.periodPosition,
      });
    } else if (
      activeData.type === "PLACED_LESSON" &&
      overData.type === "TRAY_DROPZONE"
    ) {
      unplaceLesson(activeData.lesson.id);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-bg relative">
        {/* Toolbar */}
        <BuilderToolbar
          onAutoGenerate={handleAutoGenerate}
          isGenerating={isGenerating}
        />

        {/* Generate Result Banner */}
        {generateBanner && (
          <div
            className={`px-6 py-2.5 flex items-center gap-3 text-sm font-medium border-b ${
              generateBanner.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : generateBanner.type === "partial"
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {generateBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : generateBanner.type === "partial" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{generateBanner.message}</span>
            <button
              type="button"
              onClick={() => setGenerateBanner(null)}
              className="ml-auto text-current opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Generating fullscreen overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-line bg-surface shadow-2xl">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping" />
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent)" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.816 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.816a2 2 0 00-1.272-1.272L3 12l5.816-1.916a2 2 0 001.272-1.272L12 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-ink text-lg">
                  Auto-Generating…
                </p>
                <p className="text-muted text-sm mt-1">
                  Solving constraints and placing lessons
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden relative">
          <LessonTray />
          <TimetableGrid />
          <IssuesPanel />
        </div>

        <WorkloadPanel />

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDragItem?.type === "TRAY_ITEM" && activeDragItem.allocation && (
            <div
              className="p-3 rounded-xl border border-accent bg-surface shadow-xl text-ink font-mono text-xs opacity-95 w-56"
              style={{
                borderLeftColor: activeDragItem.allocation.subject.colour,
                borderLeftWidth: "4px",
              }}
            >
              <span className="font-bold block">
                {activeDragItem.allocation.subject.name}
              </span>
              <span className="text-muted text-[10px]">
                {activeDragItem.allocation.teacher.name}
              </span>
            </div>
          )}
          {activeDragItem?.type === "PLACED_LESSON" &&
            activeDragItem.lesson && (
              <div className="w-48 shadow-2xl opacity-90 scale-105 pointer-events-none">
                <PlacedLessonCard lesson={activeDragItem.lesson} />
              </div>
            )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
