'use client'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PowerFlowDiagram } from '@/components/dashboard/PowerFlowDiagram'
import { StatCard } from '@/components/dashboard/StatCard'
import { BatteryBar } from '@/components/dashboard/BatteryBar'
import { useInverterList } from '@/hooks/useInverterList'
import { useAlarms } from '@/hooks/useAlarms'
import { formatRelativeMinutes } from '@/lib/utils/formatters'

export default function DashboardPage() {
  const { inverters, isLoading, error } = useInverterList()
  const { alarms } = useAlarms()
  const inv = inverters[0]
  const unresolvedAlarms = alarms.filter((a) => a.state === '0').length

  const selfConsumption =
    inv && inv.etoday > 0
      ? Math.min(100, ((inv.etoday - inv.gridSellTodayEnergy) / inv.etoday) * 100)
      : 0

  return (
    <MobileShell>
      <TopBar
        title="Dashboard"
        subtitle={
          inv
            ? `${inv.stationName} · Updated ${formatRelativeMinutes(inv.dataTimestamp)}`
            : 'Solar Reporter'
        }
        alarmCount={unresolvedAlarms}
      />

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {isLoading && (
          <div className="text-center text-gray-400 text-sm py-8">Loading…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
            ⚠ Could not load data — {error.message}
          </div>
        )}

        {inv && (
          <>
            <PowerFlowDiagram inverter={inv} />

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Generation today" value={inv.etoday} unit="kWh" color="text-amber-600" />
              <StatCard label="Grid import today" value={inv.gridPurchasedTodayEnergy} unit="kWh" color="text-blue-600" />
              <StatCard label="Grid export today" value={inv.gridSellTodayEnergy} unit="kWh" color="text-green-600" />
              <StatCard label="Self-consumption" value={selfConsumption} unit="%" color="text-purple-600" />
            </div>

            <BatteryBar
              soc={inv.batteryCapacitySoc}
              soh={0}
              power={inv.batteryPower}
            />
          </>
        )}
      </div>

      <BottomNav />
    </MobileShell>
  )
}
