import { useState } from 'react'
import { amount, hasDetails } from '../diets'
import type { Dish } from '../types'
import { DishDetails } from './DishDetails'

// Platos de una comida. Los que tienen receta o equivalencias se pueden tocar.
export function DishList({ dishes }: { dishes: Dish[] }) {
  const [open, setOpen] = useState<Dish | null>(null)

  return (
    <>
      <ul className="space-y-2">
        {dishes.map((dish, i) => {
          const qty = amount(dish)
          const content = (
            <>
              <span className="block font-medium">{dish.name}</span>
              {qty && <span className="block text-muted">{qty}</span>}
            </>
          )
          return (
            <li key={i}>
              {hasDetails(dish) ? (
                <button
                  onClick={() => setOpen(dish)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-cream px-4 py-2 text-left"
                >
                  <span>{content}</span>
                  <span className="shrink-0 font-semibold text-brand">
                    {dish.ingredients ? 'Receta' : 'Ver'} ›
                  </span>
                </button>
              ) : (
                <div className="min-h-12 rounded-xl px-4 py-2">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
      {open && <DishDetails dish={open} onClose={() => setOpen(null)} />}
    </>
  )
}
