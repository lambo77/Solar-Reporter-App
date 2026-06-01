import type { ImportTariff } from '@/types'

const DOTS = ['#185FA5', '#378ADD', '#E24B4A']

interface Props {
  tariff: ImportTariff
  onChange: (t: ImportTariff) => void
}

export function ImportTariffBlock({ tariff, onChange }: Props) {
  const dot = DOTS[tariff.id - 1]
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
        <input
          type="text"
          value={tariff.name}
          onChange={(e) => onChange({ ...tariff, name: e.target.value })}
          className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-0 outline-none"
        />
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Rate: €</span>
          <input
            type="number" step="0.001" min="0"
            value={tariff.rate}
            onChange={(e) => onChange({ ...tariff, rate: parseFloat(e.target.value) || 0 })}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
          />
          <span className="text-xs text-gray-500">/kWh</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Start</span>
          <input
            type="time"
            value={tariff.startTime}
            onChange={(e) => onChange({ ...tariff, startTime: e.target.value })}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">End</span>
          <input
            type="time"
            value={tariff.endTime}
            onChange={(e) => onChange({ ...tariff, endTime: e.target.value })}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
