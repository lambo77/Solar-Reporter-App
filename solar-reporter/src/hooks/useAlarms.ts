'use client'
import useSWR from 'swr'
import type { AlarmRecord } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useAlarms(stationId?: string, state?: string) {
  const body = {
    pageNo: '1',
    pageSize: '100',
    ...(stationId && { stationId }),
    ...(state && { state }),
  }
  const { data, error, isLoading, mutate } = useSWR<{ page: { records: AlarmRecord[] } }>(
    ['/api/solis/alarm-list', body],
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 120_000, revalidateOnFocus: false }
  )
  return {
    alarms: data?.page?.records ?? [],
    error,
    isLoading,
    mutate,
  }
}
