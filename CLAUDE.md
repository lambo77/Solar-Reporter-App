# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Solar Reporter is a Next.js (App Router) + TypeScript web app that reports on solar
PV generation and consumption. It currently renders a dashboard and a tabular report
from **synthesised sample data**; there is no real data source or persistence yet.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (Turbopack)
- `npm start` — serve the production build (run `build` first)
- `npm run lint` — ESLint (flat config)

There is no test runner configured yet. If you add tests, document the command here,
including how to run a single test.

## Architecture

The data model and all sample-data logic live in **`lib/solar-data.ts`** — this is the
single source of truth. Key exports:

- `DailyReading` / `SummaryStats` — the shapes the entire UI consumes.
- `SYSTEM_CONFIG` — site name, capacity, CO₂ factor, electricity price. Stats derive
  from these constants.
- `getDailyReadings(days)` — generates deterministic sample readings (seeded PRNG +
  seasonal/weather factors). **To wire up a real source** (inverter cloud API, DB, CSV
  import), replace this function's body so it returns `DailyReading[]`; everything
  downstream keeps working unchanged.
- `summarise(readings)` — derives totals, self-sufficiency %, CO₂ avoided, and savings.

Data flows in two ways, both calling the same `lib` functions:

1. **Server components render directly** — `app/page.tsx` (dashboard) and
   `app/reports/page.tsx` call `getDailyReadings`/`summarise` at request time and pass
   plain data into components. No client-side fetching for the initial render.
2. **`app/api/solar/route.ts`** exposes the same data as JSON at
   `GET /api/solar?days=N` (N clamped to 1–365) for external/programmatic consumers.

Components split by interactivity:

- Server/presentational: `components/StatCard.tsx`.
- Client components (`"use client"`): `components/SolarCharts.tsx` (Recharts — requires
  the browser) and `components/ReportActions.tsx` (CSV export via Blob + `window.print`).

Styling is **Tailwind CSS v4**, configured through `postcss.config.mjs`
(`@tailwindcss/postcss`) with `app/globals.css` doing `@import "tailwindcss"` — there is
no `tailwind.config.js`. The app uses a dark theme.

## Conventions & gotchas

- **Determinism matters.** `getDailyReadings` uses a seeded PRNG so server and client
  render identical sample data; avoid `Math.random()`/`Date.now()` in render paths or you
  will get hydration mismatches.
- **Toolchain version coupling** (these break in non-obvious ways if mismatched):
  - Next.js 16 **removed `next lint`** — linting runs through the ESLint CLI with a flat
    `eslint.config.mjs` that imports `eslint-config-next/core-web-vitals` and
    `.../typescript` directly (do not wrap them in `FlatCompat`).
  - Pin **ESLint to v9** — ESLint 10 removed `context.getFilename()`, which the bundled
    `eslint-plugin-react` still calls.
  - Use a current **Tailwind v4** (`@tailwindcss/postcss`); 4.0.0 is incompatible with
    the Turbopack scanner.
- The `@/*` path alias maps to the repo root (see `tsconfig.json`).

## Git workflow

- Default branch: `main`. Feature work on dedicated branches; push with
  `git push -u origin <branch-name>`.
- Do not open pull requests unless explicitly requested.
