interface Props {
  rate: number
  onChange: (r: number) => void
}

export function ExportTariffBlock({ rate, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Export tariff</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">€</span>
        <input
          type="number" step="0.001" min="0"
          value={rate}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center"
        />
        <span className="text-sm text-gray-600">/kWh</span>
      </div>
    </div>
  )
}
