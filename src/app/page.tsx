"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Play, ShieldCheck, FileSpreadsheet, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { HeroInteractiveGrid } from "@/components/landing/hero-interactive-grid";
import { RulesMarquee } from "@/components/landing/rules-marquee";
import { ScrollLitStatement } from "@/components/landing/scroll-lit-statement";
import { BentoFeatures } from "@/components/landing/bento-features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ClosingCta } from "@/components/landing/closing-cta";
import { AssetImage } from "@/components/ui/asset-image";

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-bg text-ink selection:bg-accent/20 selection:text-accent overflow-x-hidden">
        {/* Subtle Paper Texture Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen z-0">
          <AssetImage assetKey="hero-texture" className="w-full h-full object-cover" priority />
        </div>

        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/85 backdrop-blur-md px-6 md:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-accent text-white font-mono font-bold text-sm flex items-center justify-center">
              S
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider uppercase text-ink">
              Slate
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] text-muted border-l border-line pl-3">
              ACADEMIC TIMETABLE SUITE 2026/27
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors"
            >
              Live Demo
            </Link>
            <ThemeToggle />
            <Link
              href="/builder"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-bg text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>Launch Builder</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 pt-16 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
          {/* Top Meta Row */}
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted mb-8">
            <span>SLATE SYSTEM</span>
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span>HIGHER EDUCATION SCHEDULER</span>
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span>AUTONOMOUS CONSTRAINTS</span>
          </div>

          {/* Masked Hero Headline */}
          <div className="overflow-hidden pb-4">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-sans font-extrabold text-[clamp(3.8rem,14vw,11.5rem)] leading-[0.84] tracking-[-0.06em] text-ink"
            >
              Timetables,{" "}
              <span className="font-serif italic font-normal text-accent tracking-normal">
                solved.
              </span>
            </motion.h1>
          </div>

          {/* Two-Column Hero Details */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 flex flex-col justify-between space-y-8"
            >
              <p className="text-lg md:text-xl text-muted leading-relaxed font-normal">
                An editorial, deterministic scheduling environment for universities.
                Enforce complex faculty limits, prevent room collisions in real-time,
                and generate balanced weekly grids in a single click.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/builder"
                  className="px-6 py-3.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-md hover:shadow-accent/20 flex items-center gap-2"
                >
                  <span>Start building</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/builder"
                  className="px-6 py-3.5 rounded-xl border border-line bg-surface hover:bg-bg/60 text-ink font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-accent" />
                  <span>Open sample builder</span>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="pt-6 border-t border-line grid grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-2xl font-bold text-ink">13</div>
                  <div className="text-xs text-muted mt-0.5">Rules checked live</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-ink">3</div>
                  <div className="text-xs text-muted mt-0.5">Export formats</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-accent">1 Click</div>
                  <div className="text-xs text-muted mt-0.5">Auto-generation</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Mini Interactive Grid & Campus Facade */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 w-full space-y-4"
            >
              <HeroInteractiveGrid />

              <div className="rounded-2xl overflow-hidden border border-line/60 max-h-48 shadow-sm">
                <AssetImage
                  assetKey="hero-campus"
                  className="w-full h-full object-cover filter brightness-[0.95] dark:brightness-[0.8]"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Infinite Rules Marquee */}
        <RulesMarquee />

        {/* Scroll-Lit Statement */}
        <ScrollLitStatement />

        {/* Bento Features Grid */}
        <BentoFeatures />

        {/* How It Works */}
        <HowItWorks />

        {/* Closing Inverted CTA Panel */}
        <ClosingCta />
      </div>
    </SmoothScrollProvider>
  );
}
