import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, setActivityDay } from '../db'
import { addMonths, formatLong, monthDates, monthName } from '../dates'
import { weekday } from '../stats'
import { DayCircle, dayState, weekLetters } from './DayCircle'

// Calendario de un mes con los días que ha salido. Tocar un día pasado lo marca o desmarca.
export function ActivityCalendar({ today }: { today: string }) {
  const thisMonth = today.slice(0, 7)
  // Meses hacia atrás desde el actual: así, si la app sigue abierta al cambiar de mes, se pasa sola al nuevo
  const [offset, setOffset] = useState(0)
  const month = addMonths(thisMonth, offset)
  const [popped, setPopped] = useState<string | null>(null)
  const prevMonth = addMonths(month, -1)
  const marked = useLiveQuery(
    () => db.activity_days.where('date').between(`${prevMonth}-01`, `${month}-31`, true, true).primaryKeys(),
    [month],
  )
  const first = useLiveQuery(() => db.activity_days.orderBy('date').first())

  if (!marked) return null

  const done = new Set(marked)
  const dates = monthDates(month)
  const count = dates.filter((d) => done.has(d)).length
  const prevCount = monthDates(prevMonth).filter((d) => done.has(d)).length
  const blanks = (weekday(dates[0]) + 6) % 7 // huecos antes del día 1 (lunes primero)

  // Se puede ir hacia atrás hasta el primer mes con algún día marcado, y al menos al mes anterior
  const oldest = first && first.date.slice(0, 7) < addMonths(thisMonth, -1) ? first.date.slice(0, 7) : addMonths(thisMonth, -1)
  const canBack = month > oldest
  const canForward = offset < 0

  const toggle = async (date: string) => {
    const nowDone = !done.has(date)
    await setActivityDay(date, nowDone)
    setPopped(nowDone ? date : null)
  }

  const go = (n: number) => {
    setOffset(offset + n)
    setPopped(null)
  }

  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-card">
      <h2 className="px-1 text-2xl font-bold">Salir a andar</h2>

      <div className="flex items-center justify-between">
        <button onClick={() => go(-1)} disabled={!canBack} aria-label="Mes anterior" className="min-h-12 min-w-12 rounded-2xl text-2xl font-semibold text-brand disabled:invisible">
          ‹
        </button>
        <p className="text-xl font-bold first-letter:uppercase">
          {monthName(month)}
          {month.slice(0, 4) !== thisMonth.slice(0, 4) && ` ${month.slice(0, 4)}`}
        </p>
        <button onClick={() => go(1)} disabled={!canForward} aria-label="Mes siguiente" className="min-h-12 min-w-12 rounded-2xl text-2xl font-semibold text-brand disabled:invisible">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekLetters.map((l) => (
          <span key={l} className="text-center font-semibold text-muted" aria-hidden="true">
            {l}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`b${i}`} />
        ))}
        {dates.map((date) => {
          const isDone = done.has(date)
          const label = String(Number(date.slice(8)))
          return date > today ? (
            <div key={date} className="flex justify-center">
              <DayCircle state="future" label={label} />
            </div>
          ) : (
            <button
              key={date}
              onClick={() => toggle(date)}
              aria-pressed={isDone}
              aria-label={formatLong(date)}
              className="flex justify-center"
            >
              <DayCircle state={dayState(date, today, isDone)} label={label} pop={popped === date} />
            </button>
          )
        })}
      </div>

      <div className="space-y-1 px-1">
        {count > 0 ? (
          <p className="text-lg">
            <span className="text-2xl font-bold text-brand tabular-nums">
              {count} {count === 1 ? 'día' : 'días'}
            </span>{' '}
            en {monthName(month)}
          </p>
        ) : (
          month === thisMonth && <p className="text-lg">Cada día que salgas se marcará aquí.</p>
        )}
        {month === thisMonth && prevCount > 0 && count > prevCount && (
          <p className="text-lg font-semibold text-brand-dark">¡Ya has salido más días que en {monthName(prevMonth)}!</p>
        )}
        <p className="text-muted">Si se te olvidó apuntar un día, tócalo para marcarlo.</p>
      </div>
    </section>
  )
}
