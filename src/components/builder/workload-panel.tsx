"use client";

import React, { useMemo } from "react";
import { useBuilderStore } from "@/lib/scheduling/builder-store";
import { Users, GraduationCap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkloadPanel() {
  const {
    viewMode,
    teachers,
    classes,
    rooms,
    lessons,
    selectedEntityId,
    setSelectedEntityId,
  } = useBuilderStore();

  // If in Teacher view: show faculty workload vs quota
  // If in Class view: show class slots filled vs total slots
  // If in Room view: show room occupancy hours

  const facultyWorkloads = useMemo(() => {
    return teachers.map((teacher) => {
      const assignedPeriods = lessons
        .filter((l) => l.teacherId === teacher.id)
        .reduce((acc, l) => acc + l.length, 0);

      const max = teacher.maxPerWeek || 20;
      const pct = Math.min(Math.round((assignedPeriods / max) * 100), 100);
      const isOver = assignedPeriods > max;

      return {
        id: teacher.id,
        name: teacher.name,
        code: teacher.code,
        assigned: assignedPeriods,
        max,
        pct,
        isOver,
      };
    });
  }, [teachers, lessons]);

  const classWorkloads = useMemo(() => {
    return classes.map((cls) => {
      const assignedPeriods = lessons
        .filter((l) => l.classId === cls.id)
        .reduce((acc, l) => acc + l.length, 0);

      return {
        id: cls.id,
        name: cls.name,
        assigned: assignedPeriods,
      };
    });
  }, [classes, lessons]);

  return (
    <div className="h-10 border-t border-line bg-surface/80 backdrop-blur-xs px-6 flex items-center gap-4 overflow-x-auto text-xs font-mono select-none shrink-0">
      <span className="text-muted uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
        {viewMode === "BY_TEACHER" && <Users className="w-3 h-3 text-accent" />}
        {viewMode === "BY_CLASS" && <GraduationCap className="w-3 h-3 text-accent" />}
        {viewMode === "BY_ROOM" && <Building2 className="w-3 h-3 text-accent" />}
        <span>Load Summary:</span>
      </span>

      {viewMode === "BY_TEACHER" &&
        facultyWorkloads.map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => setSelectedEntityId(fw.id)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors shrink-0",
              selectedEntityId === fw.id
                ? "bg-accent/15 text-accent font-semibold"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <span>{fw.code}:</span>
            <span
              className={cn(
                "font-bold",
                fw.isOver
                  ? "text-red-500"
                  : fw.assigned === fw.max
                  ? "text-emerald-500"
                  : "text-ink"
              )}
            >
              {fw.assigned}/{fw.max}
            </span>
          </button>
        ))}

      {viewMode === "BY_CLASS" &&
        classWorkloads.map((cw) => (
          <button
            key={cw.id}
            type="button"
            onClick={() => setSelectedEntityId(cw.id)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors shrink-0",
              selectedEntityId === cw.id
                ? "bg-accent/15 text-accent font-semibold"
                : "text-muted hover:text-ink hover:bg-bg"
            )}
          >
            <span>{cw.name}:</span>
            <span className="font-bold text-ink">{cw.assigned} hrs</span>
          </button>
        ))}

      {viewMode === "BY_ROOM" &&
        rooms.map((rm) => {
          const roomHours = lessons
            .filter((l) => l.roomId === rm.id)
            .reduce((acc, l) => acc + l.length, 0);

          return (
            <button
              key={rm.id}
              type="button"
              onClick={() => setSelectedEntityId(rm.id)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors shrink-0",
                selectedEntityId === rm.id
                  ? "bg-accent/15 text-accent font-semibold"
                  : "text-muted hover:text-ink hover:bg-bg"
              )}
            >
              <span>{rm.name}:</span>
              <span className="font-bold text-ink">{roomHours} hrs</span>
            </button>
          );
        })}
    </div>
  );
}
