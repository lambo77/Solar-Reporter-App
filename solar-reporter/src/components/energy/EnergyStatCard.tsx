interface EnergyStatCardProps {
  label: string
  kwh: number
  unit?: string
  valueColor?: string
  cost?: number
  costColor?: 'red' | 'green'
  currencySymbol?: string
}

export function EnergyStatCard({ label, kwh, unit = 'kWh', valueColor = 'text-gray-900', cost, costColor, currencySymbol = '€' }: EnergyStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-xl font-medium ${valueColor}`}>
        {kwh.toFixed(2)}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
      {cost !== undefined && (
        <p className={`text-sm font-medium mt-1 ${costColor === 'red' ? 'text-red-800' : 'text-green-800'}`}>
          {currencySymbol}{cost.toFixed(2)}
        </p>
      )}
    </div>
  )
}
