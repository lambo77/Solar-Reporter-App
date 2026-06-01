'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart2, Settings2 } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/energy',    label: 'Reporting', Icon: BarChart2 },
  { href: '/settings',  label: 'Config',    Icon: Settings2 },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="bg-slate-800 border-t border-slate-700 flex items-center justify-around px-2 pb-6 pt-3 flex-shrink-0">
      {NAV.map(({ href, label, Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 px-6 py-1">
            <Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={`text-[10px] font-medium ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
