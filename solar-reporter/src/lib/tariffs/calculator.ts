import type { ImportTariff, TariffSettings } from '@/types'
import type { InverterDayPoint } from '@/lib/solis/types'

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

export function calcBlendedImportRate(tariffs: ImportTariff[]): number {
  let weighted = 0
  let totalHours = 0
  for (const t of tariffs) {
    const start = timeToHours(t.startTime)
    const end = timeToHours(t.endTime)
    const hours = end > start ? end - start : 24 + end - start
    weighted += t.rate * hours
    totalHours += hours
  }
  return totalHours > 0 ? weighted / totalHours : 0
}

export function calcPreciseDailyCost(
  intervals: InverterDayPoint[],
  tariffs: ImportTariff[]
): number {
  return intervals.reduce((total, point) => {
    const d = new Date(point.dataTimestamp)
    const pointHours = d.getHours() + d.getMinutes() / 60
    const activeTariff = tariffs.find((t) => {
      const s = timeToHours(t.startTime)
      const e = timeToHours(t.endTime)
      return e > s
        ? pointHours >= s && pointHours < e
        : pointHours >= s || pointHours < e
    })
    return total + point.gridPurchasedEnergy * (activeTariff?.rate ?? 0)
  }, 0)
}

export function calcExportRevenue(exportKwh: number, settings: TariffSettings): number {
  return exportKwh * settings.exportRate
}

export function calcImportCost(importKwh: number, settings: TariffSettings): number {
  const rate = calcBlendedImportRate(settings.importTariffs)
  return importKwh * rate
}
