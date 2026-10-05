import Dexie, { type Table } from 'dexie'
import { addDays } from './dates'
import type { Diet, MealType } from './types'

export interface PlannedMeal {
  date: string
  meal_type: MealType
  meal_id: string
  done: boolean
}

export interface WeightEntry {
  date: string
  weight_kg: number
}

export interface Activity {
  id?: number
  date: string
  type: string
  minutes: number
  km: number
}

export interface Settings {
  id: 'settings'
  start_weight_kg?: number
  target_weight_kg?: number
  weekly_km_goal?: number
  weigh_in_weekday?: number
  active_diet_id?: string
}

class DietDB extends Dexie {
  planned_meals!: Table<PlannedMeal, [string, MealType]>
  weight_entries!: Table<WeightEntry, string>
  activities!: Table<Activity, number>
  settings!: Table<Settings, 'settings'>

  constructor() {
    super('app-dietas')
    this.version(1).stores({
      planned_meals: '[date+meal_type], date',
      weight_entries: 'date',
      activities: '++id, date',
      settings: 'id',
    })
  }
}

export const db = new DietDB()

// Planifica 7 días empezando en startDate: el día 1 de la dieta cae en startDate.
// Sustituye lo que hubiera planificado en esas fechas.
export async function planWeek(diet: Diet, startDate: string) {
  const dates = diet.days.map((_, i) => addDays(startDate, i))
  const records: PlannedMeal[] = diet.days.flatMap((day, i) =>
    day.meals.map((meal) => ({ date: dates[i], meal_type: meal.meal_type, meal_id: meal.id, done: false })),
  )
  await db.transaction('rw', db.planned_meals, db.settings, async () => {
    await db.planned_meals.where('date').anyOf(dates).delete()
    await db.planned_meals.bulkPut(records)
    const current = await db.settings.get('settings')
    await db.settings.put({ ...current, id: 'settings', active_diet_id: diet.id })
  })
}

export async function setDone(date: string, meal_type: MealType, done: boolean) {
  await db.planned_meals.update([date, meal_type], { done })
}
