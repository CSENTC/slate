# Slate - Premium Timetable Builder

Slate is an editorial, high-performance timetable builder engineered for colleges and universities.

## Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

## Getting Started

1. Clone or navigate to the repository:
   ```bash
   cd slate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing
To run the automated test suite:
```bash
npm run test
```

## Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI primitives, app shell, and landing page blocks.
- `src/lib/scheduling`: Pure algorithmic rules and scheduling engine.
- `public/assets`: Static assets, vector illustrations, and imagery.
