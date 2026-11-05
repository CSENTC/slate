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

