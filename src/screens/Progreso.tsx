import { useLiveQuery } from 'dexie-react-hooks'
import { lazy, Suspense, useState } from 'react'
import { ActivityForm } from '../components/ActivityForm'
import { ProgressBar } from '../components/ProgressBar'
import { Sheet } from '../components/Sheet'
import { WeightForm } from '../components/WeightForm'
import { addDays, formatLong, formatShort } from '../dates'
import { db, getSettings, type Activity, type WeightEntry } from '../db'
import { fmt, fmtKg, round1 } from '../format'
import { activeDays, progressPct, sumKm, weekday, weekStart, weeklyTrend } from '../stats'
import { useToday } from '../useToday'
import { Ajustes } from './Ajustes'

// Recharts pesa mucho: se descarga solo al abrir Progreso
const WeightChart = lazy(() => import('../components/WeightChart').then((m) => ({ default: m.WeightChart })))

type HistoryItem = { kind: 'peso'; entry: WeightEntry } | { kind: 'actividad'; entry: Activity }

export function Progreso() {
  const today = useToday()
  const [view, setView] = useState<'main' | 'ajustes'>('main')
  const [form, setForm] = useState<'peso' | 'actividad' | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [deleting, setDeleting] = useState<HistoryItem | null>(null)
  const settings = useLiveQuery(getSettings)
  const weights = useLiveQuery(() => db.weight_entries.orderBy('date').toArray())
  const activities = useLiveQuery(() => db.activities.orderBy('date').toArray())

  if (!settings || !weights || !activities) return null

  if (view === 'ajustes') {
    return <Ajustes settings={settings} firstWeight={weights[0]?.weight_kg} onBack={() => setView('main')} />
  }

  // Peso
  const last = weights.at(-1)
  const start = settings.start_weight_kg ?? weights[0]?.weight_kg
  const target = settings.target_weight_kg
  const lost = last && start != null ? round1(start - last.weight_kg) : 0
  const pct = progressPct(start, last?.weight_kg, target)
  const trend = weeklyTrend(weights)
  const isWeighDay = settings.weigh_in_weekday === weekday(today) && last?.date !== today

  // Actividad
  const monday = weekStart(today)
  const thisWeek = activities.filter((a) => a.date >= monday && a.date <= today)
  const lastWeek = activities.filter((a) => a.date >= addDays(monday, -7) && a.date < monday)
  const weekKm = sumKm(thisWeek)
  const lastWeekKm = sumKm(lastWeek)
  const daysThisWeek = activeDays(thisWeek)
  const monthKm = sumKm(activities.filter((a) => a.date.slice(0, 7) === today.slice(0, 7)))
  const totalKm = sumKm(activities)
  const goal = settings.weekly_km_goal

  const history: HistoryItem[] = [
    ...weights.map((entry) => ({ kind: 'peso' as const, entry })),
    ...activities.map((entry) => ({ kind: 'actividad' as const, entry })),
  ].sort((a, b) => b.entry.date.localeCompare(a.entry.date))

  const remove = async () => {
    if (!deleting) return
    if (deleting.kind === 'peso') await db.weight_entries.delete(deleting.entry.date)
    else await db.activities.delete(deleting.entry.id!)
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Progreso</h1>
        <button onClick={() => setView('ajustes')} className="flex min-h-12 items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-brand">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" strokeLinecap="round" />
          </svg>
          Ajustes
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setForm('peso')} className="min-h-16 rounded-2xl bg-brand text-lg font-semibold text-white">
          Apuntar peso
        </button>
        <button onClick={() => setForm('actividad')} className="min-h-16 rounded-2xl bg-brand text-lg font-semibold text-white">
          Apuntar actividad
        </button>
      </div>

      {isWeighDay && (
        <p className="rounded-2xl bg-brand-soft px-4 py-3 text-lg font-medium text-brand-dark">Hoy es tu día de pesarte.</p>
      )}

      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Peso</h2>
        {!last ? (
          <p className="text-lg">Apunta tu peso y aquí verás cómo evoluciona semana a semana.</p>
        ) : (
          <>
            <div>
              <p className="text-4xl font-bold">{fmtKg(last.weight_kg)} kg</p>
              <p className="text-lg text-muted">Último peso, {formatShort(last.date)}</p>
            </div>
            {lost >= 0.1 && (
              <p className="text-lg font-semibold text-brand-dark">Has bajado {fmt(lost)} kg desde el inicio.</p>
            )}
            {target != null ? (
              <div className="space-y-2">
                {pct != null && pct > 0 && (
                  <>
                    <ProgressBar pct={pct} label="Progreso hacia el peso objetivo" />
                    <p className="text-lg">
                      <span className="font-semibold">{Math.round(pct)} %</span> del camino
                    </p>
                  </>
                )}
                <p className="text-lg text-muted">Objetivo: {fmtKg(target)} kg</p>
              </div>
            ) : (
              <button onClick={() => setView('ajustes')} className="min-h-12 text-lg font-semibold text-brand">
                Pon tu peso objetivo ›
              </button>
            )}
            {trend.length >= 2 && (
              <Suspense fallback={<div className="h-56" />}>
                <WeightChart trend={trend} target={target} />
              </Suspense>
            )}
          </>
        )}
      </section>

      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Actividad</h2>
        <div>
          <p className="text-4xl font-bold">{fmt(totalKm)} km</p>
          <p className="text-lg text-muted">en total desde que empezaste</p>
        </div>
        <div className="space-y-2">
          <p className="text-lg">
            Esta semana: <span className="font-semibold">{fmt(weekKm)} km</span>
            {goal != null && ` de ${fmt(goal)}`}
          </p>
          {goal != null && <ProgressBar pct={(weekKm / goal) * 100} label="Kilómetros de la semana" />}
          {daysThisWeek > 0 && <p className="text-lg">Te has movido {daysThisWeek} de 7 días esta semana.</p>}
          {lastWeekKm > 0 && weekKm > lastWeekKm && (
            <p className="text-lg font-semibold text-brand-dark">¡Ya llevas más km que la semana pasada!</p>
          )}
        </div>
        <p className="text-lg text-muted">Este mes: {fmt(monthKm)} km</p>
      </section>

      {history.length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <button onClick={() => setShowHistory(!showHistory)} aria-expanded={showHistory} className="flex min-h-12 w-full items-center justify-between text-left text-2xl font-bold">
            Historial
            <span className="text-lg font-semibold text-brand">{showHistory ? 'Ocultar' : 'Ver'}</span>
          </button>
          {showHistory && (
            <ul className="mt-3 divide-y divide-black/10">
              {history.map((item) => (
                <li key={item.kind + (item.kind === 'peso' ? item.entry.date : item.entry.id)}>
                  <button onClick={() => setDeleting(item)} className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left">
                    <span>
                      <span className="block font-medium">{historyText(item)}</span>
                      <span className="block text-muted first-letter:uppercase">{formatLong(item.entry.date)}</span>
                    </span>
                    <span className="text-muted">›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {form === 'peso' && <WeightForm onClose={() => setForm(null)} />}
      {form === 'actividad' && <ActivityForm onClose={() => setForm(null)} />}
      {deleting && (
        <Sheet title="¿Borrar este registro?" onClose={() => setDeleting(null)} closeLabel="No, dejarlo">
          <p className="mb-6 text-lg">
            {historyText(deleting)}, <span className="first-letter:uppercase">{formatLong(deleting.entry.date)}</span>
          </p>
          <button onClick={remove} className="min-h-14 w-full rounded-2xl border-2 border-red-700 text-lg font-semibold text-red-700">
            Sí, borrarlo
          </button>
        </Sheet>
      )}
    </div>
  )
}

function historyText(item: HistoryItem) {
  if (item.kind === 'peso') return `Peso: ${fmtKg(item.entry.weight_kg)} kg`
  const a = item.entry
  return ['Actividad', a.km > 0 && `${fmt(a.km)} km`, a.minutes > 0 && `${a.minutes} min`].filter(Boolean).join(' · ')
}
