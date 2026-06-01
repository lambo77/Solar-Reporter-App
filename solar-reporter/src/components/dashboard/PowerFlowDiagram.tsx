'use client'
import type { InverterSummary } from '@/lib/solis/types'

interface Props {
  inverter: InverterSummary
}

function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <div className={`h-0.5 flex-1 mx-1 ${active ? color : 'bg-gray-700'} relative overflow-hidden`}>
      {active && (
        <div className="absolute inset-0 animate-pulse opacity-75" style={{ background: 'inherit' }} />
      )}
    </div>
  )
}

function Node({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg p-2 w-[72px] border ${color}`}>
      <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none mb-1">{label}</span>
      <span className="text-white text-xs font-semibold leading-none">{value}</span>
      {sub && <span className="text-[9px] text-gray-400 mt-0.5 leading-none">{sub}</span>}
    </div>
  )
}

export function PowerFlowDiagram({ inverter }: Props) {
  const solarActive = inverter.pac > 0
  const exportActive = inverter.gridSellTodayEnergy > 0
  const importActive = inverter.pSum > 0
  const batteryCharging = inverter.batteryPower > 0
  const batteryDischarging = inverter.batteryPower < 0

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-3 mx-3">
      {/* Row 1: Solar → Inverter → Export */}
      <div className="flex items-center mb-3">
        <Node label="Solar PV" value={`${inverter.pac.toFixed(1)}kW`} sub={`${inverter.etoday.toFixed(1)}kWh`} color="border-amber-500/40" />
        <FlowArrow active={solarActive} color="bg-amber-400" />
        <Node label="Inverter" value={`${inverter.pac.toFixed(1)}kW`} color="border-gray-500/40" />
        <FlowArrow active={exportActive} color="bg-green-400" />
        <Node label="Export" value={`${inverter.gridSellTodayEnergy.toFixed(1)}kWh`} color="border-green-500/40" />
      </div>

      {/* Row 2: Import → Home / Battery */}
      <div className="flex items-center">
        <Node label="Import" value={`${inverter.gridPurchasedTodayEnergy.toFixed(1)}kWh`} color="border-blue-500/40" />
        <FlowArrow active={importActive} color="bg-blue-400" />
        <Node label="Home" value={`${inverter.familyLoadPower.toFixed(1)}kW`} sub={`${inverter.homeLoadTodayEnergy.toFixed(1)}kWh`} color="border-purple-500/40" />
        <FlowArrow active={batteryCharging || batteryDischarging} color={batteryCharging ? 'bg-orange-400' : 'bg-orange-300'} />
        <Node label="Battery" value={`${inverter.batteryCapacitySoc.toFixed(0)}%`} sub={`${Math.abs(inverter.batteryPower).toFixed(1)}kW`} color="border-orange-500/40" />
      </div>
    </div>
  )
}
