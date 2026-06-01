'use client'
import useSWR from 'swr'
import type { InverterDetail } from '@/lib/solis/types'

const fetcher = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json())

export function useInverterDetail(id: string) {
  const body = { id }
  const { data, error, isLoading, mutate } = useSWR<InverterDetail>(
    id ? ['/api/solis/inverter-detail', body] : null,
    ([url, b]) => fetcher(url as string, b as object),
    { refreshInterval: 300_000, revalidateOnFocus: false }
  )
  return { detail: data ?? null, error, isLoading, mutate }
}
