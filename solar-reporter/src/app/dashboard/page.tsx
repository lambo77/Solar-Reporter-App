'use client'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PowerFlowDiagram } from '@/components/dashboard/PowerFlowDiagram'
import { useInverterList } from '@/hooks/useInverterList'
import { formatRelativeMinutes } from '@/lib/utils/formatters'

export default function DashboardPage() {
  const { inverters, isLoading, error } = useInverterList()
  const inv = inverters[0]

  return (
    <MobileShell>
      <TopBar
        title="Dashboard"
        subtitle={
          inv
            ? `${inv.stationName} · Updated ${formatRelativeMinutes(inv.dataTimestamp)}`
            : 'Solar Reporter'
        }
      />

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-slate-400 text-sm">Loading…</div>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-4 text-sm text-red-300">
            ⚠ Could not load data — {error.message}
          </div>
        )}

        {inv && <PowerFlowDiagram inverter={inv} />}
      </div>

      <BottomNav />
    </MobileShell>
  )
}
