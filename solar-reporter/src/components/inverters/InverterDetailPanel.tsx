import type { InverterDetail } from '@/lib/solis/types'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function InverterDetailPanel({ detail }: { detail: InverterDetail }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 mx-3 space-y-0">
      <Row label="Real-time power"   value={`${detail.pac} kW (${detail.pacStr})`} />
      <Row label="AC voltage R/S/T"  value={`${detail.uAc1}/${detail.uAc2}/${detail.uAc3} V`} />
      <Row label="AC current R/S/T"  value={`${detail.iAc1}/${detail.iAc2}/${detail.iAc3} A`} />
      <Row label="DC voltage PV1–4"  value={`${detail.uPv1}/${detail.uPv2}/${detail.uPv3}/${detail.uPv4} V`} />
      <Row label="DC current PV1–4"  value={`${detail.iPv1}/${detail.iPv2}/${detail.iPv3}/${detail.iPv4} A`} />
      <Row label="Grid frequency"    value={`${detail.fac} Hz`} />
      <Row label="Temperature"       value={`${detail.inverterTemperature} °C`} />
      <Row label="Power factor"      value={detail.powerFactor} />
      <Row label="Full hours today"  value={`${detail.fullHour} h`} />
      <Row label="Battery SOC"       value={`${detail.batteryCapacitySoc} %`} />
      <Row label="Battery SOH"       value={`${detail.batteryHealthSoh} %`} />
      <Row label="Battery power"     value={`${detail.batteryPower} kW`} />
      <Row label="Battery voltage"   value={`${detail.batteryVoltage} V`} />
      <Row label="Charge today"      value={`${detail.batteryTodayChargeEnergy} kWh`} />
      <Row label="Discharge today"   value={`${detail.batteryTodayDischargeEnergy} kWh`} />
      <Row label="Grid import today" value={`${detail.gridPurchasedTodayEnergy} kWh`} />
      <Row label="Grid export today" value={`${detail.gridSellTodayEnergy} kWh`} />
      <Row label="Home load today"   value={`${detail.homeLoadTodayEnergy} kWh`} />
      <Row label="Collector SN"      value={detail.collectorSn ?? '—'} />
      <Row label="Collector state"   value={detail.collectorState === 1 ? 'Online' : 'Offline'} />
    </div>
  )
}
