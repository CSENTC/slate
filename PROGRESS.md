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

## Phase 1: Database and setup wizard (Next)
- [ ] Prisma schema with PostgreSQL models
- [ ] `.env.local` guidance & `.env.example`
- [ ] First-run detection & multi-step Setup Wizard
- [ ] Working days, periods, start times, overrides, breaks configuration
- [ ] Live preview strip of schedule
- [ ] Settings page & conflict-check on configuration shrinkage

## Phase 2: Master data
- [ ] Subjects CRUD
- [ ] Teachers CRUD with availability grid
- [ ] Rooms CRUD with types & capacity
- [ ] Classes CRUD
- [ ] Allocations with workload and period warnings
- [ ] Load demo data & clear data buttons

## Phase 3: Builder and clash engine
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

