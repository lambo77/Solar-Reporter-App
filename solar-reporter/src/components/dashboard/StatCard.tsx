interface StatCardProps {
  label: string
  value: number | string
  unit: string
  color?: string
  trend?: string
}

export function StatCard({ label, value, unit, color = 'text-gray-900', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-xl font-medium ${color}`}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
      {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
    </div>
  )
}
