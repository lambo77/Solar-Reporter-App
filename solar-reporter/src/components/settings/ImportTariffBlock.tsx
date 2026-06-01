import type { ImportTariff } from '@/types'

const DOT_COLORS = ['bg-blue-500', 'bg-sky-400', 'bg-indigo-400']

interface Props {
  tariff: ImportTariff
  onChange: (t: ImportTariff) => void
}

export function ImportTariffBlock({ tariff, onChange }: Props) {
  const dot = DOT_COLORS[tariff.id - 1]
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
        <input
          type="text"
          value={tariff.name}
          onChange={(e) => onChange({ ...tariff, name: e.target.value })}
          className="flex-1 text-sm font-medium text-slate-100 bg-transparent border-0 outline-none"
        />
      </div>
      <div className="h-px bg-slate-700" />
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Rate</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">€</span>
            <input
              type="number" step="0.001" min="0"
              value={tariff.rate}
              onChange={(e) => onChange({ ...tariff, rate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-100 text-center focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Start</span>
          <input
            type="time"
            value={tariff.startTime}
            onChange={(e) => onChange({ ...tariff, startTime: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">End</span>
          <input
            type="time"
            value={tariff.endTime}
            onChange={(e) => onChange({ ...tariff, endTime: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  )
}
