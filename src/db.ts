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

// Un registro por día que salió a hacer actividad: salir cuenta, sin importar cuánto
export interface ActivityDay {
  date: string
}

export interface Settings {
  id: 'settings'
  start_weight_kg?: number
  target_weight_kg?: number
  weigh_in_weekday?: number
  active_diet_id?: string
  celebrated_kg?: number // último kilo bajado que ya se celebró
}

class DietDB extends Dexie {
  planned_meals!: Table<PlannedMeal, [string, MealType]>
  weight_entries!: Table<WeightEntry, string>
  activity_days!: Table<ActivityDay, string>
  settings!: Table<Settings, 'settings'>

  constructor() {
    super('app-dietas')
    this.version(1).stores({
      planned_meals: '[date+meal_type], date',
      weight_entries: 'date',
      activities: '++id, date',
      settings: 'id',
    })
    // Las actividades con minutos y km pasan a ser días marcados, uno por fecha
    this.version(2)
      .stores({ activity_days: 'date' })
      .upgrade(async (tx) => {
        const old: { date: string }[] = await tx.table('activities').toArray()
        const dates = [...new Set(old.map((a) => a.date))]
        await tx.table('activity_days').bulkPut(dates.map((date) => ({ date })))
        await tx.table('settings').toCollection().modify((s) => {
          delete s.weekly_km_goal
        })
      })
    this.version(3).stores({ activities: null })
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

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('settings')) ?? { id: 'settings' }
}

export async function saveSettings(changes: Partial<Omit<Settings, 'id'>>) {
  await db.transaction('rw', db.settings, async () => {
    await db.settings.put({ ...(await getSettings()), ...changes, id: 'settings' })
  })
}

// Un peso por fecha: si ya había uno ese día, se sustituye.
// Devuelve los kilos bajados si se acaba de llegar a un kilo entero nuevo, para celebrarlo una sola vez.
export async function saveWeight(date: string, weight_kg: number): Promise<number | null> {
  return db.transaction('rw', db.weight_entries, db.settings, async () => {
    await db.weight_entries.put({ date, weight_kg })
    const settings = await getSettings()
    const first = await db.weight_entries.orderBy('date').first()
    const last = await db.weight_entries.orderBy('date').last()
    const start = settings.start_weight_kg ?? first?.weight_kg
    if (start == null || !last) return null
    const kilos = Math.floor(start - last.weight_kg + 1e-9)
    if (kilos < 1 || kilos <= (settings.celebrated_kg ?? 0)) return null
    await db.settings.put({ ...settings, celebrated_kg: kilos })
    return kilos
  })
}

export async function setActivityDay(date: string, done: boolean) {
  if (done) await db.activity_days.put({ date })
  else await db.activity_days.delete(date)
}
