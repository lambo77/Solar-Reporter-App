'use client'
import { formatBillingCycleLabel } from '@/lib/utils/billing-cycle'
import { formatDateIso } from '@/lib/utils/formatters'
import type { DateRange } from '@/types'

interface Props {
  cycle: DateRange
  from: string
  to: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
  onPrev: () => void
  onNext: () => void
  onApplyCycle: () => void
}

export function CustomDatePanel({ cycle, from, to, onFromChange, onToChange, onPrev, onNext, onApplyCycle }: Props) {
  return (
    <div className="mx-3 bg-white rounded-xl border border-gray-100 p-3 space-y-3">
      {/* Billing cycle shortcut */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Billing cycle</p>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm">‹</button>
          <button onClick={onApplyCycle} className="flex-1 text-xs text-center py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
            {formatBillingCycleLabel(cycle)}
          </button>
          <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm">›</button>
        </div>
      </div>

      {/* Manual date pickers */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">From</label>
          <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <input type="date" value={to} max={formatDateIso(new Date())} onChange={(e) => onToChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700" />
        </div>
      </div>
    </div>
  )
}
