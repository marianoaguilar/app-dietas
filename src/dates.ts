// Fechas locales en formato YYYY-MM-DD (toISOString usaría UTC y cambiaría de día de madrugada)
export function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function addDays(dateStr: string, n: number) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return toDateStr(new Date(y, m - 1, d + n))
}

export function formatLong(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d))
}

export function formatShort(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d))
}

// "octubre", a partir de "2026-10"
export function monthName(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(y, m - 1, 1))
}

// "2026-10" → "2026-11" (n = 1) o "2026-09" (n = -1)
export function addMonths(month: string, n: number) {
  const [y, m] = month.split('-').map(Number)
  return toDateStr(new Date(y, m - 1 + n, 1)).slice(0, 7)
}

// Fechas de un mes, del 1 al último día
export function monthDates(month: string) {
  const [y, m] = month.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  return Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}
