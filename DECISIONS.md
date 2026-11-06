# Decisions Log

This document records sensible defaults, technical decisions, and architecture choices taken during the development of Slate.

## 2026-11-06 - Phase 0: Scaffolding & Design System

1. **Next.js 16 + React 19 + Tailwind CSS v4 Setup**:
   - Configured custom CSS design tokens via `@theme` and `:root` / `.dark` classes to seamlessly support next-themes.
   - Design tokens adopted:
     - Light: Background `#F4F2EC`, Surface `#FFFFFF`, Ink `#121210`, Muted `#6E6C64`, Line `#E2DFD5`.
     - Dark: Background `#0D0D0C`, Surface `#161614`, Ink `#F3F1EA`, Muted `#98958A`, Line `#2A2926`.
     - Accent: `#FF5A1F` (Dark: `#FF6A33`).
     - Conflict: `#E5484D` (Dark: `#FF6369`).
     - Warning: `#D99A00` (Dark: `#F5B83D`).
     - Radius: 14px–20px with 1px hairline borders.
     - Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.

2. **Typography**:
   - Used Google Fonts via `next/font/google`:
     - Inter Tight (UI & Headlines, heavy weight, -0.05em to -0.07em tracking).
     - Instrument Serif (italic editorial accents).
     - JetBrains Mono (monospaced numbers, timestamps, badges, and terminal readouts).

3. **Smooth Scroll Isolation**:
   - Lenis smooth scroll is restricted strictly to the landing page and respects `prefers-reduced-motion`. The app workspace retains native fast scrolling.

4. **Asset Management Strategy**:
   - Created typed manifest in `src/lib/assets.ts` with `AssetImage` component.
   - Hand-crafted geometric, architectural SVGs for icons, steps, empty states, and favicon.
   - Fallback dashed placeholder frames rendered for missing WebP images with dev info, and tracked in `ASSETS_NEEDED.md`.

## 2026-11-06 - Phase 1: Database and Setup Wizard

1. **Prisma ORM & PostgreSQL Schema**:
   - Standardized on stable `prisma` and `@prisma/client` v6.
   - Defined strict relational models: `Workspace`, `Period`, `Subject`, `Teacher`, `TeacherUnavailability`, `Room`, `ClassGroup`, `Allocation`, `Entry`.
   - Added database indexes on foreign keys and compound index on `(day, startPeriod)` for real-time timetable slot queries.
   - Leveraged PostgreSQL transactional updates (`prisma.$transaction`) so updating settings atomically replaces and recalculates period intervals without partial states.

2. **Scheduling Computation Layer**:
   - Built pure function `generateDaySchedule` in `src/lib/scheduling/setup-schema.ts` to compute sequential slot intervals (`09:00 - 09:50`, etc.) and seamlessly interleave custom duration breaks (Lunch, Assembly) after designated periods.
   - Added unit test suite in `setup-schedule.test.ts` covering zero-break and multi-break calculations.

3. **Onboarding UX & Impact Audit**:
   - Created multi-step `SetupWizard` with live schedule preview strip updating in real-time as users adjust start times, period lengths, or breaks.
   - Integrated `checkSettingsImpact` action to detect if shortening days or periods will clip or invalidate placed lesson blocks.

## 2026-11-07 - Phase 2: Master Data & Demo Dataset

1. **Relational Data Actions & Invalidation**:
   - Built full CRUD server actions in `master-data-actions.ts` covering Subjects, Faculty, Rooms, Classes, and Allocations.
   - Wired Next.js `revalidatePath` to automatically sync cache across master lists, builder views, and allocations.

2. **Availability Mini-Grid & Pure Workload Computation**:
   - Designed interactive matrix in `teacher-manager.tsx` allowing one-click toggling of unavailable slots per faculty member.
   - Created pure functions in `master-calculations.ts` to compute:
     - Total class scheduled periods against total available weekly slots.
     - Total assigned hours per teacher against weekly maximum limits, flagging over-allocations with amber warning indicators.
   - Verified via unit test suite in `master-calculations.test.ts`.

3. **Curated Demo Seeding**:
   - Built atomic transaction `loadDemoData` seeding 4 classes (`CSE-3A`, `CSE-3B`, `ECE-2A`, `MECH-4A`), 12 teachers with realistic quotas & unavailable slots, 8 rooms (classrooms + labs), and 10 subjects.
   - Seeded 2 lab subjects with consecutive double period block sizes (`blockSize: 2`) targeting laboratory rooms.

