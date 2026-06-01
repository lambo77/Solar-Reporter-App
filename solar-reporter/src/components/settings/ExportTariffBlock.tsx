interface Props {
  rate: number
  onChange: (r: number) => void
}

export function ExportTariffBlock({ rate, onChange }: Props) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
        Microgeneration credit unit price
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">€</span>
        <input
          type="number" step="0.001" min="0"
          value={rate}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 text-center focus:outline-none focus:border-emerald-500"
        />
        <span className="text-sm text-slate-400">/ kWh</span>
      </div>
    </div>
  )
}
