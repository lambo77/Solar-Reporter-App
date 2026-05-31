import type { DateRange } from '@/types'

export function getBillingCycle(
  referenceDate: Date = new Date(),
  startDay: number = 10,
  offset: number = 0
): DateRange {
  const d = referenceDate
  const inCurrentMonth = d.getDate() >= startDay

  let baseMonth = d.getMonth() + (inCurrentMonth ? 0 : -1) + offset
  let baseYear = d.getFullYear() + Math.floor(baseMonth / 12)
  baseMonth = ((baseMonth % 12) + 12) % 12

  const from = new Date(baseYear, baseMonth, startDay)
  const to = new Date(baseYear, baseMonth + 1, startDay - 1)

  return { from, to }
}

export function formatBillingCycleLabel(range: DateRange): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

export function monthsInRange(range: DateRange): string[] {
  const months: string[] = []
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1)
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), 1)
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}
