import data from './data/diets.json'
import type { Diet, DietsFile, Dish, Meal, MealType } from './types'

const file = data as DietsFile

export const fruitEquivalents = file.fruit_equivalents

// La más reciente primero
export const diets: Diet[] = [...file.diets].sort((a, b) => b.id.localeCompare(a.id))

export const mealsById = new Map<string, Meal>()
for (const diet of diets) {
  for (const day of diet.days) {
    for (const meal of day.meals) mealsById.set(meal.id, meal)
  }
}

export const mealOrder: MealType[] = ['desayuno', 'comida', 'merienda', 'cena']

export const mealLabels: Record<MealType, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
}

export function isFruit(dish: Dish) {
  return dish.name === 'Fruta'
}

export function hasDetails(dish: Dish) {
  return Boolean(dish.ingredients?.length) || isFruit(dish)
}

export function amount(item: { quantity?: string; measure?: string }) {
  return [item.quantity, item.measure].filter(Boolean).join(' · ')
}

// "Dieta del 7 de noviembre de 2025", a partir del id (fecha del PDF)
export function dietTitle(diet: Diet) {
  const [y, m, d] = diet.id.split('-').map(Number)
  const date = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d))
  return `Dieta del ${date}`
}
