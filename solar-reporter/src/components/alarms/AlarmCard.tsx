import type { AlarmRecord } from '@/lib/solis/types'
import { formatTimestamp } from '@/lib/utils/formatters'

const LEVEL: Record<string, { label: string; cls: string }> = {
  '1': { label: 'Tip',       cls: 'bg-amber-50 text-amber-900' },
  '2': { label: 'General',   cls: 'bg-amber-100 text-amber-800' },
  '3': { label: 'Emergency', cls: 'bg-red-50 text-red-800' },
}

export function AlarmCard({ alarm }: { alarm: AlarmRecord }) {
  const level = LEVEL[alarm.alarmLevel] ?? LEVEL['1']
  return (
    <div className={`rounded-xl border border-gray-100 p-3 ${level.cls}`}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium flex-1 pr-2">{alarm.alarmMsg || alarm.alarmCode}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${level.cls} border border-current/20`}>
          {level.label}
        </span>
      </div>
      <p className="text-xs opacity-70">{alarm.stationName} · {alarm.alarmDeviceSn}</p>
      <p className="text-xs opacity-70 mt-0.5">{formatTimestamp(alarm.alarmBeginTime)}</p>
      {alarm.advice && <p className="text-xs mt-1.5 opacity-80">{alarm.advice}</p>}
    </div>
  )
}
