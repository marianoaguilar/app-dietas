import { addDays } from './dates'
import type { Activity, WeightEntry } from './db'
import { round1 } from './format'

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

export function sumKm(activities: Activity[]) {
  return round1(activities.reduce((sum, a) => sum + a.km, 0))
}

export function activeDays(activities: Activity[]) {
  return new Set(activities.map((a) => a.date)).size
}

// (inicial − actual) / (inicial − objetivo) × 100, entre 0 y 100
export function progressPct(start?: number, current?: number, target?: number) {
  if (start == null || current == null || target == null || start === target) return null
  const pct = ((start - current) / (start - target)) * 100
  return Math.min(100, Math.max(0, pct))
}

// Media de peso por semana: enseña la tendencia, no cada subida o bajada
export function weeklyTrend(entries: WeightEntry[]) {
  const weeks = new Map<string, number[]>()
  for (const e of entries) {
    const w = weekStart(e.date)
    weeks.set(w, [...(weeks.get(w) ?? []), e.weight_kg])
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, values]) => ({ week, weight: round1(values.reduce((s, v) => s + v, 0) / values.length) }))
}
