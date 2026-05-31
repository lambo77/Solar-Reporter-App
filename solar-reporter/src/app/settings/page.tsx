'use client'
import { useState, useEffect } from 'react'
import { MobileShell } from '@/components/layout/MobileShell'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ImportTariffBlock } from '@/components/settings/ImportTariffBlock'
import { ExportTariffBlock } from '@/components/settings/ExportTariffBlock'
import { useTariffs } from '@/hooks/useTariffs'
import { useBillingCycle } from '@/hooks/useBillingCycle'
import { calcBlendedImportRate } from '@/lib/tariffs/calculator'
import { formatBillingCycleLabel } from '@/lib/utils/billing-cycle'
import type { ImportTariff } from '@/types'

export default function SettingsPage() {
  const { tariffs, setTariffs } = useTariffs()
  const { cycle } = useBillingCycle(tariffs.billingCycleStartDay)

  const [apiStatus, setApiStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  useEffect(() => {
    setApiStatus('idle')
    fetch('/api/solis/station-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNo: '1', pageSize: '1' }),
    })
      .then((r) => setApiStatus(r.ok ? 'ok' : 'error'))
      .catch(() => setApiStatus('error'))
  }, [])

  function updateImportTariff(t: ImportTariff) {
    const updated = tariffs.importTariffs.map((x) => (x.id === t.id ? t : x)) as typeof tariffs.importTariffs
    setTariffs({ ...tariffs, importTariffs: updated })
  }

  const blended = calcBlendedImportRate(tariffs.importTariffs)

  return (
    <MobileShell>
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto py-4 space-y-5 px-3">

        {/* API connection */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">API connection</p>
          <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Endpoint</span>
              <span className="text-gray-700">soliscloud.com:13333</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">API ID</span>
              <span className="text-gray-700 font-mono">••••{process.env.NEXT_PUBLIC_SOLIS_API_ID_HINT ?? '…'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${apiStatus === 'ok' ? 'text-emerald-700' : apiStatus === 'error' ? 'text-red-700' : 'text-gray-400'}`}>
                {apiStatus === 'ok' ? 'Connected' : apiStatus === 'error' ? 'Error' : 'Checking…'}
              </span>
            </div>
          </div>
        </div>

        {/* Export tariff */}
        <ExportTariffBlock
          rate={tariffs.exportRate}
          onChange={(r) => setTariffs({ ...tariffs, exportRate: r })}
        />

        {/* Import tariffs */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Import tariffs</p>
          <div className="space-y-2">
            {tariffs.importTariffs.map((t) => (
              <ImportTariffBlock key={t.id} tariff={t} onChange={updateImportTariff} />
            ))}
          </div>
          <div className="mt-2 bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-xs text-gray-500">Blended rate</p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">€{blended.toFixed(3)} /kWh</p>
            <p className="text-[10px] text-gray-400">time-weighted across all 3 tariff periods</p>
          </div>
        </div>

        {/* Billing cycle */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Billing cycle</p>
          <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cycle start day</span>
              <div className="flex items-center gap-1">
                <input
                  type="number" min="1" max="28"
                  value={tariffs.billingCycleStartDay}
                  onChange={(e) => setTariffs({ ...tariffs, billingCycleStartDay: parseInt(e.target.value) || 1 })}
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
                />
                <span className="text-sm text-gray-500">of month</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current period</span>
              <span className="text-xs text-gray-500">{formatBillingCycleLabel(cycle)}</span>
            </div>
          </div>
        </div>

        {/* Display preferences */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Display</p>
          <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Currency</span>
              <span className="text-gray-500">EUR (€)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Refresh interval</span>
              <span className="text-gray-500">5 min</span>
            </div>
          </div>
        </div>

      </div>

      <BottomNav />
    </MobileShell>
  )
}
