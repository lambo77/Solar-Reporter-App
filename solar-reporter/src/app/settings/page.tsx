'use client'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ImportTariffBlock } from '@/components/settings/ImportTariffBlock'
import { ExportTariffBlock } from '@/components/settings/ExportTariffBlock'
import { useTariffs } from '@/hooks/useTariffs'
import { calcBlendedImportRate } from '@/lib/tariffs/calculator'
import type { ImportTariff } from '@/types'

export default function SettingsPage() {
  const { tariffs, setTariffs } = useTariffs()

  function updateImportTariff(t: ImportTariff) {
    const updated = tariffs.importTariffs.map((x) => (x.id === t.id ? t : x)) as typeof tariffs.importTariffs
    setTariffs({ ...tariffs, importTariffs: updated })
  }

  const blended = calcBlendedImportRate(tariffs.importTariffs)

  return (
    <MobileShell>
      <TopBar title="Config" />

      <div className="flex-1 overflow-y-auto py-4 space-y-5 px-3">

        {/* Import tariffs */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
            Consumption unit price
          </p>
          <div className="space-y-2">
            {tariffs.importTariffs.map((t) => (
              <ImportTariffBlock key={t.id} tariff={t} onChange={updateImportTariff} />
            ))}
          </div>
          <div className="mt-3 bg-slate-800 rounded-2xl border border-slate-700 p-3 text-center">
            <p className="text-xs text-slate-400">Blended rate</p>
            <p className="text-base font-semibold text-white mt-0.5">€{blended.toFixed(3)} / kWh</p>
            <p className="text-[10px] text-slate-500 mt-0.5">time-weighted across all 3 periods</p>
          </div>
        </div>

        {/* Export tariff */}
        <ExportTariffBlock
          rate={tariffs.exportRate}
          onChange={(r) => setTariffs({ ...tariffs, exportRate: r })}
        />

      </div>

      <BottomNav />
    </MobileShell>
  )
}
