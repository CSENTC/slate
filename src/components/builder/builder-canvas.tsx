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
import { useBuilderStore, AllocationWithMeta } from "@/lib/scheduling/builder-store";
import { PlacedLesson } from "@/lib/scheduling/rules";
import { syncScheduleEntries } from "@/lib/actions/builder-actions";
import { BuilderToolbar } from "./builder-toolbar";
import { LessonTray } from "./lesson-tray";
import { TimetableGrid } from "./timetable-grid";
import { IssuesPanel } from "./issues-panel";
import { WorkloadPanel } from "./workload-panel";
import { PlacedLessonCard } from "./placed-lesson-card";
import { BookOpen, AlertCircle } from "lucide-react";

interface BuilderCanvasProps {
  initialData: any;
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

  // Initialize store once when component mounts
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

  // Debounced Autosave effect
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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
    }, 1500); // 1.5s debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [lessons, hasUnsavedChanges, setSaving, markSaved]);

  // Sensors for Drag and Drop
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!data) return;

    if (data.type === "TRAY_ITEM") {
      setActiveDragItem({
        type: "TRAY_ITEM",
        allocation: data.allocation,
      });
    } else if (data.type === "PLACED_LESSON") {
      setActiveDragItem({
        type: "PLACED_LESSON",
        lesson: data.lesson,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const overData = over.data.current;
    const activeData = active.data.current;

    if (!activeData || !overData) return;

    // 1. Dragging from tray to timetable cell
    if (activeData.type === "TRAY_ITEM" && overData.type === "TIMETABLE_CELL") {
      placeLesson({
        allocationId: activeData.allocation.id,
        day: overData.day,
        startPeriod: overData.periodPosition,
      });
      return;
    }

    // 2. Dragging existing placed lesson to another timetable cell
    if (activeData.type === "PLACED_LESSON" && overData.type === "TIMETABLE_CELL") {
      moveLesson({
        lessonId: activeData.lesson.id,
        day: overData.day,
        startPeriod: overData.periodPosition,
      });
      return;
    }

    // 3. Dragging placed lesson back to tray dropzone to unplace
    if (activeData.type === "PLACED_LESSON" && overData.type === "TRAY_DROPZONE") {
      unplaceLesson(activeData.lesson.id);
      return;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-bg">
        {/* Top Builder Control Toolbar */}
        <BuilderToolbar />

        {/* Main Work Area: Tray on Left, Grid in Center, Issues on Right */}
        <div className="flex flex-1 overflow-hidden relative">
          <LessonTray />
          <TimetableGrid />
          <IssuesPanel />
        </div>

        {/* Bottom Workload & Balance Bar */}
        <WorkloadPanel />

        {/* Drag Overlay for smooth preview cursor movement */}
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

          {activeDragItem?.type === "PLACED_LESSON" && activeDragItem.lesson && (
            <div className="w-48 shadow-2xl opacity-90 scale-105 pointer-events-none">
              <PlacedLessonCard lesson={activeDragItem.lesson} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
