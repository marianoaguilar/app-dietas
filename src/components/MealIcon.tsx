import type { MealType } from '../types'

// Color e icono de cada comida, para saber de un vistazo en qué momento del día está
export const mealTheme: Record<MealType, { soft: string; badge: string; icon: string }> = {
  desayuno: {
    soft: 'bg-desayuno-soft',
    badge: 'bg-white text-desayuno',
    // Sol saliendo
    icon: 'M12 3v3M4.9 7.9l2 2M19.1 7.9l-2 2M3 16h18M7 16a5 5 0 0 1 10 0M6 20h12',
  },
  comida: {
    soft: 'bg-comida-soft',
    badge: 'bg-white text-comida',
    // Tenedor y cuchillo
    icon: 'M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2 0-3.5 2.5-3.5 6s1.5 4 3.5 4',
  },
  merienda: {
    soft: 'bg-merienda-soft',
    badge: 'bg-white text-merienda',
    // Taza
    icon: 'M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3',
  },
  cena: {
    soft: 'bg-cena-soft',
    badge: 'bg-white text-cena',
    // Luna
    icon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  },
}

export function MealIcon({ type, className = 'h-7 w-7' }: { type: MealType; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={mealTheme[type].icon} />
    </svg>
  )
}

export function Check({ className = 'h-6 w-6', animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${animate ? 'animate-draw' : ''}`} fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
