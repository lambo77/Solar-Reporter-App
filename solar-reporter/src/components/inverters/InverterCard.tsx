import Link from 'next/link'
import type { InverterSummary } from '@/lib/solis/types'

const STATUS = {
  1: { label: 'Online',  cls: 'bg-emerald-50 text-emerald-800' },
  2: { label: 'Offline', cls: 'bg-gray-100 text-gray-600' },
  3: { label: 'Alarm',   cls: 'bg-red-50 text-red-800' },
}

export function InverterCard({ inv }: { inv: InverterSummary }) {
  const status = STATUS[inv.state]
  return (
    <Link href={`/inverters/${inv.id}`} className="block bg-white rounded-xl border border-gray-100 p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{inv.stationName}</p>
          <p className="text-xs text-gray-400">{inv.sn}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
      </div>
      <div className="flex gap-3 text-center">
        <div className="flex-1">
          <p className="text-xs text-gray-500">Now</p>
          <p className="text-sm font-medium text-gray-900">{inv.pac.toFixed(2)} kW</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-sm font-medium text-gray-900">{inv.etoday.toFixed(2)} kWh</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-medium text-gray-900">{(inv.etotal / 1000).toFixed(2)} MWh</p>
        </div>
      </div>
    </Link>
  )
}
