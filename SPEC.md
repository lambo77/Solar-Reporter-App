# Solar Reporter — Solutions Design Document

**Version:** 1.0  
**Date:** 2026-05-09  
**Target deployment:** Vercel  
**Prepared for:** Claude Code Agent  

---

## 1. Project Overview

Solar Reporter is a mobile-first web application that connects to the SolisCloud Platform API (Ginlong/Solis inverters) to track solar generation, grid import, grid export, battery state, and home consumption. It supports time-of-use (ToU) import tariff configuration so the user can see real-time cost and revenue figures alongside energy data.

### Core requirements

- Display live power flow: Solar PV → Inverter → Grid export / Home load / Battery
- Show energy totals across Day, Month, Year, and custom billing-cycle date ranges
- Calculate import cost (€) and export revenue (€) using configurable tariffs
- Three time-of-use import tariffs (each with name, rate, start time, end time)
- One export tariff (flat rate)
- Billing cycle anchored to the 10th of each calendar month
- List inverters with status (online / offline / alarm) and full detail view
- Surface device alarms with severity levels
- Mobile-first UI — optimised for ~390px viewport, usable on desktop

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | First-class Vercel support, Server Components, Route Handlers for API proxy |
| Language | TypeScript (strict) | Type safety across API responses and domain logic |
| Styling | Tailwind CSS v3 | Utility-first, mobile-first, no runtime cost |
| Charts | `react-chartjs-2` + `chart.js` | Proven, lightweight, bar/line charts needed |
| Icons | `lucide-react` | Tree-shakeable SVG icons |
| Crypto (server) | Node.js built-in `crypto` | HMAC-SHA1 and MD5 for SolisCloud auth — runs only in Route Handlers |
| State | React `useState` / `useContext` | No external store needed; tariff settings persisted in localStorage |
| Data fetching | Native `fetch` with SWR (`swr`) | Automatic revalidation every 5 minutes |
| Deployment | Vercel | Zero-config Next.js, env var management, edge network |

---

## 3. Repository Structure

```
solar-reporter/
├── .env.local                          # Secret — never commit
├── .env.example                        # Committed template
├── vercel.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx                  # Root layout — MobileShell wrapper
    │   ├── page.tsx                    # Redirect → /dashboard
    │   ├── dashboard/page.tsx
    │   ├── energy/page.tsx
    │   ├── inverters/
    │   │   ├── page.tsx                # Inverter list
    │   │   └── [id]/page.tsx           # Inverter detail
    │   ├── alarms/page.tsx
    │   ├── settings/page.tsx
    │   └── api/
    │       └── solis/
    │           ├── inverter-list/route.ts
    │           ├── inverter-detail/route.ts
    │           ├── inverter-day/route.ts
    │           ├── inverter-month/route.ts
    │           ├── inverter-year/route.ts
    │           ├── inverter-all/route.ts
    │           ├── alarm-list/route.ts
    │           └── station-list/route.ts
    ├── components/
    │   ├── layout/
    │   │   ├── MobileShell.tsx         # Phone chrome, top bar, bottom nav
    │   │   ├── TopBar.tsx
    │   │   └── BottomNav.tsx
    │   ├── dashboard/
    │   │   ├── PowerFlowDiagram.tsx    # SVG live flow diagram
    │   │   ├── StatCard.tsx
    │   │   └── BatteryBar.tsx
    │   ├── energy/
    │   │   ├── PeriodToggle.tsx        # Day / Month / Year / Custom
    │   │   ├── CustomDatePanel.tsx     # Billing cycle shortcuts + date pickers
    │   │   ├── EnergyChart.tsx         # Chart.js bar chart
    │   │   └── EnergyStatCard.tsx      # kWh + € cost/revenue line
    │   ├── inverters/
    │   │   ├── InverterCard.tsx
    │   │   └── InverterDetailPanel.tsx
    │   ├── alarms/
    │   │   └── AlarmCard.tsx
    │   └── settings/
    │       ├── ExportTariffBlock.tsx
    │       └── ImportTariffBlock.tsx
    ├── lib/
    │   ├── solis/
    │   │   ├── auth.ts                 # Request signing (server-only)
    │   │   ├── client.ts               # Typed fetch wrappers (server-only)
    │   │   └── types.ts                # SolisCloud response types
    │   ├── tariffs/
    │   │   ├── calculator.ts           # Cost computation
    │   │   └── storage.ts              # localStorage read/write
    │   └── utils/
    │       ├── formatters.ts           # Currency, kWh, date strings
    │       └── billing-cycle.ts        # Billing period date arithmetic
    ├── hooks/
    │   ├── useInverterList.ts
    │   ├── useInverterDetail.ts
    │   ├── useInverterDay.ts
    │   ├── useInverterMonth.ts
    │   ├── useInverterYear.ts
    │   ├── useAlarms.ts
    │   ├── useTariffs.ts
    │   └── useBillingCycle.ts
    └── types/
        └── index.ts
```

---

## 4. Environment Variables

### `.env.example`
```bash
# SolisCloud API credentials
# Obtain from: soliscloud.com → Account → Basic Settings → API Management
SOLIS_API_ID=your_api_id_here
SOLIS_API_SECRET=your_api_secret_here

# SolisCloud base URL (do not include trailing slash)
SOLIS_BASE_URL=https://www.soliscloud.com:13333

# Optional: default station ID to pre-select on load
SOLIS_DEFAULT_STATION_ID=
```

### `.env.local` (development — never commit)
```bash
SOLIS_API_ID=1300386381678076897
SOLIS_API_SECRET=b97bb88ebb77424eb160b963d51cafaa
SOLIS_BASE_URL=https://www.soliscloud.com:13333
SOLIS_DEFAULT_STATION_ID=
```

> ⚠ These credentials are live. Ensure `.env.local` is in `.gitignore` before the first `git init`. Rotate the secret immediately via SolisCloud → Account → API Management if the repository is ever accidentally made public.

All variables are server-side only. Never prefix with `NEXT_PUBLIC_` — the API secret must never reach the browser.

---

## 5. SolisCloud API Integration

### 5.1 Authentication algorithm

All requests are `POST`, `application/json;charset=UTF-8`. The signature is computed server-side in each Route Handler.

**Implementation — `src/lib/solis/auth.ts`**

```typescript
import crypto from 'crypto'

export function buildSolisHeaders(
  path: string,         // e.g. "/v1/api/inverterList"
  body: object,
  apiId: string,
  apiSecret: string
): Record<string, string> {
  const bodyJson = JSON.stringify(body)

  // 1. Content-MD5: base64(MD5(body))
  const contentMd5 = crypto
    .createHash('md5')
    .update(bodyJson)
    .digest('base64')

  // 2. GMT date string — must be within ±15 min of server time
  const date = new Date().toUTCString() // "Tue, 27 Jun 2023 06:27:04 GMT"

  const contentType = 'application/json;charset=UTF-8'

  // 3. Signing string
  const signingString = [
    'POST',
    contentMd5,
    contentType,
    date,
    path,
  ].join('\n')

  // 4. HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', apiSecret)
    .update(signingString)
    .digest('base64')

  return {
    'Content-Type': contentType,
    'Content-MD5': contentMd5,
    'Date': date,
    'Authorization': `API ${apiId}:${signature}`,
  }
}
```

### 5.1.1 Credential reference

| Key | Value |
|---|---|
| API ID | `1300386381678076897` |
| API Secret | `b97bb88ebb77424eb160b963d51cafaa` |
| Base URL | `https://www.soliscloud.com:13333` |

These values go into `.env.local` and Vercel environment variables. They are read at runtime via `process.env.SOLIS_API_ID` etc. — never hardcoded in source files.

### 5.2 Generic Route Handler pattern

Every Route Handler follows the same shape. The client sends a POST to `/api/solis/<endpoint>` with the SolisCloud body payload. The Route Handler signs and proxies the request.

**Example — `src/app/api/solis/inverter-list/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { buildSolisHeaders } from '@/lib/solis/auth'

const BASE_URL = process.env.SOLIS_BASE_URL!
const API_ID = process.env.SOLIS_API_ID!
const API_SECRET = process.env.SOLIS_API_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.json()
  const path = '/v1/api/inverterList'

  const headers = buildSolisHeaders(path, body, API_ID, API_SECRET)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || data.code !== '0') {
    return NextResponse.json(
      { error: data.msg ?? 'SolisCloud error', code: data.code },
      { status: 502 }
    )
  }

  return NextResponse.json(data.data)
}
```

Apply this pattern to all eight endpoints listed in section 5.3.

### 5.3 Endpoints and internal proxy paths

| SolisCloud path | Internal proxy path | Body fields |
|---|---|---|
| `POST /v1/api/inverterList` | `/api/solis/inverter-list` | `pageNo`, `pageSize`, `stationId?`, `nmiCode?` |
| `POST /v1/api/inverterDetail` | `/api/solis/inverter-detail` | `id` OR `sn` (one required) |
| `POST /v1/api/inverterDay` | `/api/solis/inverter-day` | `id`, `sn`, `money`, `time` (yyyy-MM-dd), `timeZone` |
| `POST /v1/api/inverterMonth` | `/api/solis/inverter-month` | `id`, `sn`, `money`, `month` (yyyy-MM), `timeZone` |
| `POST /v1/api/inverterYear` | `/api/solis/inverter-year` | `id`, `sn`, `money`, `year` (yyyy), `timeZone` |
| `POST /v1/api/inverterAll` | `/api/solis/inverter-all` | `id`, `sn`, `money` |
| `POST /v1/api/alarmList` | `/api/solis/alarm-list` | `pageNo`, `pageSize`, `stationId?`, `alarmDeviceSn?`, `state?` |
| `POST /v1/api/userStationList` | `/api/solis/station-list` | `pageNo`, `pageSize`, `nmiCode?` |

### 5.4 Key TypeScript types — `src/lib/solis/types.ts`

```typescript
export interface InverterSummary {
  id: string
  sn: string
  stationId: string
  stationName: string
  power: number          // Installed capacity (kW)
  pac: number            // Real-time AC power (kW)
  pacStr: string
  etoday: number         // Daily generation (kWh)
  etodayStr: string
  etotal: number         // Total generation
  etotalStr: string
  state: 1 | 2 | 3      // 1=online 2=offline 3=alarm
  batteryCapacitySoc: number
  batteryPower: number
  gridPurchasedTodayEnergy: number
  gridSellTodayEnergy: number
  homeLoadTodayEnergy: number
  familyLoadPower: number
  pSum: number           // Grid total active power (+ import, - export)
  dataTimestamp: number
  collectorState: 1 | 2
}

export interface InverterDetail extends InverterSummary {
  eMonth: number
  eYear: number
  iAc1: number; iAc2: number; iAc3: number
  uAc1: number; uAc2: number; uAc3: number
  iPv1: number; iPv2: number; iPv3: number; iPv4: number
  uPv1: number; uPv2: number; uPv3: number; uPv4: number
  fac: number            // Grid frequency (Hz)
  inverterTemperature: number
  powerFactor: number
  fullHour: number
  totalFullHour: number
  batteryVoltage: number
  bstteryCurrent: number
  batteryHealthSoh: number
  batteryTodayChargeEnergy: number
  batteryTodayDischargeEnergy: number
  batteryTotalChargeEnergy: number
  batteryTotalDischargeEnergy: number
  gridPurchasedMonthEnergy: number
  gridPurchasedYearEnergy: number
  gridPurchasedTotalEnergy: number
  gridSellMonthEnergy: number
  gridSellYearEnergy: number
  gridSellTotalEnergy: number
  homeLoadTotalEnergy: number
  collectorState: 1 | 2
  warningInfoData: number
}

export interface InverterDayPoint {
  dataTimestamp: number
  timeStr: string        // e.g. "05:01:31"
  pac: number
  eToday: number
  eTotal: number
  gridPurchasedEnergy: number
  gridSellEnergy: number
  batteryChargeEnergy: number
  batteryDischargeEnergy: number
  homeLoadEnergy: number
  state: 1 | 2 | 3
}

export interface InverterMonthPoint {
  inverterId: string
  date: number           // timestamp
  dateStr: string        // "2023-06-01"
  energy: number         // kWh generated
  gridPurchasedEnergy: number
  gridSellEnergy: number
  batteryChargeEnergy: number
  batteryDischargeEnergy: number
  homeLoadEnergy: number
  money: number
}

export interface InverterYearPoint extends InverterMonthPoint {
  dateStr: string        // "2023-01"
}

export interface AlarmRecord {
  id: string
  stationId: string
  stationName: string
  alarmDeviceSn: string
  alarmCode: string
  alarmLevel: '1' | '2' | '3'    // 1=tip 2=general 3=emergency
  alarmBeginTime: number
  alarmEndTime: number
  alarmMsg: string
  advice: string
  state: '0' | '1' | '2'         // 0=pending 1=processed 2=restored
}

export interface StationSummary {
  id: string
  stationName: string
  nmiCode: string
  power: number
  dayEnergy: number
  monthEnergy: number
  yearEnergy: number
  allEnergy: number
}
```

---

## 6. Domain Types — `src/types/index.ts`

```typescript
export interface ImportTariff {
  id: 1 | 2 | 3
  name: string            // e.g. "Night rate"
  rate: number            // €/kWh
  startTime: string       // "HH:MM" 24h
  endTime: string         // "HH:MM" 24h
}

export interface TariffSettings {
  exportRate: number      // €/kWh
  importTariffs: [ImportTariff, ImportTariff, ImportTariff]
  billingCycleStartDay: number   // default 10
  currency: string               // default "EUR"
  currencySymbol: string         // default "€"
}

export const DEFAULT_TARIFFS: TariffSettings = {
  exportRate: 0.12,
  importTariffs: [
    { id: 1, name: 'Night rate', rate: 0.18, startTime: '00:00', endTime: '08:00' },
    { id: 2, name: 'Day rate',   rate: 0.28, startTime: '08:00', endTime: '17:00' },
    { id: 3, name: 'Peak rate',  rate: 0.42, startTime: '17:00', endTime: '23:00' },
  ],
  billingCycleStartDay: 10,
  currency: 'EUR',
  currencySymbol: '€',
}

export type InverterStatus = 'online' | 'offline' | 'alarm'

export type EnergyPeriod = 'day' | 'month' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}
```

---

## 7. Tariff Calculation — `src/lib/tariffs/calculator.ts`

```typescript
import type { ImportTariff, TariffSettings } from '@/types'
import type { InverterDayPoint } from '@/lib/solis/types'

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

/**
 * Time-weighted blended import rate across all tariff periods.
 * Used for month/year/custom totals where 5-min data is not available.
 */
export function calcBlendedImportRate(tariffs: ImportTariff[]): number {
  let weighted = 0
  let totalHours = 0
  for (const t of tariffs) {
    const start = timeToHours(t.startTime)
    const end = timeToHours(t.endTime)
    const hours = end > start ? end - start : 24 + end - start
    weighted += t.rate * hours
    totalHours += hours
  }
  return totalHours > 0 ? weighted / totalHours : 0
}

/**
 * Precise daily import cost using 5-min interval data from /v1/api/inverterDay.
 * Each interval timestamp is mapped to the active tariff at that time of day.
 */
export function calcPreciseDailyCost(
  intervals: InverterDayPoint[],
  tariffs: ImportTariff[]
): number {
  return intervals.reduce((total, point) => {
    const d = new Date(point.dataTimestamp)
    const pointHours = d.getHours() + d.getMinutes() / 60
    const activeTariff = tariffs.find((t) => {
      const s = timeToHours(t.startTime)
      const e = timeToHours(t.endTime)
      return e > s
        ? pointHours >= s && pointHours < e
        : pointHours >= s || pointHours < e   // overnight period
    })
    return total + point.gridPurchasedEnergy * (activeTariff?.rate ?? 0)
  }, 0)
}

export function calcExportRevenue(exportKwh: number, settings: TariffSettings): number {
  return exportKwh * settings.exportRate
}

export function calcImportCost(importKwh: number, settings: TariffSettings): number {
  const rate = calcBlendedImportRate(settings.importTariffs)
  return importKwh * rate
}
```

### `src/lib/tariffs/storage.ts`

```typescript
import type { TariffSettings } from '@/types'
import { DEFAULT_TARIFFS } from '@/types'

const STORAGE_KEY = 'solar_reporter_tariffs'

export function loadTariffs(): TariffSettings {
  if (typeof window === 'undefined') return DEFAULT_TARIFFS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_TARIFFS, ...JSON.parse(raw) } : DEFAULT_TARIFFS
  } catch {
    return DEFAULT_TARIFFS
  }
}

export function saveTariffs(settings: TariffSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
```

---

## 8. Billing Cycle Utility — `src/lib/utils/billing-cycle.ts`

```typescript
import type { DateRange } from '@/types'

/**
 * Returns the billing period containing `referenceDate`.
 * offset=0 → current cycle, offset=-1 → previous cycle, etc.
 * Cycle runs from `startDay` of month N to `startDay-1` of month N+1.
 */
export function getBillingCycle(
  referenceDate: Date = new Date(),
  startDay: number = 10,
  offset: number = 0
): DateRange {
  const d = referenceDate
  const inCurrentMonth = d.getDate() >= startDay

  // Base: the month where this cycle started
  let baseMonth = d.getMonth() + (inCurrentMonth ? 0 : -1) + offset
  let baseYear = d.getFullYear() + Math.floor(baseMonth / 12)
  baseMonth = ((baseMonth % 12) + 12) % 12

  const from = new Date(baseYear, baseMonth, startDay)
  const to = new Date(baseYear, baseMonth + 1, startDay - 1)

  return { from, to }
}

export function formatBillingCycleLabel(range: DateRange): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

/** Generate an array of yyyy-MM month strings that fall within a date range. */
export function monthsInRange(range: DateRange): string[] {
  const months: string[] = []
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1)
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), 1)
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}
```

---

## 9. Custom Hooks

### `src/hooks/useTariffs.ts`
```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { loadTariffs, saveTariffs } from '@/lib/tariffs/storage'
import type { TariffSettings } from '@/types'

export function useTariffs() {
  const [tariffs, setTariffsState] = useState<TariffSettings>(loadTariffs)

  useEffect(() => {
    setTariffsState(loadTariffs())
  }, [])

  const setTariffs = useCallback((next: TariffSettings) => {
    saveTariffs(next)
    setTariffsState(next)
  }, [])

  return { tariffs, setTariffs }
}
```

### `src/hooks/useInverterList.ts`
```typescript
'use client'
import useSWR from 'swr'
import type { InverterSummary } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterList(stationId?: string) {
  const body = { pageNo: '1', pageSize: '100', ...(stationId && { stationId }) }
  const { data, error, isLoading } = useSWR<{ page: { records: InverterSummary[] } }>(
    ['/api/solis/inverter-list', body],
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 300_000 }   // 5 min — matches SolisCloud data refresh
  )
  return {
    inverters: data?.page?.records ?? [],
    error,
    isLoading,
  }
}
```

Apply the same SWR pattern for `useInverterDetail`, `useInverterDay`, `useInverterMonth`, `useInverterYear`, and `useAlarms`.  Use the appropriate endpoint path and body for each. For `useInverterDay`, `useInverterMonth`, and `useInverterYear`, include the selected date/month/year as a key parameter so SWR refetches when the period changes.

---

## 10. Screen Specifications

### 10.1 Dashboard (`/dashboard`)

**Data sources:** `useInverterList` (real-time) + derived totals from the list response.

**Layout (top to bottom):**
1. `TopBar` — title "Dashboard", subtitle "Station Name · Updated N min ago"
2. `PowerFlowDiagram` — SVG component, 200px tall, dark (#1a1a2e) background card
3. `StatCard` grid — 2×2: Generation today / Grid import today / Grid export today / Self-consumption %
4. `BatteryBar` — single wide card: SOC progress bar, charging/discharging label, SOH

**`PowerFlowDiagram` node positions:**
```
[Solar PV]  ─────────────→  [Inverter]  ──────────→  [Grid Export]
                                │
                                ├──────────→  [Home Load]
                                │
                    [Grid Import] ──→ ┘     [Battery]
```

All arrows are animated dashed lines (`stroke-dashoffset` CSS animation). Arrow direction and colour reflect actual power direction:
- Solar → Inverter: amber, always active when `pac > 0`
- Inverter → Grid Export: green, when `gridSellTodayEnergy` active
- Grid Import → Inverter: blue, when `pSum > 0`
- Inverter → Home Load: purple
- Inverter ↔ Battery: orange; direction from `batteryPower` sign

Node values: live kW from API. Sub-label: today kWh.

**`StatCard` props:**
```typescript
interface StatCardProps {
  label: string
  value: number
  unit: string
  color?: string     // Tailwind text colour class
  trend?: string     // e.g. "↑ 12% vs yesterday"
}
```

---

### 10.2 Energy (`/energy`)

**Data sources:** `useInverterDay` / `useInverterMonth` / `useInverterYear` based on selected period. For custom range, aggregate day-by-day using `useInverterDay` (sequential calls, one per day in range).

**State:**
```typescript
const [period, setPeriod] = useState<EnergyPeriod>('day')
const [customRange, setCustomRange] = useState<DateRange>(getBillingCycle())
const [cycleOffset, setCycleOffset] = useState(0)
const { tariffs } = useTariffs()
```

**Layout:**
1. `PeriodToggle` — Day / Month / Year / Custom pill buttons
2. `CustomDatePanel` (visible when `period === 'custom'`):
   - Billing cycle shortcut card (auto-calculates from today + `cycleOffset`)
   - Previous cycle / Next cycle navigation buttons
   - `<input type="date">` From / To fields
   - Apply button
3. Active range tag pill (shown when custom range is active)
4. Legend row
5. `EnergyChart` — Chart.js bar chart, 200px, 4 datasets: Generation (amber), Import (blue), Export (green), Load (purple)
6. `EnergyStatCard` grid — 2×2:

| Card | kWh id | Cost/revenue |
|---|---|---|
| Total generation | `e-gen` | — |
| Total import | `e-imp` | Red `€X.XX` (cost) |
| Total export | `e-exp` | Green `€X.XX` (revenue) |
| Home load | `e-load` | — |

**`EnergyStatCard` props:**
```typescript
interface EnergyStatCardProps {
  label: string
  kwh: number
  unit: string
  valueColor?: string
  cost?: number          // If provided, renders below kWh
  costColor?: 'red' | 'green'
  currencySymbol?: string
}
```

**Cost calculation per period:**
- **Day:** `calcPreciseDailyCost(intervals, tariffs.importTariffs)` for import; `intervals[last].eToday * exportRate` for export revenue
- **Month/Year/Custom:** `calcImportCost(totalImportKwh, tariffs)` (blended rate); `calcExportRevenue(totalExportKwh, tariffs)`

**Custom range data fetching strategy:**
When period is `custom`, fetch `inverterMonth` for each calendar month that overlaps the range, then sum only the `InverterMonthPoint` records whose `dateStr` falls within `range.from` to `range.to`. This avoids making 30 individual day calls.

---

### 10.3 Inverters (`/inverters`)

**Data source:** `useInverterList`

**Layout:**
1. Section heading "Inverters · N devices"
2. List of `InverterCard` components
3. Tapping a card navigates to `/inverters/[id]`

**`InverterCard` shows:**
- Inverter name / SN / status pill (Online=green / Offline=gray / Alarm=red)
- 3-column stat row: Now (kW) / Today (kWh) / Total (MWh)

**`/inverters/[id]` — detail page:**  
Fetches `useInverterDetail(id)`. Shows a full detail table:

| Field | API key |
|---|---|
| Real-time power | `pac` + `pacStr` |
| AC voltage R/S/T | `uAc1` / `uAc2` / `uAc3` |
| AC current R/S/T | `iAc1` / `iAc2` / `iAc3` |
| DC voltage PV1–4 | `uPv1`–`uPv4` |
| DC current PV1–4 | `iPv1`–`iPv4` |
| Grid frequency | `fac` Hz |
| Temperature | `inverterTemperature` °C |
| Power factor | `powerFactor` |
| Full hours today | `fullHour` h |
| Battery SOC | `batteryCapacitySoc` % |
| Battery SOH | `batteryHealthSoh` % |
| Battery power | `batteryPower` kW |
| Battery voltage | `batteryVoltage` V |
| Charge today | `batteryTodayChargeEnergy` kWh |
| Discharge today | `batteryTodayDischargeEnergy` kWh |
| Grid import today | `gridPurchasedTodayEnergy` kWh |
| Grid export today | `gridSellTodayEnergy` kWh |
| Home load today | `homeLoadTodayEnergy` kWh |
| Collector SN | `collectorSn` |
| Collector state | `collectorState` (1=online, 2=offline) |
| Status | `state` |

---

### 10.4 Alarms (`/alarms`)

**Data source:** `useAlarms`

**Layout:**
1. Section heading with unresolved count
2. Filter row: All / Pending / Processed / Resolved (maps to `state` filter param)
3. List of `AlarmCard` components sorted by `alarmBeginTime` desc

**`AlarmCard` shows:**
- Title (alarm message or fallback to alarm code)
- Level pill: Tip (amber) / General (amber-dark) / Emergency (red)
- Station name + inverter SN + start time
- Advice text

**Level mapping:**
```typescript
const ALARM_LEVEL: Record<string, { label: string; class: string }> = {
  '1': { label: 'Tip',       class: 'bg-amber-50 text-amber-900' },
  '2': { label: 'General',   class: 'bg-amber-100 text-amber-800' },
  '3': { label: 'Emergency', class: 'bg-red-50 text-red-800' },
}
```

---

### 10.5 Settings (`/settings`)

Settings are persisted to `localStorage` via `useTariffs`. No server-side storage.

**Sections:**

#### API connection (read-only display)
Shows endpoint, API ID (masked), connection status (test ping to `/api/solis/station-list`).

#### Tariffs
**Export tariff:**
- Rate `<input type="number" step="0.01">` with `€` prefix and `/kWh` suffix

**Import tariffs (3 blocks):**

Each `ImportTariffBlock` contains:
```
[colour dot] [name <input type="text">]
──────────────────────────────────────
Rate: € [<input>] /kWh  |  Start: [<input type="time">]  |  End: [<input type="time">]
```

Colour dots: Blue (#185FA5) / Medium Blue (#378ADD) / Red (#E24B4A)

Below the 3 blocks, display a read-only "Blended import rate" card:
```
Blended rate: €X.XXX /kWh
(time-weighted across all 3 tariff periods)
```

All tariff inputs call `setTariffs(...)` on `onChange` — changes propagate immediately to the Energy page.

#### Billing cycle
```
Cycle start day: [10th of month]  (editable <input type="number" min="1" max="28">)
Current period:  10 Apr – 9 May 2026  (computed, read-only)
```

#### Display preferences
```
Timezone:          <select>  (UTC offsets: -12 to +14)
Currency:          EUR (€)
Refresh interval:  5 min  (fixed for now, matches SolisCloud data frequency)
```

---

## 11. Layout — `src/components/layout/MobileShell.tsx`

The entire app is wrapped in a mobile shell that constrains the content to a phone-width column. On desktop, the shell renders centered with the phone frame visible.

```typescript
// Renders as:
// ┌─────────────────────────────────────────────────────┐  ← desktop bg
// │         ┌──────────────────┐                        │
// │         │  [TopBar]        │  ← 390px max-w         │
// │         │  [Content]       │                        │
// │         │  [BottomNav]     │                        │
// │         └──────────────────┘                        │
// └─────────────────────────────────────────────────────┘

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-4">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col shadow-xl rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

**`TopBar`** — fixed top, dark navy (`#1a1a2e`), white text. Props: `title`, `subtitle`. Right slot: bell icon that navigates to `/alarms`, with red dot badge if unresolved alarms exist.

**`BottomNav`** — fixed bottom, dark navy. 5 items: Dashboard / Energy / Inverters / Alarms / Settings. Active item: green (`#1D9E75`).

---

## 12. Styling conventions (Tailwind)

- **Primary action colour:** `#1D9E75` (Solis green) — use arbitrary value `bg-[#1D9E75]`
- **Dark nav/header:** `bg-[#1a1a2e]`
- **Import cost text:** `text-red-800`
- **Export revenue text:** `text-green-800`
- **Card:** `bg-white rounded-xl border border-gray-100 p-3`
- **Stat value:** `text-xl font-medium`
- **Cost/revenue sub-line:** `text-sm font-medium mt-1`
- **Status pills:**
  - Online: `bg-emerald-50 text-emerald-800`
  - Offline: `bg-gray-100 text-gray-600`
  - Alarm: `bg-red-50 text-red-800`
- **Section label:** `text-xs text-gray-500 uppercase tracking-wide mb-1.5`

---

## 13. Data Fetching & Caching Strategy

| Data | Refresh | Notes |
|---|---|---|
| Inverter list (real-time) | 5 min | SolisCloud updates every 5 min |
| Inverter detail | 5 min | |
| Day chart (inverterDay) | 5 min | Only today's date; historical dates are immutable |
| Month chart (inverterMonth) | 1 hour | Current month only; past months immutable |
| Year chart (inverterYear) | 1 hour | |
| Alarm list | 2 min | More frequent — alarms are time-sensitive |
| Station list | 1 hour | Rarely changes |

Use SWR `revalidateOnFocus: false` to avoid excessive calls when the user switches tabs. SolisCloud rate limit is 2 requests/second per endpoint — SWR's deduplication handles burst prevention.

---

## 14. Error Handling

- All Route Handlers return `{ error: string, code: string }` with HTTP 502 on upstream failure.
- Client hooks expose `error` from SWR. Components show an inline error card:
  ```
  ⚠ Could not load data — SolisCloud API error (code: XXXX)
  [Retry]
  ```
- Common SolisCloud error codes to surface to the user:
  - `47`: Signature expired (clock skew > 15 min — show "Check device clock")
  - `50`: Invalid API credentials
  - `51`: API rate limit exceeded

---

## 15. `package.json` dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "lucide-react": "^0.383.0",
    "swr": "^2.2.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
```

---

## 16. `vercel.json`

```json
{
  "framework": "nextjs",
  "regions": ["dub1"],
  "env": {
    "SOLIS_API_ID": "@solis-api-id",
    "SOLIS_API_SECRET": "@solis-api-secret",
    "SOLIS_BASE_URL": "@solis-base-url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

Set Vercel environment variables via the CLI before first deploy:
```bash
vercel env add SOLIS_API_ID
# enter: 1300386381678076897

vercel env add SOLIS_API_SECRET
# enter: b97bb88ebb77424eb160b963d51cafaa

vercel env add SOLIS_BASE_URL
# enter: https://www.soliscloud.com:13333
```
Or set them in the Vercel dashboard under Project → Settings → Environment Variables. Apply to Production, Preview, and Development environments.

Region `dub1` (Dublin) is recommended for EU proximity to SolisCloud's European servers.

---

## 17. `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // Prevent server-only modules leaking to client bundle
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

export default config
```

---

## 18. Development Setup

```bash
# 1. Bootstrap
npx create-next-app@14 solar-reporter --typescript --tailwind --app --src-dir --import-alias "@/*"
cd solar-reporter

# 2. Install runtime dependencies
npm install chart.js react-chartjs-2 lucide-react swr

# 3. Configure env
cp .env.example .env.local
# .env.local should contain:
#   SOLIS_API_ID=1300386381678076897
#   SOLIS_API_SECRET=b97bb88ebb77424eb160b963d51cafaa
#   SOLIS_BASE_URL=https://www.soliscloud.com:13333

# 4. Run dev server
npm run dev
# App available at http://localhost:3000

# 5. Verify API connectivity — once Route Handlers are built, test with:
curl -X POST http://localhost:3000/api/solis/station-list \
  -H "Content-Type: application/json" \
  -d '{"pageNo":"1","pageSize":"10"}'
# Expect: { page: { records: [...] } }
```

---

## 19. Implementation Order (recommended for Claude Code)

Build in this sequence to allow incremental testing:

1. **`src/lib/solis/auth.ts`** — auth utility, test with a known request
2. **Route Handlers** — all 8 endpoints, test with curl/Postman before building UI
3. **`src/types/index.ts`** + **`src/lib/solis/types.ts`** — all TypeScript interfaces
4. **`src/lib/tariffs/`** — calculator + storage
5. **`src/lib/utils/`** — formatters + billing-cycle
6. **`src/hooks/`** — all hooks (start with `useTariffs`, then data hooks)
7. **Layout components** — `MobileShell`, `TopBar`, `BottomNav`
8. **Dashboard page** — `PowerFlowDiagram`, `StatCard`, `BatteryBar`
9. **Energy page** — `PeriodToggle`, `CustomDatePanel`, `EnergyChart`, `EnergyStatCard`
10. **Inverters list + detail pages**
11. **Alarms page**
12. **Settings page** — `ExportTariffBlock`, `ImportTariffBlock`, display prefs
13. **Vercel deployment** — env vars, verify API calls work from deployed URL

---

## 20. Security notes

- `SOLIS_API_SECRET` is accessed only in Next.js Route Handlers (Node.js runtime). It is never passed to the client bundle.
- Route Handlers do not expose the raw SolisCloud response — they strip the outer `{success, code, msg}` envelope and return only `data`, preventing accidental leakage of internal error codes.
- No user authentication is implemented (single-user app). If multi-user access is needed in future, add NextAuth.js and store per-user API credentials server-side (e.g. Vercel KV or Postgres).
- Do not commit `.env.local`. Ensure `.gitignore` contains `.env*.local`.

---

*End of Solutions Design Document*
