# Slate — Editorial Timetable Builder

Slate is an editorial, conflict-free timetable builder engineered for colleges and universities. It pairs constraint propagation and greedy scheduling algorithms with a drag-and-drop workspace, instant conflict detection, and publication-ready export workflows.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom theme tokens (Paper cream `#F4F2EC`, Deep ink `#121210`, Accent `#FF5A1F`)
- **Database**: PostgreSQL (Neon Serverless) via Prisma 6 ORM
- **State & Drag-and-Drop**: Zustand 5 + `@dnd-kit`
- **Exports**: `jspdf` + `jspdf-autotable` (PDF), `exceljs` (Excel), `jszip` (iCalendar feeds)
- **Testing**: Vitest with pure calculation test suites

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL connection string (Neon, Supabase, or local Postgres)

### 2. Installation
```bash
git clone https://github.com/CSENTC/slate.git
cd slate
npm install
```

### 3. Environment Setup
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Configure your `.env.local`:
```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.neon.tech/slate?sslmode=require"
APP_PASSCODE="" # Optional: Set a passcode string to enable the access gate
```

### 4. Database Setup & Seeding
Push the Prisma schema to your database and generate the Prisma Client:
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide (Vercel + Neon)

### 1. Set Up Neon PostgreSQL
1. Create a free account at [neon.tech](https://neon.tech).
2. Create a project (e.g. `slate-production`).
3. Copy the **Connection Details** Pooled Connection URI:
   ```
   postgresql://user:password@ep-xyz-pooler.region.neon.tech/neondb?sslmode=require
   ```

### 2. Deploy to Vercel
1. Import the repository `CSENTC/slate` into [Vercel](https://vercel.com).
2. In the project setup, configure the **Environment Variables**:
   - `DATABASE_URL`: Your Neon pooled connection string.
   - `APP_PASSCODE`: (Optional) A secret passcode to protect your workspace from public visitors.
3. Keep default build settings:
   - Framework Preset: **Next.js**
   - Build Command: `next build --webpack` (or default `npm run build`)
4. Click **Deploy**.

### 3. Initialize Database Tables
After deployment, run schema migrations on your database:
```bash
npx prisma db push
```
*(You can run this locally while pointing `DATABASE_URL` in `.env.local` to your Neon database)*.

---

## 🎨 Brand Assets & Logo Usage

Brand assets are located in `/public/assets/brand`:
- `slate-mark.svg` — 3x3 grid tile icon
- `slate-logo-light.svg` / `slate-logo-dark.svg` — Full lockup with Inter Tight typography
- `apple-touch-icon.png` — 180x180 iOS touch icon
- `favicon.svg` — Scalable SVG browser tab icon

### Using the Logo Component:
```tsx
import { Logo } from "@/components/brand/Logo";

// Mark only:
<Logo variant="mark" size={28} />

// Lockup with live text:
<Logo variant="lockup" size={32} />

// As an interactive link:
<Logo variant="lockup" size={28} href="/dashboard" />
```

---

## 🧪 Running Tests

The test suite runs with Vitest:
```bash
npm test
```
All unit tests execute headless with zero external database dependencies.
