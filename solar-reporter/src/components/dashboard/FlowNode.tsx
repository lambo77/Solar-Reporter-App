'use client'
import type { LucideIcon } from 'lucide-react'

const COLORS = {
  amber:   { border: 'border-amber-500/40',   icon: 'text-amber-400',   bg: 'bg-amber-500/10',   pill: 'bg-amber-500/20 text-amber-300'   },
  emerald: { border: 'border-emerald-500/40', icon: 'text-emerald-400', bg: 'bg-emerald-500/10', pill: 'bg-emerald-500/20 text-emerald-300' },
  blue:    { border: 'border-blue-500/40',    icon: 'text-blue-400',    bg: 'bg-blue-500/10',    pill: 'bg-blue-500/20 text-blue-300'    },
  violet:  { border: 'border-violet-500/40',  icon: 'text-violet-400',  bg: 'bg-violet-500/10',  pill: 'bg-violet-500/20 text-violet-300'  },
}

interface Props {
  Icon: LucideIcon
  label: string
  kw: number
  kwh?: number
  kwhLabel?: string
  kwh2?: number
  kwh2Label?: string
  colorClass: keyof typeof COLORS
  active: boolean
  pill?: string
}

export function FlowNode({
  Icon, label, kw, kwh, kwhLabel = 'kWh', kwh2, kwh2Label, colorClass, active, pill,
}: Props) {
  const c = COLORS[colorClass]
  return (
    <div className={`flex flex-col items-center rounded-2xl border ${c.border} ${c.bg} px-2.5 py-2.5 w-[84px] gap-1`}>
      {pill && (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${c.pill} leading-none`}>
          {pill}
        </span>
      )}
      <Icon className={`w-5 h-5 ${c.icon} ${active ? '' : 'opacity-30'}`} />
      <span className="text-[8px] text-slate-400 uppercase tracking-wider text-center leading-none">
        {label}
      </span>
      <span className={`text-sm font-bold leading-none ${active ? 'text-white' : 'text-slate-600'}`}>
        {kw.toFixed(1)} kW
      </span>
      {kwh !== undefined && (
        <span className="text-[9px] text-slate-500 leading-none">
          {kwh.toFixed(1)} {kwhLabel}
        </span>
      )}
      {kwh2 !== undefined && (
        <span className="text-[9px] text-slate-500 leading-none">
          {kwh2.toFixed(1)} {kwh2Label}
        </span>
      )}
    </div>
  )
}
