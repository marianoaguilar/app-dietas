import { amount, fruitEquivalents, isFruit } from '../diets'
import type { Dish } from '../types'
import { Sheet } from './Sheet'

export function DishDetails({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  if (isFruit(dish)) {
    return (
      <Sheet title="Fruta" onClose={onClose}>
        {dish.quantity && <p className="mb-4 text-lg">Cantidad: {amount(dish)}</p>}
        <p className="mb-2 font-semibold">{fruitEquivalents.intro}</p>
        <ul className="space-y-2">
          {fruitEquivalents.options.map((option) => (
            <li key={option} className="rounded-xl bg-cream px-4 py-2">
              {option}
            </li>
          ))}
        </ul>
      </Sheet>
    )
  }

  return (
    <Sheet title={dish.name} onClose={onClose}>
      {dish.ingredients && (
        <>
          <h3 className="mb-2 text-xl font-semibold">Ingredientes</h3>
          <ul className="mb-6 divide-y divide-black/10 rounded-2xl bg-cream">
            {dish.ingredients.map((ing, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-x-4 px-4 py-3">
                <span className="font-medium">{ing.food}</span>
                <span className="text-muted">{amount(ing)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {dish.recipe && (
        <>
          <h3 className="mb-2 text-xl font-semibold">Cómo se hace</h3>
          <p className="leading-relaxed whitespace-pre-line">{dish.recipe}</p>
        </>
      )}
    </Sheet>
  )
}
