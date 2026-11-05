"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SlotState {
  subject: string;
  code: string;
  teacher: string;
  room: string;
  color: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PERIODS = ["09:00", "10:00", "11:00", "12:00", "14:00"];

export function HeroInteractiveGrid() {
  const [step, setStep] = useState<"fill" | "clash" | "resolve">("fill");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setStep((current) => {
        if (current === "fill") return "clash";
        if (current === "clash") return "resolve";
        return "fill";
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="relative w-full rounded-2xl border border-line bg-surface/80 p-5 backdrop-blur-md shadow-sm overflow-hidden select-none">
      {/* Simulation Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Engine Simulation: Class CS-4A
          </span>
        </div>
        <div className="font-mono text-[11px] text-muted">
          {step === "fill" && "Assembling slots..."}
          {step === "clash" && (
            <span className="text-conflict font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Teacher double-booked
            </span>
          )}
          {step === "resolve" && (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Resolved to Room 302
            </span>
          )}
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-6 gap-2 mb-2 font-mono text-[10px] text-muted uppercase tracking-wider text-center">
        <div className="text-left pl-1">Time</div>
        {DAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {PERIODS.map((time, rIdx) => {
          const isLunch = rIdx === 3;
          if (isLunch) {
            return (
              <div
                key={time}
                className="grid grid-cols-6 gap-2 items-center bg-line/30 rounded-lg px-2 py-1.5 font-mono text-[10px] text-muted/70 text-center tracking-widest"
              >
                <div className="text-left font-mono">{time}</div>
                <div className="col-span-5 uppercase tracking-widest font-mono text-[9px]">
                  Break — Lunch
                </div>
              </div>
            );
          }

          return (
            <div key={time} className="grid grid-cols-6 gap-2 items-center">
              <div className="font-mono text-[11px] text-muted">{time}</div>
              {DAYS.map((day, cIdx) => {
                const isTargetCell = rIdx === 1 && cIdx === 2; // Tue 10:00
                const isClashing = step === "clash" && isTargetCell;
                const isResolved = step === "resolve" && isTargetCell;

                return (
                  <div
                    key={day}
                    className={`relative min-h-[52px] rounded-lg border p-1.5 transition-all duration-300 flex flex-col justify-between ${
                      isClashing
                        ? "border-conflict bg-conflict/10 text-conflict shadow-sm"
                        : isResolved
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-line/70 bg-bg/40 hover:bg-bg/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-semibold">
                        {rIdx === 0 ? "CS301" : rIdx === 2 ? "CS304" : isTargetCell ? "CS302" : "CS305"}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono opacity-70">
                      <span>{isTargetCell && step === "clash" ? "Dr. Rao" : "Prof. Sen"}</span>
                      <span>{isTargetCell && step === "resolve" ? "R302" : "R101"}</span>
                    </div>

                    {isClashing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-conflict text-white text-[9px] font-mono px-2 py-0.5 rounded shadow-md"
                      >
                        Dr. Rao already in Lab 2
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Floating Dragged Pill */}
      <AnimatePresence>
        {step === "clash" && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0, x: -30, y: 15 }}
            animate={{ opacity: 1, x: 10, y: -5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-1/3 z-30 pointer-events-none rounded-lg bg-surface border border-conflict p-2 shadow-xl ring-2 ring-conflict/30"
          >
            <div className="font-mono text-[10px] font-bold text-conflict">
              Candidate: Advanced Networks (CS302)
            </div>
            <div className="font-mono text-[9px] text-muted">
              Teacher: Dr. Rao • 2 periods
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

