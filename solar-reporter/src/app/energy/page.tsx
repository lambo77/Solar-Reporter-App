'use client'
import { useState, useMemo } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PeriodToggle } from '@/components/energy/PeriodToggle'
import { CustomDatePanel } from '@/components/energy/CustomDatePanel'
import { EnergyChart } from '@/components/energy/EnergyChart'
import { EnergyStatCard } from '@/components/energy/EnergyStatCard'
import { useInverterList } from '@/hooks/useInverterList'
import { useInverterDay } from '@/hooks/useInverterDay'
import { useInverterMonth } from '@/hooks/useInverterMonth'
import { useInverterYear } from '@/hooks/useInverterYear'
import { useTariffs } from '@/hooks/useTariffs'
import { useBillingCycle } from '@/hooks/useBillingCycle'
import { calcPreciseDailyCost, calcImportCost, calcExportRevenue } from '@/lib/tariffs/calculator'
import { monthsInRange, formatBillingCycleLabel } from '@/lib/utils/billing-cycle'
import { formatDateIso, formatMonth, formatYear } from '@/lib/utils/formatters'
import type { EnergyPeriod } from '@/types'

export default function EnergyPage() {
  const [period, setPeriod] = useState<EnergyPeriod>('day')
  const today = formatDateIso(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedMonth, setSelectedMonth] = useState(formatMonth(new Date()))
  const [selectedYear, setSelectedYear] = useState(formatYear(new Date()))
  const [customFrom, setCustomFrom] = useState(today)
  const [customTo, setCustomTo] = useState(today)

  const { tariffs } = useTariffs()
  const { cycle, prev, next } = useBillingCycle(tariffs.billingCycleStartDay)
  const { inverters } = useInverterList()
  const inv = inverters[0]

  const { points: dayPoints } = useInverterDay(inv?.id ?? '', inv?.sn ?? '', selectedDate)
  const { points: monthPoints } = useInverterMonth(inv?.id ?? '', inv?.sn ?? '', selectedMonth)
  const { points: yearPoints } = useInverterYear(inv?.id ?? '', inv?.sn ?? '', selectedYear)

  // Custom range: fetch months that overlap the range, filter by date
  const customMonths = useMemo(() => {
    if (period !== 'custom') return []
    return monthsInRange({ from: new Date(customFrom), to: new Date(customTo) })
  }, [period, customFrom, customTo])

  // For simplicity, custom range uses the last fetched month points filtered to date range
  // (In production each month would be fetched individually)
  const customPoints = useMemo(() => {
    if (!customMonths.length) return []
    return monthPoints.filter((p) => p.dateStr >= customFrom && p.dateStr <= customTo)
  }, [monthPoints, customFrom, customTo, customMonths])

  const chartPoints = useMemo(() => {
    if (period === 'day') {
      return dayPoints.map((p, i) => {
        const prev = dayPoints[i - 1]
        return {
          label: p.timeStr.slice(0, 5),
          generation: p.eToday - (prev?.eToday ?? 0),
          import: p.gridPurchasedEnergy - (prev?.gridPurchasedEnergy ?? 0),
          export: p.gridSellEnergy - (prev?.gridSellEnergy ?? 0),
          load: p.homeLoadEnergy - (prev?.homeLoadEnergy ?? 0),
        }
      })
    }
    if (period === 'month') {
      return monthPoints.map((p) => ({
        label: p.dateStr.slice(8),
        generation: p.energy,
        import: p.gridPurchasedEnergy,
        export: p.gridSellEnergy,
        load: p.homeLoadEnergy,
      }))
    }
    if (period === 'year') {
      return yearPoints.map((p) => ({
        label: p.dateStr.slice(5),
        generation: p.energy,
        import: p.gridPurchasedEnergy,
        export: p.gridSellEnergy,
        load: p.homeLoadEnergy,
      }))
    }
    return customPoints.map((p) => ({
      label: p.dateStr.slice(5),
      generation: p.energy,
      import: p.gridPurchasedEnergy,
      export: p.gridSellEnergy,
      load: p.homeLoadEnergy,
    }))
  }, [period, dayPoints, monthPoints, yearPoints, customPoints])

  const totals = useMemo(() => {
    const pts = chartPoints
    return {
      gen:    pts.reduce((s, p) => s + p.generation, 0),
      imp:    pts.reduce((s, p) => s + p.import, 0),
      exp:    pts.reduce((s, p) => s + p.export, 0),
      load:   pts.reduce((s, p) => s + p.load, 0),
    }
  }, [chartPoints])

  const importCost = period === 'day'
    ? calcPreciseDailyCost(dayPoints, tariffs.importTariffs)
    : calcImportCost(totals.imp, tariffs)
  const exportRevenue = calcExportRevenue(totals.exp, tariffs)

  return (
    <MobileShell>
      <TopBar title="Energy" />

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        <PeriodToggle value={period} onChange={setPeriod} />

        {period === 'day' && (
          <div className="px-3">
            <input type="date" value={selectedDate} max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
          </div>
        )}
        {period === 'month' && (
          <div className="px-3">
            <input type="month" value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
          </div>
        )}
        {period === 'year' && (
          <div className="px-3">
            <input type="number" value={selectedYear} min="2020" max={new Date().getFullYear()}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
          </div>
        )}
        {period === 'custom' && (
          <>
            <CustomDatePanel
              cycle={cycle}
              from={customFrom}
              to={customTo}
              onFromChange={setCustomFrom}
              onToChange={setCustomTo}
              onPrev={prev}
              onNext={next}
              onApplyCycle={() => {
                setCustomFrom(formatDateIso(cycle.from))
                setCustomTo(formatDateIso(cycle.to))
              }}
            />
            <div className="px-3">
              <span className="inline-block bg-gray-100 text-gray-600 text-xs rounded-full px-3 py-1">
                {formatBillingCycleLabel({ from: new Date(customFrom), to: new Date(customTo) })}
              </span>
            </div>
          </>
        )}

        {chartPoints.length > 0 && <EnergyChart points={chartPoints} />}

        <div className="grid grid-cols-2 gap-3 px-3">
          <EnergyStatCard label="Generation" kwh={totals.gen} valueColor="text-amber-600" />
          <EnergyStatCard label="Import" kwh={totals.imp} valueColor="text-blue-600"
            cost={importCost} costColor="red" currencySymbol={tariffs.currencySymbol} />
          <EnergyStatCard label="Export" kwh={totals.exp} valueColor="text-green-600"
            cost={exportRevenue} costColor="green" currencySymbol={tariffs.currencySymbol} />
          <EnergyStatCard label="Home load" kwh={totals.load} valueColor="text-purple-600" />
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  )
}
