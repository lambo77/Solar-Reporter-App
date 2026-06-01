'use client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export interface DayCostPoint {
  label: string   // 'MM-DD'
  cost: number    // € import cost
  revenue: number // € export revenue
}

export function CostChart({ days }: { days: DayCostPoint[] }) {
  const data = {
    labels: days.map((d) => d.label),
    datasets: [
      {
        label: 'Import cost',
        data: days.map((d) => parseFloat(d.cost.toFixed(2))),
        backgroundColor: '#ef4444',
        borderRadius: 3,
        borderSkipped: false,
      },
      {
        label: 'Export revenue',
        data: days.map((d) => parseFloat(d.revenue.toFixed(2))),
        backgroundColor: '#22c55e',
        borderRadius: 3,
        borderSkipped: false,
      },
    ],
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: { size: 10 },
                color: '#94a3b8',
                padding: 14,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` €${(ctx.parsed.y as number).toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { font: { size: 8 }, color: '#64748b', maxRotation: 45 },
              grid: { color: '#1e293b' },
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 9 },
                color: '#64748b',
                callback: (v) => `€${v}`,
              },
              grid: { color: '#1e293b' },
            },
          },
        }}
        style={{ height: 230 }}
      />
    </div>
  )
}
