import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, setActivityDay } from '../db'
import { formatLong } from '../dates'
import { weekDates } from '../stats'
import { DayCircle, dayState, weekLetters } from './DayCircle'

// Semana de lunes a domingo con los días que ha salido, y el botón para marcar hoy.
// Va arriba en Hoy, así que es compacta: las comidas tienen que empezar justo debajo.
export function ActivityWeek({ today }: { today: string }) {
  const days = weekDates(today)
  const marked = useLiveQuery(() => db.activity_days.where('date').between(days[0], days[6], true, true).primaryKeys(), [today])
  const [justMarked, setJustMarked] = useState(false)

  if (!marked) return null

  const done = new Set(marked)
  const doneToday = done.has(today)
  const count = done.size

  const toggle = async () => {
    await setActivityDay(today, !doneToday)
    setJustMarked(!doneToday)
  }

  // Un solo mensaje cada vez
  const days_ = `${count} ${count === 1 ? 'día' : 'días'}`
  let message: string | null = null
  if (doneToday && justMarked) {
    message = count === 1 ? '¡Bien hecho! Es tu primer día de la semana.' : `¡Bien hecho! Llevas ${days_} esta semana.`
  } else if (!doneToday && new Date().getHours() >= 16) {
    message = count > 0 ? `Llevas ${days_} esta semana. ¿Te animas hoy?` : '¿Te animas a dar un paseo hoy?'
  } else if (count > 0) {
    message = `Llevas ${days_} esta semana.`
  }

  return (
    <section aria-label="Salir a andar" className="space-y-3 rounded-3xl bg-white p-4 shadow-card">
      <ol className="grid grid-cols-7 gap-1">
        {days.map((date, i) => (
          <li key={date} className="flex flex-col items-center gap-1" aria-label={`${formatLong(date)}${done.has(date) ? ': has salido' : ''}`}>
            <span className="font-semibold text-muted" aria-hidden="true">
              {weekLetters[i]}
            </span>
            <DayCircle state={dayState(date, today, done.has(date))} label={String(Number(date.slice(8)))} pop={date === today && justMarked} />
          </li>
        ))}
      </ol>
      {message && (
        <p key={message} className="animate-fade-up px-1 text-lg font-medium text-brand-dark">
          {message}
        </p>
      )}
      <button
        onClick={toggle}
        aria-pressed={doneToday}
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold ${
          doneToday ? 'border-2 border-brand bg-white text-brand' : 'bg-brand text-white'
        }`}
      >
        {doneToday ? (
          <>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hoy has salido
          </>
        ) : (
          'He salido hoy'
        )}
      </button>
    </section>
  )
}
