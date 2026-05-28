"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyReading } from "@/lib/solar-data";

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const axisStyle = { fill: "#94a3b8", fontSize: 12 };
const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  color: "#e2e8f0",
};

export function GenerationChart({ readings }: { readings: DailyReading[] }) {
  const data = readings.map((r) => ({ ...r, label: shortDate(r.date) }));
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 text-sm font-medium text-slate-300">
        Daily generation (kWh)
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" tick={axisStyle} stroke="#334155" />
          <YAxis tick={axisStyle} stroke="#334155" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="generationKwh"
            name="Generation"
            stroke="#f59e0b"
            fill="url(#gen)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenerationVsConsumptionChart({
  readings,
}: {
  readings: DailyReading[];
}) {
  const data = readings.map((r) => ({ ...r, label: shortDate(r.date) }));
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 text-sm font-medium text-slate-300">
        Generation vs. consumption (kWh)
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" tick={axisStyle} stroke="#334155" />
          <YAxis tick={axisStyle} stroke="#334155" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
          <Bar dataKey="generationKwh" name="Generation" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          <Bar dataKey="consumptionKwh" name="Consumption" fill="#38bdf8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
