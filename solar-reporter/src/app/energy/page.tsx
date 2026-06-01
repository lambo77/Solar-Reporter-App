'use client'
import { useState, useMemo } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { CostChart } from '@/components/energy/CostChart'
import { useInverterList } from '@/hooks/useInverterList'
import { useInverterMonth } from '@/hooks/useInverterMonth'
import { useTariffs } from '@/hooks/useTariffs'
import { calcBlendedImportRate } from '@/lib/tariffs/calculator'
import { formatDateIso } from '@/lib/utils/formatters'

function toYearMonth(dateStr: string) {
  return dateStr.slice(0, 7) // 'YYYY-MM'
}

function monthsBetween(from: string, to: string): string[] {
  const result: string[] = []
  const start = new Date(from + '-01')
  const end   = new Date(to   + '-01')
  while (start <= end && result.length < 3) {
    const y = start.getFullYear()
    const m = String(start.getMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}`)
    start.setMonth(start.getMonth() + 1)
  }
  return result
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 p-3 text-center">
      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-base font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

export default function ReportingPage() {
  const today        = formatDateIso(new Date())
  const thirtyAgo    = formatDateIso(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

  const [fromDate, setFromDate] = useState(thirtyAgo)
  const [toDate,   setToDate]   = useState(today)

  const { tariffs }    = useTariffs()
  const { inverters }  = useInverterList()
  const inv            = inverters[0]

  const months = useMemo(
    () => monthsBetween(toYearMonth(fromDate), toYearMonth(toDate)),
    [fromDate, toDate],
  )

  const { points: m0 } = useInverterMonth(inv?.id ?? '', inv?.sn ?? '', months[0] ?? '')
  const { points: m1 } = useInverterMonth(inv?.id ?? '', inv?.sn ?? '', months[1] ?? '')
  const { points: m2 } = useInverterMonth(inv?.id ?? '', inv?.sn ?? '', months[2] ?? '')

  const blendedRate = calcBlendedImportRate(tariffs.importTariffs)

  const days = useMemo(() => {
    const all = [...m0, ...m1, ...m2].filter(
      (p) => p.dateStr >= fromDate && p.dateStr <= toDate,
    )
    all.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    return all.map((p) => ({
      label:   p.dateStr.slice(5),
      cost:    p.gridPurchasedEnergy * blendedRate,
      revenue: p.gridSellEnergy * tariffs.exportRate,
    }))
  }, [m0, m1, m2, fromDate, toDate, blendedRate, tariffs.exportRate])

  const totalCost    = days.reduce((s, d) => s + d.cost, 0)
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0)
  const net          = totalCost - totalRevenue

  return (
    <MobileShell>
      <TopBar title="Reporting" />

      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-3">

        {/* Date range pickers */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Date range</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={today}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Bar chart */}
        {days.length > 0 ? (
          <CostChart days={days} />
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            <p className="text-slate-500 text-sm">No data for selected range</p>
          </div>
        )}

        {/* Summary totals */}
        {days.length > 0 && (
          <div className="flex gap-2">
            <SummaryCard
              label="Import cost"
              value={`€${totalCost.toFixed(2)}`}
              color="text-red-400"
            />
            <SummaryCard
              label="Export revenue"
              value={`€${totalRevenue.toFixed(2)}`}
              color="text-emerald-400"
            />
            <SummaryCard
              label="Net cost"
              value={`€${net.toFixed(2)}`}
              color={net > 0 ? 'text-red-400' : 'text-emerald-400'}
            />
          </div>
        )}

      </div>

      <BottomNav />
    </MobileShell>
  )
}
