export interface ImportTariff {
  id: 1 | 2 | 3
  name: string
  rate: number
  startTime: string
  endTime: string
}

export interface TariffSettings {
  exportRate: number
  importTariffs: [ImportTariff, ImportTariff, ImportTariff]
  billingCycleStartDay: number
  currency: string
  currencySymbol: string
}

export const DEFAULT_TARIFFS: TariffSettings = {
  exportRate: 0.12,
  importTariffs: [
    { id: 1, name: 'Night rate', rate: 0.18, startTime: '00:00', endTime: '08:00' },
    { id: 2, name: 'Day rate',   rate: 0.28, startTime: '08:00', endTime: '17:00' },
    { id: 3, name: 'Peak rate',  rate: 0.42, startTime: '17:00', endTime: '23:00' },
  ],
  billingCycleStartDay: 10,
  currency: 'EUR',
  currencySymbol: '€',
}

export type InverterStatus = 'online' | 'offline' | 'alarm'

export type EnergyPeriod = 'day' | 'month' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}
