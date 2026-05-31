'use client'
import useSWR from 'swr'
import type { InverterYearPoint } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterYear(id: string, sn: string, year: string, timeZone = 0) {
  const body = { id, sn, money: 'EUR', year, timeZone }
  const { data, error, isLoading, mutate } = useSWR<{ records: InverterYearPoint[] }>(
    id && sn && year ? ['/api/solis/inverter-year', body] : null,
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 3_600_000, revalidateOnFocus: false }
  )
  return { points: data?.records ?? [], error, isLoading, mutate }
}
