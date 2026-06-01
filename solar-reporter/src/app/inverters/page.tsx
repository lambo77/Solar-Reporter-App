'use client'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { InverterCard } from '@/components/inverters/InverterCard'
import { useInverterList } from '@/hooks/useInverterList'

export default function InvertersPage() {
  const { inverters, isLoading, error } = useInverterList()

  return (
    <MobileShell>
      <TopBar title="Inverters" subtitle={inverters.length ? `${inverters.length} device${inverters.length > 1 ? 's' : ''}` : undefined} />

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {isLoading && <div className="text-center text-gray-400 text-sm py-8">Loading…</div>}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
            ⚠ Could not load data — {error.message}
          </div>
        )}
        {inverters.map((inv) => <InverterCard key={inv.id} inv={inv} />)}
      </div>

      <BottomNav />
    </MobileShell>
  )
}
