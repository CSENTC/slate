export interface AssetDefinition {
  path: string;
  width: number;
  height: number;
  alt: string;
  isVector?: boolean;
}

export const ASSET_MANIFEST: Record<string, AssetDefinition> = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  "slate-mark": {
    path: "/assets/brand/slate-mark.svg",
    width: 96,
    height: 96,
    alt: "Slate logo mark – orange rounded square with 3×3 cream grid",
    isVector: true,
  },
  "slate-mark-dark": {
    path: "/assets/brand/slate-mark-dark.svg",
    width: 96,
    height: 96,
    alt: "Slate logo mark – dark theme variant",
    isVector: true,
  },
  "slate-logo-light": {
    path: "/assets/brand/slate-logo-light.svg",
    width: 320,
    height: 96,
    alt: "Slate logo lockup – light theme",
    isVector: true,
  },
  "slate-logo-dark": {
    path: "/assets/brand/slate-logo-dark.svg",
    width: 320,
    height: 96,
    alt: "Slate logo lockup – dark theme",
    isVector: true,
  },
  "og-image": {
    path: "/assets/og/og-image.svg",
    width: 1200,
    height: 630,
    alt: "Slate – Timetables, solved.",
    isVector: true,
  },

  // Images
  "hero-campus": {
    path: "/assets/images/hero-campus.jpg",
    width: 1600,
    height: 1000,
    alt: "Abstract architectural university building facade grid",
  },
  "hero-texture": {
    path: "/assets/images/hero-texture.png",
    width: 1920,
    height: 1080,
    alt: "Warm paper grain background texture",
  },
  "feature-clash": {
    path: "/assets/images/feature-clash.png",
    width: 1200,
    height: 800,
    alt: "Overlapping schedule cards depicting conflict detection",
  },
  "feature-workload": {
    path: "/assets/images/feature-workload.png",
    width: 1200,
    height: 800,
    alt: "Teacher workload distribution bars",
  },
  "feature-generate": {
    path: "/assets/images/feature-generate.png",
    width: 1200,
    height: 800,
    alt: "Algorithm generating balanced schedule grid",
  },
  "feature-export": {
    path: "/assets/images/feature-export.png",
    width: 1200,
    height: 800,
    alt: "Calendar and spreadsheet export formats",
  },
  "feature-themes": {
    path: "/assets/images/feature-themes.png",
    width: 1600,
    height: 700,
    alt: "Slate interface in light and dark mode",
  },
  "cta-bg": {
    path: "/assets/images/cta-bg.png",
    width: 1800,
    height: 900,
    alt: "Architectural blueprint grid background",
  },

  // Illustrations
  "setup-side": {
    path: "/assets/illustrations/setup-side.png",
    width: 900,
    height: 1100,
    alt: "Timetable setup onboarding illustration",
  },
  "step-1-setup": {
    path: "/assets/illustrations/step-1-setup.svg",
    width: 400,
    height: 400,
    alt: "Step 1: Set the week and periods",
    isVector: true,
  },
  "step-2-people": {
    path: "/assets/illustrations/step-2-people.svg",
    width: 400,
    height: 400,
    alt: "Step 2: Add teachers and classes",
    isVector: true,
  },
  "step-3-build": {
    path: "/assets/illustrations/step-3-build.svg",
    width: 400,
    height: 400,
    alt: "Step 3: Build or auto-generate timetable",
    isVector: true,
  },
  "step-4-export": {
    path: "/assets/illustrations/step-4-export.svg",
    width: 400,
    height: 400,
    alt: "Step 4: Export to PDF, Excel, and Calendar",
    isVector: true,
  },

  // Empty states
  "empty-subjects": {
    path: "/assets/illustrations/empty-subjects.svg",
    width: 480,
    height: 360,
    alt: "No subjects defined yet",
    isVector: true,
  },
  "empty-teachers": {
    path: "/assets/illustrations/empty-teachers.svg",
    width: 480,
    height: 360,
    alt: "No faculty added yet",
    isVector: true,
  },
  "empty-rooms": {
    path: "/assets/illustrations/empty-rooms.svg",
    width: 480,
    height: 360,
    alt: "No rooms or labs registered",
    isVector: true,
  },
  "empty-classes": {
    path: "/assets/illustrations/empty-classes.svg",
    width: 480,
    height: 360,
    alt: "No class groups found",
    isVector: true,
  },
  "empty-allocations": {
    path: "/assets/illustrations/empty-allocations.svg",
    width: 480,
    height: 360,
    alt: "No subject allocations configured",
    isVector: true,
  },
  "empty-timetable": {
    path: "/assets/illustrations/empty-timetable.svg",
    width: 480,
    height: 360,
    alt: "Empty timetable grid ready for scheduling",
    isVector: true,
  },
};

export type AssetKey = keyof typeof ASSET_MANIFEST;
