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

interface DataPoint {
  label: string
  generation: number
  import: number
  export: number
  load: number
}

export function EnergyChart({ points }: { points: DataPoint[] }) {
  const data = {
    labels: points.map((p) => p.label),
    datasets: [
      { label: 'Generation', data: points.map((p) => p.generation), backgroundColor: '#F59E0B' },
      { label: 'Import',     data: points.map((p) => p.import),     backgroundColor: '#3B82F6' },
      { label: 'Export',     data: points.map((p) => p.export),     backgroundColor: '#10B981' },
      { label: 'Load',       data: points.map((p) => p.load),       backgroundColor: '#8B5CF6' },
    ],
  }

  return (
    <div className="mx-3 bg-white rounded-xl border border-gray-100 p-3">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
          scales: {
            x: { ticks: { font: { size: 9 } } },
            y: { ticks: { font: { size: 9 } } },
          },
        }}
        style={{ height: 200 }}
      />
    </div>
  )
}
