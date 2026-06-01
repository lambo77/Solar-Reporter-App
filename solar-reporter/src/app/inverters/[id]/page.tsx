'use client'
import { use } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { InverterDetailPanel } from '@/components/inverters/InverterDetailPanel'
import { useInverterDetail } from '@/hooks/useInverterDetail'

export default function InverterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { detail, isLoading, error } = useInverterDetail(id)

  return (
    <MobileShell>
      <TopBar title={detail?.stationName ?? 'Inverter'} subtitle={detail?.sn} />

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {isLoading && <div className="text-center text-gray-400 text-sm py-8">Loading…</div>}
        {error && (
          <div className="mx-3 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
            ⚠ Could not load data — {error.message}
          </div>
        )}
        {detail && <InverterDetailPanel detail={detail} />}
      </div>

      <BottomNav />
    </MobileShell>
  )
}
