import type { EnergyPeriod } from '@/types'

const PERIODS: { value: EnergyPeriod; label: string }[] = [
  { value: 'day',    label: 'Day' },
  { value: 'month',  label: 'Month' },
  { value: 'year',   label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

interface Props {
  value: EnergyPeriod
  onChange: (p: EnergyPeriod) => void
}

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 px-3">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === p.value
              ? 'bg-[#1D9E75] text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
