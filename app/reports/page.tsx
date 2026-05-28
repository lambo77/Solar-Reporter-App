import { ReportActions } from "@/components/ReportActions";
import { getDailyReadings, summarise, SYSTEM_CONFIG } from "@/lib/solar-data";

export default function ReportsPage() {
  const readings = getDailyReadings(30);
  const stats = summarise(readings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Daily report</h1>
          <p className="text-sm text-slate-400">
            {SYSTEM_CONFIG.siteName} · last {readings.length} days
          </p>
        </div>
        <ReportActions readings={readings} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Generation (kWh)</th>
              <th className="px-4 py-3 text-right font-medium">Consumption (kWh)</th>
              <th className="px-4 py-3 text-right font-medium">Peak (kW)</th>
              <th className="px-4 py-3 text-right font-medium">Sun (h)</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => (
              <tr key={r.date} className="border-t border-slate-800/70">
                <td className="px-4 py-2.5 text-slate-300">{r.date}</td>
                <td className="px-4 py-2.5 text-right text-amber-400">
                  {r.generationKwh}
                </td>
                <td className="px-4 py-2.5 text-right text-sky-400">
                  {r.consumptionKwh}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-300">{r.peakKw}</td>
                <td className="px-4 py-2.5 text-right text-slate-300">{r.sunHours}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-700 bg-slate-900/60 font-medium text-white">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">{stats.totalGenerationKwh}</td>
              <td className="px-4 py-3 text-right">{stats.totalConsumptionKwh}</td>
              <td className="px-4 py-3 text-right">—</td>
              <td className="px-4 py-3 text-right">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
