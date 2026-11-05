"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const WORDS = [
  { text: "Constructing", serif: false },
  { text: "a", serif: false },
  { text: "university", serif: false },
  { text: "timetable", serif: true },
  { text: "should", serif: false },
  { text: "not", serif: false },
  { text: "feel", serif: false },
  { text: "like", serif: false },
  { text: "solving", serif: false },
  { text: "an", serif: false },
  { text: "impossible", serif: false },
  { text: "puzzle.", serif: true },
  { text: "Slate", serif: false, isAccent: true },
  { text: "checks", serif: false },
  { text: "every", serif: false },
  { text: "constraint", serif: false },
  { text: "live,", serif: false },
  { text: "balances", serif: false },
  { text: "faculty", serif: false },
  { text: "workloads", serif: true },
  { text: "fairly,", serif: false },
  { text: "and", serif: false },
  { text: "gives", serif: false },
  { text: "your", serif: false },
  { text: "institution", serif: false },
  { text: "hours", serif: false },
  { text: "back.", serif: true },
];

export function ScrollLitStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <section ref={containerRef} className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <p className="text-[clamp(1.8rem,4.2vw,3.5rem)] leading-[1.25] font-semibold tracking-tight text-muted/40">
        {WORDS.map((word, index) => {
          const start = index / WORDS.length;
          const end = start + 1 / WORDS.length;
          return (
            <Word
              key={index}
              progress={scrollYProgress}
              range={[start, end]}
              isSerif={word.serif}
              isAccent={word.isAccent}
            >
              {word.text}
            </Word>
          );
        })}
      </p>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  isSerif,
  isAccent,
}: {
  children: React.ReactNode;
  progress: any;
  range: [number, number];
  isSerif?: boolean;
  isAccent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.25, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className={`inline-block mr-[0.28em] transition-colors duration-200 ${
        isSerif
          ? "font-serif italic font-normal text-accent"
          : isAccent
          ? "text-accent font-extrabold"
          : "text-ink"
      }`}
    >
      {children}
    </motion.span>
  );
}

