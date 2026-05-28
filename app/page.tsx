import { StatCard } from "@/components/StatCard";
import {
  GenerationChart,
  GenerationVsConsumptionChart,
} from "@/components/SolarCharts";
import { getDailyReadings, summarise, SYSTEM_CONFIG } from "@/lib/solar-data";

export default function DashboardPage() {
  const readings = getDailyReadings(30);
  const stats = summarise(readings);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {SYSTEM_CONFIG.siteName}
        </h1>
        <p className="text-sm text-slate-400">
          {SYSTEM_CONFIG.capacityKwp} kWp installed · last 30 days
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total generated"
          value={stats.totalGenerationKwh.toLocaleString()}
          unit="kWh"
          hint={`Avg ${stats.avgDailyGenerationKwh} kWh/day`}
        />
        <StatCard
          label="Self-sufficiency"
          value={stats.selfSufficiencyPct}
          unit="%"
          hint="Consumption met by solar"
        />
        <StatCard
          label="CO₂ avoided"
          value={stats.co2AvoidedKg.toLocaleString()}
          unit="kg"
        />
        <StatCard
          label="Estimated savings"
          value={`£${stats.estimatedSavings.toLocaleString()}`}
          hint={`@ £${SYSTEM_CONFIG.pricePerKwh}/kWh`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <GenerationChart readings={readings} />
        <GenerationVsConsumptionChart readings={readings} />
      </section>

      {stats.bestDay && (
        <p className="text-sm text-slate-400">
          Best day: <span className="text-white">{stats.bestDay.date}</span> with{" "}
          <span className="text-white">{stats.bestDay.generationKwh} kWh</span>{" "}
          generated.
        </p>
      )}
    </div>
  );
}
