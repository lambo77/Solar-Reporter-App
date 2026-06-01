'use client'
import useSWR from 'swr'
import type { InverterDayPoint } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterDay(id: string, sn: string, date: string, timeZone = 0) {
  const body = { id, sn, money: 'EUR', time: date, timeZone }
  const { data, error, isLoading, mutate } = useSWR<{ records: InverterDayPoint[] }>(
    id && sn && date ? ['/api/solis/inverter-day', body] : null,
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 300_000, revalidateOnFocus: false }
  )
  return { points: data?.records ?? [], error, isLoading, mutate }
}
