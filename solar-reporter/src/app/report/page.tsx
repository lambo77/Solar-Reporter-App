'use client'
import { useState, useMemo } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { useInverterList } from '@/hooks/useInverterList'
import { useInverterMonthRange } from '@/hooks/useInverterMonthRange'
import { useTariffs } from '@/hooks/useTariffs'
import { calcBlendedImportRate, calcExportRevenue } from '@/lib/tariffs/calculator'
import { monthsInRange } from '@/lib/utils/billing-cycle'
import { formatDateIso } from '@/lib/utils/formatters'

function ReportCard({
  label,
  kwh,
  valueLabel,
  value,
  sub,
  kwhColor,
  valueColor,
}: {
  label: string
  kwh: number
  valueLabel: string
  value: number
  sub: string
  kwhColor: string
  valueColor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${kwhColor}`}>
        {kwh.toFixed(2)}
        <span className="text-sm font-normal text-gray-500 ml-1">kWh</span>
      </p>
      <p className={`text-base font-medium mt-1 ${valueColor}`}>{valueLabel}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

export default function ReportPage() {
  const now = new Date()
  const today = formatDateIso(now)
  const firstOfMonth = formatDateIso(new Date(now.getFullYear(), now.getMonth(), 1))

  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)

  const { tariffs } = useTariffs()
  const { inverters } = useInverterList()
  const inv = inverters[0]

  const months = useMemo(
    () => monthsInRange({ from: new Date(from), to: new Date(to) }),
    [from, to]
  )

  const { points, isLoading, error } = useInverterMonthRange(
    inv?.id ?? '',
    inv?.sn ?? '',
    months
  )

  const filtered = useMemo(
    () => points.filter((p) => p.dateStr >= from && p.dateStr <= to),
    [points, from, to]
  )

  const totals = useMemo(
    () => ({
      gen:  filtered.reduce((s, p) => s + p.energy, 0),
      imp:  filtered.reduce((s, p) => s + p.gridPurchasedEnergy, 0),
      exp:  filtered.reduce((s, p) => s + p.gridSellEnergy, 0),
      load: filtered.reduce((s, p) => s + p.homeLoadEnergy, 0),
    }),
    [filtered]
  )

  const blendedRate = calcBlendedImportRate(tariffs.importTariffs)
  const importCost = totals.imp * blendedRate
  const exportRevenue = calcExportRevenue(totals.exp, tariffs)
  const selfConsumed = Math.max(0, totals.gen - totals.exp)
  const genValue = selfConsumed * blendedRate + exportRevenue
  const netSavings = genValue - importCost
  const sym = tariffs.currencySymbol

  const hasData = !isLoading && filtered.length > 0

  return (
    <MobileShell>
      <TopBar title="Report" />

      <div className="flex-1 overflow-y-auto py-4 space-y-3 px-3">

        <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Date range</p>
          <div className="flex gap-2 items-center">
            <input
              type="date" value={from} max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date" value={to} min={from} max={today}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400 text-sm py-8">Loading…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
            Could not load data — {error.message}
          </div>
        )}

        {hasData && (
          <>
            <ReportCard
              label="Generation"
              kwh={totals.gen}
              valueLabel={`${sym}${genValue.toFixed(2)} value`}
              value={genValue}
              sub={`${sym}${(selfConsumed * blendedRate).toFixed(2)} avoided cost · ${sym}${exportRevenue.toFixed(2)} export credit`}
              kwhColor="text-amber-600"
              valueColor="text-green-700"
            />

            <ReportCard
              label="Consumption"
              kwh={totals.load}
              valueLabel={`${sym}${importCost.toFixed(2)} cost`}
              value={importCost}
              sub={`${totals.imp.toFixed(2)} kWh from grid · blended rate ${sym}${blendedRate.toFixed(3)}/kWh`}
              kwhColor="text-purple-600"
              valueColor="text-red-700"
            />

            <ReportCard
              label="Export to grid"
              kwh={totals.exp}
              valueLabel={`${sym}${exportRevenue.toFixed(2)} credit`}
              value={exportRevenue}
              sub={`Feed-in rate ${sym}${tariffs.exportRate.toFixed(3)}/kWh`}
              kwhColor="text-green-600"
              valueColor="text-green-700"
            />

            <div className={`rounded-xl border p-4 ${netSavings >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Net position</p>
              <p className={`text-2xl font-semibold ${netSavings >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netSavings >= 0 ? '+' : ''}{sym}{Math.abs(netSavings).toFixed(2)}
                {netSavings >= 0 ? ' saved' : ' net cost'}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                {sym}{genValue.toFixed(2)} generation value − {sym}{importCost.toFixed(2)} import cost
              </p>
            </div>
          </>
        )}

        {!isLoading && !error && filtered.length === 0 && inv && (
          <div className="text-center text-gray-400 text-sm py-8">No data for this period.</div>
        )}

      </div>

      <BottomNav />
    </MobileShell>
  )
}
