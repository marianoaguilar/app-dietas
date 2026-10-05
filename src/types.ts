export type MealType = 'desayuno' | 'comida' | 'merienda' | 'cena'

export interface Ingredient {
  food: string
  quantity: string
  measure?: string
}

export interface Dish {
  name: string
  quantity?: string
  measure?: string
  ingredients?: Ingredient[]
  recipe?: string
}

export interface Meal {
  id: string
  meal_type: MealType
  time: string
  dishes: Dish[]
}

export interface Day {
  day_number: number
  meals: Meal[]
}

export interface ShoppingCategory {
  category: string
  items: { food: string; quantity: string }[]
}

export interface Diet {
  id: string
  name: string
  notes: string[]
  days: Day[]
  shopping_list: ShoppingCategory[]
}

export interface DietsFile {
  fruit_equivalents: { intro: string; options: string[] }
  diets: Diet[]
}
