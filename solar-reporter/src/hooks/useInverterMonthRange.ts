'use client'
import useSWR from 'swr'
import type { InverterMonthPoint } from '@/lib/solis/types'

export function useInverterMonthRange(id: string, sn: string, months: string[]) {
  const key = id && sn && months.length ? ['inverter-month-range', id, sn, ...months] : null

  const { data, error, isLoading } = useSWR<InverterMonthPoint[]>(
    key,
    async () => {
      const results = await Promise.all(
        months.map((month) =>
          fetch('/api/solis/inverter-month', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, sn, money: 'EUR', month, timeZone: 0 }),
          }).then((r) => r.json() as Promise<{ records: InverterMonthPoint[] }>)
        )
      )
      return results.flatMap((r) => r.records ?? [])
    },
    { revalidateOnFocus: false }
  )

  return { points: data ?? [], error, isLoading }
}
