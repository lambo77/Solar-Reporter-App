'use client'
import { useState, useCallback } from 'react'
import { getBillingCycle } from '@/lib/utils/billing-cycle'
import type { DateRange } from '@/types'

export function useBillingCycle(startDay = 10) {
  const [offset, setOffset] = useState(0)

  const cycle: DateRange = getBillingCycle(new Date(), startDay, offset)

  const prev = useCallback(() => setOffset((o) => o - 1), [])
  const next = useCallback(() => setOffset((o) => o + 1), [])
  const reset = useCallback(() => setOffset(0), [])

  return { cycle, offset, prev, next, reset }
}
