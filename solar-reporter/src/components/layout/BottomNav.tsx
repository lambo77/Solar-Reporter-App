'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Zap, FileBarChart2, Bell, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/energy',    label: 'Energy',    Icon: Zap },
  { href: '/report',    label: 'Report',    Icon: FileBarChart2 },
  { href: '/alarms',    label: 'Alarms',    Icon: Bell },
  { href: '/settings',  label: 'Settings',  Icon: Settings },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="bg-[#1a1a2e] flex items-center justify-around px-2 pb-6 pt-2 flex-shrink-0">
      {NAV.map(({ href, label, Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <Icon className={`w-5 h-5 ${active ? 'text-[#1D9E75]' : 'text-gray-400'}`} />
            <span className={`text-[10px] ${active ? 'text-[#1D9E75]' : 'text-gray-400'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
