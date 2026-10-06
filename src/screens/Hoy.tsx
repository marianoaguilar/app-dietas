import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { ActivityWeek } from '../components/ActivityWeek'
import { DishList } from '../components/DishList'
import { Check, MealIcon, mealTheme } from '../components/MealIcon'
import { WeightForm } from '../components/WeightForm'
import { celebrate } from '../celebrate'
import { formatLong } from '../dates'
import { db, getSettings, setDone, type PlannedMeal } from '../db'
import { mealLabels, mealOrder, mealsById } from '../diets'
import { weekday } from '../stats'
import { useToday } from '../useToday'

// Saludo según la hora, como se dice en España
function greeting() {
  const h = new Date().getHours()
  if (h >= 6 && h < 14) return 'Buenos días'
  if (h >= 14 && h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

export function Hoy({ onChooseDiet }: { onChooseDiet: () => void }) {
  const today = useToday()
  const planned = useLiveQuery(() => db.planned_meals.where('date').equals(today).toArray(), [today])

  if (planned === undefined) return null

  const meals = planned
    .filter((p) => mealsById.has(p.meal_id))
    .sort((a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type))
  const doneCount = meals.filter((p) => p.done).length

  // Al marcar la última comida del día, confeti
  const toggle = async (p: PlannedMeal) => {
    await setDone(p.date, p.meal_type, !p.done)
    if (!p.done && meals.every((m) => m === p || m.done)) celebrate()
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold">{greeting()}</h1>
        <p className="text-lg text-muted first-letter:uppercase">{formatLong(today)}</p>
      </header>

      <WeighReminder today={today} />

      <ActivityWeek today={today} />

      {meals.length === 0 ? (
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <p className="mb-5 text-xl">Elige la dieta de esta semana y aquí verás lo que toca comer cada día.</p>
          <button onClick={onChooseDiet} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white">
            Elegir dieta
          </button>
        </section>
      ) : (
        <>
          <section className="space-y-2 px-1" aria-label="Comidas de hoy">
            <div className="flex gap-1.5" aria-hidden="true">
              {meals.map((p) => (
                <span key={p.meal_type} className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${p.done ? 'bg-brand' : 'bg-black/10'}`} />
              ))}
            </div>
            <p key={doneCount} className="animate-fade-up text-lg font-medium text-brand-dark">
              {doneCount === 0
                ? `Hoy tienes ${meals.length} comidas.`
                : doneCount === meals.length
                  ? '¡Todas las comidas de hoy hechas! Muy bien.'
                  : `Llevas ${doneCount} de ${meals.length} comidas. ¡Sigue así!`}
            </p>
          </section>
          {meals.map((p) => (
            <MealCard key={p.meal_type} planned={p} onToggle={() => toggle(p)} />
          ))}
        </>
      )}
    </div>
  )
}

function MealCard({ planned, onToggle }: { planned: PlannedMeal; onToggle: () => void }) {
  const meal = mealsById.get(planned.meal_id)!
  const theme = mealTheme[meal.meal_type]
  const [justDone, setJustDone] = useState(false)

  const toggle = () => {
    setJustDone(!planned.done)
    onToggle()
  }

  return (
    <section className={`overflow-hidden rounded-3xl shadow-card transition-colors duration-300 ${planned.done ? 'bg-brand-soft' : 'bg-white'}`}>
      <div className={`flex items-center gap-3 px-5 py-4 transition-colors duration-300 ${planned.done ? 'bg-brand-soft' : theme.soft}`}>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-colors duration-300 ${
            planned.done ? 'bg-brand text-white' : theme.badge
          }`}
        >
          {planned.done ? <Check className="h-7 w-7" animate={justDone} /> : <MealIcon type={meal.meal_type} />}
        </span>
        <h2 className="flex-1 text-2xl font-bold">{mealLabels[meal.meal_type]}</h2>
        <span className="text-lg text-muted tabular-nums">{meal.time}</span>
      </div>
      <div className="px-5 pt-3 pb-5">
        <DishList dishes={meal.dishes} />
        <button
          onClick={toggle}
          aria-pressed={planned.done}
          className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-semibold ${
            planned.done ? 'border-2 border-brand bg-white text-brand' : 'bg-brand text-white shadow-sm'
          }`}
        >
          {planned.done ? (
            <>
              <Check animate={justDone} />
              Hecha
            </>
          ) : (
            'Marcar como hecha'
          )}
        </button>
      </div>
    </section>
  )
}

function WeighReminder({ today }: { today: string }) {
  const [open, setOpen] = useState(false)
  const settings = useLiveQuery(getSettings)
  const weighedToday = useLiveQuery(async () => (await db.weight_entries.get(today)) != null, [today])

  if (!settings || weighedToday === undefined) return null
  if (settings.weigh_in_weekday !== weekday(today) || weighedToday) return null

  return (
    <>
      <section className="flex items-center justify-between gap-3 rounded-3xl bg-brand-soft p-4">
        <p className="text-lg font-medium text-brand-dark">Hoy es tu día de pesarte.</p>
        <button onClick={() => setOpen(true)} className="min-h-12 shrink-0 rounded-2xl bg-brand px-4 text-lg font-semibold text-white">
          Apuntar
        </button>
      </section>
      {open && <WeightForm onClose={() => setOpen(false)} />}
    </>
  )
}
