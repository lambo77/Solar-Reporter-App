import { buildSolisHeaders } from './auth'
import type {
  InverterSummary,
  InverterDetail,
  InverterDayPoint,
  InverterMonthPoint,
  InverterYearPoint,
  AlarmRecord,
  StationSummary,
} from './types'

const BASE_URL = process.env.SOLIS_BASE_URL!
const API_ID = process.env.SOLIS_API_ID!
const API_SECRET = process.env.SOLIS_API_SECRET!

async function solisFetch<T>(path: string, body: object): Promise<T> {
  const headers = buildSolisHeaders(path, body, API_ID, API_SECRET)
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok || json.code !== '0') {
    const err = new Error(json.msg ?? 'SolisCloud error') as Error & { code?: string }
    err.code = json.code
    throw err
  }
  return json.data as T
}

export function getInverterList(params: {
  pageNo: string
  pageSize: string
  stationId?: string
  nmiCode?: string
}) {
  return solisFetch<{ page: { records: InverterSummary[] } }>('/v1/api/inverterList', params)
}

export function getInverterDetail(params: { id?: string; sn?: string }) {
  return solisFetch<InverterDetail>('/v1/api/inverterDetail', params)
}

export function getInverterDay(params: {
  id: string
  sn: string
  money: string
  time: string
  timeZone: number
}) {
  return solisFetch<{ records: InverterDayPoint[] }>('/v1/api/inverterDay', params)
}

export function getInverterMonth(params: {
  id: string
  sn: string
  money: string
  month: string
  timeZone: number
}) {
  return solisFetch<{ records: InverterMonthPoint[] }>('/v1/api/inverterMonth', params)
}

export function getInverterYear(params: {
  id: string
  sn: string
  money: string
  year: string
  timeZone: number
}) {
  return solisFetch<{ records: InverterYearPoint[] }>('/v1/api/inverterYear', params)
}

export function getInverterAll(params: { id: string; sn: string; money: string }) {
  return solisFetch<{ records: InverterMonthPoint[] }>('/v1/api/inverterAll', params)
}

export function getAlarmList(params: {
  pageNo: string
  pageSize: string
  stationId?: string
  alarmDeviceSn?: string
  state?: string
}) {
  return solisFetch<{ page: { records: AlarmRecord[] } }>('/v1/api/alarmList', params)
}

export function getStationList(params: {
  pageNo: string
  pageSize: string
  nmiCode?: string
}) {
  return solisFetch<{ page: { records: StationSummary[] } }>('/v1/api/userStationList', params)
}
