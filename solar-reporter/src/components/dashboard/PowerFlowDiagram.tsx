'use client'
import { Sun, BatteryCharging, Battery, Zap, Home } from 'lucide-react'
import type { InverterSummary } from '@/lib/solis/types'
import { FlowNode } from './FlowNode'
import { formatRelativeMinutes } from '@/lib/utils/formatters'

function VLine({ active, dotClass, direction }: { active: boolean; dotClass: string; direction: 'down' | 'up' }) {
  return (
    <div className="relative w-0.5 h-10 bg-slate-700 mx-auto my-1">
      {active && (
        <span
          className={`absolute -left-[3px] w-2 h-2 rounded-full ${dotClass}`}
          style={{ animation: `${direction === 'down' ? 'flowDown' : 'flowUp'} 1.4s linear infinite` }}
        />
      )}
    </div>
  )
}

function HLine({ active, dotClass, reverse }: { active: boolean; dotClass: string; reverse: boolean }) {
  return (
    <div className="relative h-0.5 flex-1 bg-slate-700 mx-1">
      {active && (
        <span
          className={`absolute -top-[3px] w-2 h-2 rounded-full ${dotClass}`}
          style={{ animation: `${reverse ? 'flowLeft' : 'flowRight'} 1.4s linear infinite` }}
        />
      )}
    </div>
  )
}

export function PowerFlowDiagram({ inverter }: { inverter: InverterSummary }) {
  const solarKw  = inverter.pac ?? 0
  const battKw   = inverter.batteryPower ?? 0
  const gridKw   = inverter.pSum ?? 0
  const homeKw   = inverter.familyLoadPower ?? 0

  const solarActive   = solarKw > 0.01
  const battActive    = Math.abs(battKw) > 0.01
  const battCharging  = battKw > 0       // positive = charging (inverter → battery)
  const gridActive    = Math.abs(gridKw) > 0.01
  const gridImporting = gridKw > 0       // positive = importing (grid → inverter)
  const homeActive    = homeKw > 0.01

  return (
    <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">

      {/* Solar — top */}
      <div className="flex justify-center">
        <FlowNode
          Icon={Sun} label="Solar PV"
          kw={solarKw} kwh={inverter.etoday ?? 0}
          colorClass="amber" active={solarActive}
        />
      </div>

      {/* Solar → Inverter connector */}
      <VLine active={solarActive} dotClass="bg-amber-400" direction="down" />

      {/* Middle row: Battery — Inverter — Grid */}
      <div className="flex items-center justify-between">
        <FlowNode
          Icon={battKw > 0 ? BatteryCharging : Battery}
          label="Battery"
          kw={Math.abs(battKw)}
          colorClass="emerald"
          active={battActive}
          pill={`${(inverter.batteryCapacitySoc ?? 0).toFixed(0)}% SOC`}
        />

        {/* Battery ↔ Inverter: charging = power flows right→left (reverse); discharging = left→right */}
        <HLine active={battActive} dotClass="bg-emerald-400" reverse={battCharging} />

        {/* Inverter centre */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-700 border border-slate-600 px-3 py-3 min-w-[68px]">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Inverter</span>
          {inverter.stationName ? (
            <span className="text-[8px] text-slate-500 mt-1 text-center leading-tight max-w-[60px] truncate">
              {inverter.stationName}
            </span>
          ) : null}
          <span className="text-[8px] text-slate-600 mt-1 leading-none">
            {formatRelativeMinutes(inverter.dataTimestamp)}
          </span>
        </div>

        {/* Inverter ↔ Grid: importing = power flows right→left (reverse); exporting = left→right */}
        <HLine active={gridActive} dotClass="bg-blue-400" reverse={gridImporting} />

        <FlowNode
          Icon={Zap}
          label="Grid"
          kw={Math.abs(gridKw)}
          kwh={inverter.gridPurchasedTodayEnergy ?? 0}
          kwhLabel="kWh in"
          kwh2={inverter.gridSellTodayEnergy ?? 0}
          kwh2Label="kWh out"
          colorClass="blue"
          active={gridActive}
        />
      </div>

      {/* Inverter → Home connector */}
      <VLine active={homeActive} dotClass="bg-violet-400" direction="down" />

      {/* Home — bottom */}
      <div className="flex justify-center">
        <FlowNode
          Icon={Home} label="Home"
          kw={homeKw} kwh={inverter.homeLoadTodayEnergy ?? 0}
          colorClass="violet" active={homeActive}
        />
      </div>
    </div>
  )
}
