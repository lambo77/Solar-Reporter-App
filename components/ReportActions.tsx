"use client";

import type { DailyReading } from "@/lib/solar-data";

function toCsv(readings: DailyReading[]): string {
  const header = "date,generation_kwh,consumption_kwh,peak_kw,sun_hours";
  const rows = readings.map(
    (r) =>
      `${r.date},${r.generationKwh},${r.consumptionKwh},${r.peakKw},${r.sunHours}`
  );
  return [header, ...rows].join("\n");
}

export function ReportActions({ readings }: { readings: DailyReading[] }) {
  function downloadCsv() {
    const blob = new Blob([toCsv(readings)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solar-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-3 print:hidden">
      <button
        onClick={downloadCsv}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
      >
        Export CSV
      </button>
      <button
        onClick={() => window.print()}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
      >
        Print
      </button>
    </div>
  );
}
