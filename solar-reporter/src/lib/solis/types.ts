export interface InverterSummary {
  id: string
  sn: string
  stationId: string
  stationName: string
  power: number
  pac: number
  pacStr: string
  etoday: number
  etodayStr: string
  etotal: number
  etotalStr: string
  state: 1 | 2 | 3
  batteryCapacitySoc: number
  batteryPower: number
  gridPurchasedTodayEnergy: number
  gridSellTodayEnergy: number
  homeLoadTodayEnergy: number
  familyLoadPower: number
  pSum: number
  dataTimestamp: number
  collectorState: 1 | 2
}

export interface InverterDetail extends InverterSummary {
  eMonth: number
  eYear: number
  iAc1: number; iAc2: number; iAc3: number
  uAc1: number; uAc2: number; uAc3: number
  iPv1: number; iPv2: number; iPv3: number; iPv4: number
  uPv1: number; uPv2: number; uPv3: number; uPv4: number
  fac: number
  inverterTemperature: number
  powerFactor: number
  fullHour: number
  totalFullHour: number
  batteryVoltage: number
  bstteryCurrent: number
  batteryHealthSoh: number
  batteryTodayChargeEnergy: number
  batteryTodayDischargeEnergy: number
  batteryTotalChargeEnergy: number
  batteryTotalDischargeEnergy: number
  gridPurchasedMonthEnergy: number
  gridPurchasedYearEnergy: number
  gridPurchasedTotalEnergy: number
  gridSellMonthEnergy: number
  gridSellYearEnergy: number
  gridSellTotalEnergy: number
  homeLoadTotalEnergy: number
  collectorSn: string
  warningInfoData: number
}

export interface InverterDayPoint {
  dataTimestamp: number
  timeStr: string
  pac: number
  eToday: number
  eTotal: number
  gridPurchasedEnergy: number
  gridSellEnergy: number
  batteryChargeEnergy: number
  batteryDischargeEnergy: number
  homeLoadEnergy: number
  state: 1 | 2 | 3
}

export interface InverterMonthPoint {
  inverterId: string
  date: number
  dateStr: string
  energy: number
  gridPurchasedEnergy: number
  gridSellEnergy: number
  batteryChargeEnergy: number
  batteryDischargeEnergy: number
  homeLoadEnergy: number
  money: number
}

export interface InverterYearPoint extends InverterMonthPoint {
  dateStr: string
}

export interface AlarmRecord {
  id: string
  stationId: string
  stationName: string
  alarmDeviceSn: string
  alarmCode: string
  alarmLevel: '1' | '2' | '3'
  alarmBeginTime: number
  alarmEndTime: number
  alarmMsg: string
  advice: string
  state: '0' | '1' | '2'
}

export interface StationSummary {
  id: string
  stationName: string
  nmiCode: string
  power: number
  dayEnergy: number
  monthEnergy: number
  yearEnergy: number
  allEnergy: number
}
