import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { DishList } from '../components/DishList'
import { Sheet } from '../components/Sheet'
import { addDays, formatLong } from '../dates'
import { db, planWeek } from '../db'
import { diets, dietTitle, mealLabels } from '../diets'
import type { Diet } from '../types'
import { useToday } from '../useToday'

export function Dietas({ onChosen }: { onChosen: () => void }) {
  const today = useToday()
  const settings = useLiveQuery(() => db.settings.get('settings'))
  const activeId = settings?.active_diet_id
  const [viewing, setViewing] = useState<Diet | null>(null)
  const [choosing, setChoosing] = useState<Diet | null>(null)

  const confirm = async () => {
    if (!choosing) return
    await planWeek(choosing, today)
    setChoosing(null)
    setViewing(null)
    onChosen()
  }

  return (
    <>
      {viewing ? (
        <DietDetail diet={viewing} active={viewing.id === activeId} onBack={() => setViewing(null)} onChoose={() => setChoosing(viewing)} />
      ) : (
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">Dietas</h1>
          <ul className="space-y-4">
            {diets.map((diet) => (
              <li key={diet.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{dietTitle(diet)}</h2>
                  {diet.id === activeId && (
                    <span className="rounded-full bg-brand-soft px-3 py-0.5 font-semibold text-brand-dark">Activa</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setViewing(diet)} className="min-h-14 flex-1 rounded-2xl bg-brand-soft text-lg font-semibold text-brand-dark">
                    Ver
                  </button>
                  <button onClick={() => setChoosing(diet)} className="min-h-14 flex-1 rounded-2xl bg-brand text-lg font-semibold text-white">
                    Elegir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {choosing && (
        <Sheet title="¿Empezar esta dieta hoy?" onClose={() => setChoosing(null)}>
          <p className="mb-2 text-lg">{dietTitle(choosing)}</p>
          <p className="mb-6 text-lg text-muted">
            El día 1 será hoy, {formatLong(today)}, y el día 7 será el {formatLong(addDays(today, 6))}.
          </p>
          <button onClick={confirm} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white">
            Sí, empezar hoy
          </button>
        </Sheet>
      )}
    </>
  )
}

function DietDetail({ diet, active, onBack, onChoose }: { diet: Diet; active: boolean; onBack: () => void; onChoose: () => void }) {
  const [dayNumber, setDayNumber] = useState(1)
  const day = diet.days.find((d) => d.day_number === dayNumber) ?? diet.days[0]

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="min-h-12 text-lg font-semibold text-brand">
        ‹ Dietas
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{dietTitle(diet)}</h1>
        {active && <span className="rounded-full bg-brand-soft px-3 py-0.5 font-semibold text-brand-dark">Activa</span>}
      </div>
      <button onClick={onChoose} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white">
        Elegir para esta semana
      </button>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Día">
        {diet.days.map((d) => (
          <button
            key={d.day_number}
            role="tab"
            aria-selected={d.day_number === day.day_number}
            onClick={() => setDayNumber(d.day_number)}
            className={`min-h-12 min-w-12 shrink-0 rounded-2xl px-3 text-lg font-semibold ${
              d.day_number === day.day_number ? 'bg-brand text-white' : 'bg-white text-ink'
            }`}
          >
            Día {d.day_number}
          </button>
        ))}
      </div>

      {day.meals.map((meal) => (
        <section key={meal.id} className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">{mealLabels[meal.meal_type]}</h2>
            <span className="text-lg text-muted">{meal.time}</span>
          </div>
          <DishList dishes={meal.dishes} />
        </section>
      ))}

      {diet.notes.length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-bold">Consejos del nutricionista</h2>
          <ul className="list-disc space-y-2 pl-5">
            {diet.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
