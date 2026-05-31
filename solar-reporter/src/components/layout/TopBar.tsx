'use client'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  alarmCount?: number
}

export function TopBar({ title, subtitle, alarmCount = 0 }: TopBarProps) {
  return (
    <div className="bg-[#1a1a2e] px-4 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-white text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <Link href="/alarms" className="relative p-2">
        <Bell className="text-white w-5 h-5" />
        {alarmCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Link>
    </div>
  )
}
