import { addDays } from './dates'

function parse(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weekday(dateStr: string) {
  return parse(dateStr).getDay()
}

// Lunes de la semana de esa fecha
export function weekStart(dateStr: string) {
  return addDays(dateStr, -((weekday(dateStr) + 6) % 7))
}

// Días de la semana de esa fecha, de lunes a domingo
export function weekDates(dateStr: string) {
  const monday = weekStart(dateStr)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// (inicial − actual) / (inicial − objetivo) × 100, entre 0 y 100
export function progressPct(start?: number, current?: number, target?: number) {
  if (start == null || current == null || target == null || start === target) return null
  const pct = ((start - current) / (start - target)) * 100
  return Math.min(100, Math.max(0, pct))
}
