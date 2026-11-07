# Project Progress

## Phase 0: Scaffold and design system
- [x] Next.js App Router with TypeScript initialized
- [x] Tailwind CSS configured with exact Slate color tokens, typography, and motion easing
- [x] Theme system with `next-themes` (light `#F4F2EC`, dark `#0D0D0C`, accent `#FF5A1F`)
- [x] Fonts configured: Inter Tight, Instrument Serif, JetBrains Mono
- [x] Asset pipeline: `/public/assets` directory, `lib/assets.ts`, `AssetImage` component with dashed dev fallback
- [x] High-fidelity vector SVGs created for steps, empty states, and favicon
- [x] `ASSETS_NEEDED.md` created
- [x] Responsive App Shell: Left slim rail navigation, top bar with theme toggle, saved indicator, export action
- [x] Hobro-inspired editorial landing page:
  - Top meta row in JetBrains Mono
  - Masked staggered hero typography ("Timetables, solved.")
  - Animated weekly grid demo loop with drag/conflict simulation
  - Infinite marquee ticker
  - Scroll-lit statement paragraph
  - Bento grid (clash preview, workload bars, auto-generate terminal, export chips, period strip, theme preview)
  - 4-step "How it works" section
  - Closing inverted CTA panel with cropped wordmark
- [x] Vitest configuration and smoke test
- [x] Build passes with 0 errors

## Phase 1: Database and setup wizard
- [x] Prisma schema with PostgreSQL models (`Workspace`, `Period`, `Subject`, `Teacher`, `TeacherUnavailability`, `Room`, `ClassGroup`, `Allocation`, `Entry`)
- [x] Database synchronized with Neon PostgreSQL instance
- [x] Singleton Prisma client in `src/lib/prisma.ts`
- [x] Pure schedule computation `generateDaySchedule` with Vitest unit tests
- [x] First-run onboarding wizard (`/setup`) with 4 sequential steps
- [x] Live period preview strip with break indicators
- [x] Settings manager (`/settings`) syncing configurations with transaction-safe period regeneration
- [x] `checkSettingsImpact` action to detect lessons affected by schedule shrink
- [x] Build and tests pass with 0 errors

## Phase 2: Master data
- [x] Subjects CRUD with curated color palette swatches and Theory/Lab tags
- [x] Teachers CRUD with weekly/daily/consecutive quotas and interactive availability mini-grid
- [x] Rooms CRUD with Classroom/Lab/Other types and capacity thresholds
- [x] Classes CRUD with cohort sizes and optional designated home rooms
- [x] Allocations manager linking Class, Subject, Faculty, periods/week, block size (1 or 2), and room requirements
- [x] Live workload calculations (`calculateClassSlotTotals`, `calculateTeacherWorkloads`) flagging capacity issues
- [x] Realistic Demo Seeding: 4 classes, 12 faculty, 8 rooms, 10 subjects (including labs with block size 2)
- [x] "Clear All Data" button with confirmation modal
- [x] Unit test suite in `master-calculations.test.ts` passing
- [x] Production build passes with 0 errors

## Phase 3: Builder and clash engine
- [x] Pure scheduling rule functions in `/lib/scheduling/rules.ts` (Hard clashes: teacher/room/class double-booked, unavailable; Soft issues: max per day, max per week, max consecutive, room capacity)
- [x] 100% Vitest unit tests in `rules.test.ts` (7 new tests covering single/double blocks, bounds, double bookings, quotas, and viability previews)
- [x] Reactive Zustand builder store in `builder-store.ts` with full undo/redo stack
- [x] Server actions in `builder-actions.ts` for database fetching and transaction-safe batch sync to Neon PostgreSQL
- [x] Interactive weekly timetable grid with breaks shaded as non-droppable rows, and double-period blocks occupying two continuous cells
- [x] View mode switcher: By Class, By Teacher, By Room with responsive entity dropdown selector
- [x] Lesson tray with remaining sessions counter (e.g., `x3`) and unplace dropzone
- [x] Complete drag-and-drop system powered by `@dnd-kit` (tray -> cell, cell -> cell, cell -> tray)
- [x] Strict mode (prevents dropping on hard clashes) vs. Warn mode (permits with visual alert)
- [x] Collapsible Audit Issues drawer with jump-to-cell pulsing highlight
- [x] Bottom Workload Panel summarizing faculty teaching loads, class hours, and room occupancy
- [x] Debounced autosave (1.5s) with live indicator (`Synced`, `Saving...`, `Unsaved edits`)
- [x] Build and Vitest test suite pass with 0 errors

## Phase 4: Auto-generate (Next)
- [ ] Scheduling algorithm in `/lib/scheduling/generate.ts`
- [ ] Web Worker execution with live progress narration
- [ ] Feasibility check & outcome report

## Phase 5: Exports
- [ ] PDF export with jspdf & jspdf-autotable
- [ ] Excel export with exceljs
- [ ] iCalendar (.ics) export & ZIP bundling

## Phase 6: Polish, QA and deploy
- [ ] Optional passcode gate
- [ ] Accessibility & keyboard navigation pass
- [ ] Final deployment guide for Vercel + Neon PostgreSQL

