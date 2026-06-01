'use client'
import useSWR from 'swr'
import type { InverterMonthPoint } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterMonth(id: string, sn: string, month: string, timeZone = 0) {
  const body = { id, sn, money: 'EUR', month, timeZone }
  const { data, error, isLoading, mutate } = useSWR<{ records: InverterMonthPoint[] }>(
    id && sn && month ? ['/api/solis/inverter-month', body] : null,
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 3_600_000, revalidateOnFocus: false }
  )
  return { points: data?.records ?? [], error, isLoading, mutate }
}
