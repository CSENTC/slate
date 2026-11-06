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

## Phase 3: Builder and clash engine (Next)
- [ ] Pure scheduling rule functions in `/lib/scheduling` + Vitest tests
- [ ] Interactive weekly timetable grid
- [ ] Drag and drop with dnd-kit
- [ ] Strict vs Warn modes
- [ ] Issues panel with jump-to-cell highlight
- [ ] Workload panel
- [ ] Debounced autosave

## Phase 4: Auto-generate
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

