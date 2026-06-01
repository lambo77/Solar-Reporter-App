import type { TariffSettings } from '@/types'
import { DEFAULT_TARIFFS } from '@/types'

const STORAGE_KEY = 'solar_reporter_tariffs'

export function loadTariffs(): TariffSettings {
  if (typeof window === 'undefined') return DEFAULT_TARIFFS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_TARIFFS, ...JSON.parse(raw) } : DEFAULT_TARIFFS
  } catch {
    return DEFAULT_TARIFFS
  }
}

export function saveTariffs(settings: TariffSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
