import { useLiveQuery } from 'dexie-react-hooks'
import { DishList } from '../components/DishList'
import { formatLong } from '../dates'
import { db, setDone, type PlannedMeal } from '../db'
import { mealLabels, mealOrder, mealsById } from '../diets'
import { useToday } from '../useToday'

export function Hoy({ onChooseDiet }: { onChooseDiet: () => void }) {
  const today = useToday()
  const planned = useLiveQuery(() => db.planned_meals.where('date').equals(today).toArray(), [today])

  if (planned === undefined) return null

  const meals = planned
    .filter((p) => mealsById.has(p.meal_id))
    .sort((a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type))
  const doneCount = meals.filter((p) => p.done).length

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold">Hoy</h1>
        <p className="text-lg text-muted first-letter:uppercase">{formatLong(today)}</p>
      </header>

      {meals.length === 0 ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-5 text-xl">Elige la dieta de esta semana y aquí verás lo que toca comer cada día.</p>
          <button onClick={onChooseDiet} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white">
            Elegir dieta
          </button>
        </section>
      ) : (
        <>
          {doneCount > 0 && (
            <p className="rounded-2xl bg-brand-soft px-4 py-3 text-lg font-medium text-brand-dark">
              {doneCount === meals.length
                ? '¡Todas las comidas de hoy hechas! Muy bien.'
                : `Llevas ${doneCount} de ${meals.length} comidas. ¡Sigue así!`}
            </p>
          )}
          {meals.map((p) => (
            <MealCard key={p.meal_type} planned={p} />
          ))}
        </>
      )}
    </div>
  )
}

function MealCard({ planned }: { planned: PlannedMeal }) {
  const meal = mealsById.get(planned.meal_id)!
  const toggle = () => setDone(planned.date, planned.meal_type, !planned.done)

  return (
    <section className={`rounded-3xl p-5 shadow-sm ${planned.done ? 'bg-brand-soft' : 'bg-white'}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">{mealLabels[meal.meal_type]}</h2>
        <span className="text-lg text-muted">{meal.time}</span>
      </div>
      <DishList dishes={meal.dishes} />
      <button
        onClick={toggle}
        aria-pressed={planned.done}
        className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold ${
          planned.done ? 'border-2 border-brand bg-white text-brand' : 'bg-brand text-white'
        }`}
      >
        {planned.done ? (
          <>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hecha
          </>
        ) : (
          'Marcar como hecha'
        )}
      </button>
    </section>
  )
}
