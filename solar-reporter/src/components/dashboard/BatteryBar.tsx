interface BatteryBarProps {
  soc: number
  soh: number
  power: number
}

export function BatteryBar({ soc, soh, power }: BatteryBarProps) {
  const isCharging = power > 0
  const isDischarging = power < 0
  const label = isCharging ? `Charging · ${power.toFixed(2)} kW` : isDischarging ? `Discharging · ${Math.abs(power).toFixed(2)} kW` : 'Idle'
  const barColor = isCharging ? 'bg-orange-400' : isDischarging ? 'bg-blue-400' : 'bg-gray-300'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Battery</p>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, soc))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>SOC {soc.toFixed(0)}%</span>
        <span>SOH {soh.toFixed(0)}%</span>
      </div>
    </div>
  )
}
