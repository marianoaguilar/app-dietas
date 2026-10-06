import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { ActivityCalendar } from '../components/ActivityCalendar'
import { ProgressBar } from '../components/ProgressBar'
import { Sheet } from '../components/Sheet'
import { WeightForm } from '../components/WeightForm'
import { formatLong, formatShort } from '../dates'
import { db, getSettings, type WeightEntry } from '../db'
import { fmt, fmtKg, round1 } from '../format'
import { progressPct, weekday } from '../stats'
import { useToday } from '../useToday'
import { Ajustes } from './Ajustes'

export function Progreso() {
  const today = useToday()
  const [view, setView] = useState<'main' | 'ajustes'>('main')
  const [weighing, setWeighing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [deleting, setDeleting] = useState<WeightEntry | null>(null)
  const settings = useLiveQuery(getSettings)
  const weights = useLiveQuery(() => db.weight_entries.orderBy('date').toArray())

  if (!settings || !weights) return null

  if (view === 'ajustes') {
    return <Ajustes settings={settings} firstWeight={weights[0]?.weight_kg} onBack={() => setView('main')} />
  }

  // Peso
  const last = weights.at(-1)
  const start = settings.start_weight_kg ?? weights[0]?.weight_kg
  const target = settings.target_weight_kg
  const lost = last && start != null ? round1(start - last.weight_kg) : 0
  const pct = progressPct(start, last?.weight_kg, target)
  const isWeighDay = settings.weigh_in_weekday === weekday(today) && last?.date !== today

  const history = [...weights].reverse()

  const remove = async () => {
    if (!deleting) return
    await db.weight_entries.delete(deleting.date)
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

      <button onClick={() => setWeighing(true)} className="min-h-16 w-full rounded-2xl bg-brand text-lg font-semibold text-white">
        Apuntar peso
      </button>

      {isWeighDay && (
        <p className="rounded-2xl bg-brand-soft px-4 py-3 text-lg font-medium text-brand-dark">Hoy es tu día de pesarte.</p>
      )}

      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Peso</h2>
        {!last ? (
          <p className="text-lg">Apunta tu peso y aquí verás todo lo que vas bajando.</p>
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
            <div className="border-t border-black/10 pt-2">
              <button onClick={() => setShowHistory(!showHistory)} aria-expanded={showHistory} className="flex min-h-12 w-full items-center justify-between text-left text-lg font-semibold">
                Historial de peso
                <span className="text-brand">{showHistory ? 'Ocultar' : 'Ver'}</span>
              </button>
              {showHistory && (
                <ul className="divide-y divide-black/10">
                  {history.map((entry) => (
                    <li key={entry.date}>
                      <button onClick={() => setDeleting(entry)} className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left">
                        <span>
                          <span className="block font-medium">{fmtKg(entry.weight_kg)} kg</span>
                          <span className="block text-muted first-letter:uppercase">{formatLong(entry.date)}</span>
                        </span>
                        <span className="text-muted">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>

      <ActivityCalendar today={today} />

      {weighing && <WeightForm onClose={() => setWeighing(false)} />}
      {deleting && (
        <Sheet title="¿Borrar este registro?" onClose={() => setDeleting(null)} closeLabel="No, dejarlo">
          <p className="mb-6 text-lg">
            Peso: {fmtKg(deleting.weight_kg)} kg, <span className="first-letter:uppercase">{formatLong(deleting.date)}</span>
          </p>
          <button onClick={remove} className="min-h-14 w-full rounded-2xl border-2 border-red-700 text-lg font-semibold text-red-700">
            Sí, borrarlo
          </button>
        </Sheet>
      )}
    </div>
  )
}
