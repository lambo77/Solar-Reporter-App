'use client'
import { useState, useEffect, useCallback } from 'react'
import { loadTariffs, saveTariffs } from '@/lib/tariffs/storage'
import type { TariffSettings } from '@/types'

export function useTariffs() {
  const [tariffs, setTariffsState] = useState<TariffSettings>(loadTariffs)

  useEffect(() => {
    setTariffsState(loadTariffs())
  }, [])

  const setTariffs = useCallback((next: TariffSettings) => {
    saveTariffs(next)
    setTariffsState(next)
  }, [])

  return { tariffs, setTariffs }
}
