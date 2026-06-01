'use client'
import { useState } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { AlarmCard } from '@/components/alarms/AlarmCard'
import { useAlarms } from '@/hooks/useAlarms'

const FILTERS = [
  { label: 'All',       value: undefined },
  { label: 'Pending',   value: '0' },
  { label: 'Processed', value: '1' },
  { label: 'Resolved',  value: '2' },
]

export default function AlarmsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const { alarms, isLoading, error } = useAlarms(undefined, filter)

  const unresolved = alarms.filter((a) => a.state === '0').length
  const sorted = [...alarms].sort((a, b) => b.alarmBeginTime - a.alarmBeginTime)

  return (
    <MobileShell>
      <TopBar title="Alarms" subtitle={unresolved > 0 ? `${unresolved} unresolved` : 'All clear'} />

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {/* Filter row */}
        <div className="flex gap-2 px-3">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.value ? 'bg-[#1D9E75] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <div className="text-center text-gray-400 text-sm py-8">Loading…</div>}
        {error && (
          <div className="mx-3 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
            ⚠ Could not load alarms — {error.message}
          </div>
        )}

        <div className="px-3 space-y-3">
          {sorted.length === 0 && !isLoading && (
            <p className="text-center text-gray-400 text-sm py-8">No alarms</p>
          )}
          {sorted.map((a) => <AlarmCard key={a.id} alarm={a} />)}
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  )
}
