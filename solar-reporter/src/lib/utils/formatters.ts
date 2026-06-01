export function formatCurrency(value: number, symbol = '€'): string {
  return `${symbol}${value.toFixed(2)}`
}

export function formatKwh(value: number, decimals = 2): string {
  if (value >= 1000) return `${(value / 1000).toFixed(decimals)} MWh`
  return `${value.toFixed(decimals)} kWh`
}

export function formatKw(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)} kW`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function formatYear(date: Date): string {
  return String(date.getFullYear())
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeMinutes(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return 'just now'
  if (diff === 1) return '1 min ago'
  return `${diff} min ago`
}
