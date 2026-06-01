'use client'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 pt-10 pb-4 flex-shrink-0">
      <h1 className="text-white text-lg font-semibold leading-tight">{title}</h1>
      {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
    </div>
  )
}
