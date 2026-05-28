# Solar-Reporter-App

A Next.js + TypeScript web app for reporting on solar PV generation and consumption.

It ships a dashboard (summary KPIs + charts) and a printable/exportable daily report,
driven by deterministic **sample data** so it runs with zero external configuration. To
use real data, replace `getDailyReadings` in [`lib/solar-data.ts`](lib/solar-data.ts).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Production build           |
| `npm start`     | Serve the production build |
| `npm run lint`  | Run ESLint                 |

## Routes

- `/` — dashboard (KPIs, generation and generation-vs-consumption charts)
- `/reports` — daily table with CSV export and print
- `GET /api/solar?days=N` — JSON readings + summary (N = 1–365, default 30)

See [CLAUDE.md](CLAUDE.md) for architecture and conventions.
