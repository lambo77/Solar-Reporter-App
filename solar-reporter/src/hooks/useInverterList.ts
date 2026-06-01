'use client'
import useSWR from 'swr'
import type { InverterSummary } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterList(stationId?: string) {
  const body = { pageNo: '1', pageSize: '100', ...(stationId && { stationId }) }
  const { data, error, isLoading, mutate } = useSWR<{ page: { records: InverterSummary[] } }>(
    ['/api/solis/inverter-list', body],
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 300_000, revalidateOnFocus: false }
  )
  return {
    inverters: data?.page?.records ?? [],
    error,
    isLoading,
    mutate,
  }
}
