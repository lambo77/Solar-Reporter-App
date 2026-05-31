---
name: new-screen
description: Scaffold a new Next.js App Router screen with page.tsx, a matching component folder, and a SWR data hook. Follows the existing dashboard/energy/inverters/alarms pattern in solar-reporter/src/.
---

The user will provide a screen name and the SolisCloud endpoint it consumes. Do the following:

1. Read `solar-reporter/src/app/dashboard/page.tsx` to understand the page pattern.
2. Read `solar-reporter/src/hooks/useInverterList.ts` to understand the SWR hook pattern.
3. Read `solar-reporter/src/app/api/solis/inverter-list/route.ts` to understand the API route pattern.
4. Create the following files, strictly following the existing patterns:
   - `solar-reporter/src/app/<name>/page.tsx` — page component with Suspense boundary
   - `solar-reporter/src/components/<Name>/index.tsx` — main UI component
   - `solar-reporter/src/hooks/use<Name>.ts` — SWR hook fetching from `/api/solis/<endpoint>`
   - `solar-reporter/src/app/api/solis/<endpoint>/route.ts` — if the endpoint does not already exist
5. After creating all files, run `npx tsc --noEmit` in the `solar-reporter/` directory and fix any type errors before reporting done.
