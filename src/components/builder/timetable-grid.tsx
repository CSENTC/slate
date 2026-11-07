"use client";

import React, { useMemo } from "react";
import { useBuilderStore } from "@/lib/scheduling/builder-store";
import { TimetableCell } from "./timetable-cell";
import { PlacedLesson } from "@/lib/scheduling/rules";
import { Clock } from "lucide-react";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimetableGrid() {
  const {
    periods,
    workingDays,
    viewMode,
    selectedEntityId,
    lessons,
    issues,
    highlightedCell,
    unplaceLesson,
    toggleLockLesson,
  } = useBuilderStore();

  // Filter lessons displayed based on active view mode
  const displayedLessons = useMemo(() => {
    if (!selectedEntityId) return [];
    if (viewMode === "BY_CLASS") {
      return lessons.filter((l) => l.classId === selectedEntityId);
    }
    if (viewMode === "BY_TEACHER") {
      return lessons.filter((l) => l.teacherId === selectedEntityId);
    }
    if (viewMode === "BY_ROOM") {
      return lessons.filter((l) => l.roomId === selectedEntityId);
    }
    return lessons;
  }, [lessons, viewMode, selectedEntityId]);

  // Index lessons by `${day}-${startPeriod}`
  const lessonBySlot = useMemo(() => {
    const map = new Map<string, PlacedLesson>();
    for (const l of displayedLessons) {
      map.set(`${l.day}-${l.startPeriod}`, l);
    }
    return map;
  }, [displayedLessons]);

  // Index double spans: slot `${day}-${pos}` occupied by a block starting at pos-1 with length > 1
  const doubleOccupiedSlots = useMemo(() => {
    const set = new Set<string>();
    for (const l of displayedLessons) {
      if (l.length > 1) {
        for (let i = 1; i < l.length; i++) {
          set.add(`${l.day}-${l.startPeriod + i}`);
        }
      }
    }
    return set;
  }, [displayedLessons]);

  // Map issues by lesson ID for badge highlighting
  const issuesByLesson = useMemo(() => {
    const hardMap = new Set<string>();
    const softMap = new Set<string>();
    for (const issue of issues) {
      for (const id of issue.lessonIds) {
        if (issue.severity === "HARD") hardMap.add(id);
        else softMap.add(id);
      }
    }
    return { hardMap, softMap };
  }, [issues]);

  return (
    <div className="flex-1 overflow-auto p-6 bg-bg select-none">
      <div className="min-w-[800px] border border-line rounded-2xl bg-surface/40 p-4 shadow-xs">
        {/* Days Header Row */}
        <div
          className="grid gap-3 mb-3"
          style={{
            gridTemplateColumns: `100px repeat(${workingDays.length}, minmax(130px, 1fr))`,
          }}
        >
          {/* Top-left corner time label */}
          <div className="flex items-center justify-center font-mono text-xs font-semibold text-muted uppercase">
            <Clock className="w-3.5 h-3.5 mr-1 text-accent" />
            <span>Time</span>
          </div>

          {/* Working Days */}
          {workingDays.map((dayNum) => (
            <div
              key={dayNum}
              className="py-2.5 rounded-xl border border-line/60 bg-surface text-center font-mono text-xs font-bold text-ink uppercase tracking-wider"
            >
              <span>{DAY_NAMES[dayNum - 1] || `Day ${dayNum}`}</span>
            </div>
          ))}
        </div>

        {/* Periods Rows */}
        <div className="space-y-3">
          {periods.map((period) => (
            <div
              key={period.position}
              className="grid gap-3"
              style={{
                gridTemplateColumns: `100px repeat(${workingDays.length}, minmax(130px, 1fr))`,
              }}
            >
              {/* Period Time / Label Column */}
              <div className="p-2.5 rounded-xl border border-line/60 bg-surface/80 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xs font-bold text-ink">
                  {period.label}
                </span>
                <span className="font-mono text-[10px] text-muted mt-0.5">
                  {period.startTime} - {period.endTime}
                </span>
              </div>

              {/* Day slots for this period */}
              {workingDays.map((dayNum) => {
                const lesson = lessonBySlot.get(`${dayNum}-${period.position}`);
                const isDoubleContinuation = doubleOccupiedSlots.has(
                  `${dayNum}-${period.position}`
                );

                const hasHard = lesson
                  ? issuesByLesson.hardMap.has(lesson.id)
                  : false;
                const hasSoft = lesson
                  ? issuesByLesson.softMap.has(lesson.id)
                  : false;

                const isHighlighted =
                  highlightedCell?.day === dayNum &&
                  highlightedCell?.periodPosition === period.position;

                return (
                  <TimetableCell
                    key={`${dayNum}-${period.position}`}
                    day={dayNum}
                    periodPosition={period.position}
                    isBreak={period.isBreak}
                    breakLabel={period.label}
                    lesson={lesson}
                    isOccupiedByDoubleSpan={isDoubleContinuation}
                    hasHardIssue={hasHard}
                    hasSoftIssue={hasSoft}
                    isHighlighted={isHighlighted}
                    onUnplace={() => lesson && unplaceLesson(lesson.id)}
                    onToggleLock={() => lesson && toggleLockLesson(lesson.id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
