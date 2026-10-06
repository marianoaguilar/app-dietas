export type DayState = 'done' | 'today' | 'past' | 'future'

// Círculo de un día: relleno si salió, punteado si es hoy y aún no, gris suave si pasó sin salir.
// Nunca cruces ni rojo: un día sin salir no es un fallo.
export function dayState(date: string, today: string, done: boolean): DayState {
  if (done) return 'done'
  if (date === today) return 'today'
  return date < today ? 'past' : 'future'
}

const styles: Record<DayState, string> = {
  done: 'bg-linear-to-br from-brand-light to-brand text-white shadow-sm',
  today: 'border-2 border-dashed border-brand text-brand-dark',
  past: 'bg-black/5 text-muted',
  future: 'text-muted/60',
}

export function DayCircle({ state, label, pop = false }: { state: DayState; label: string; pop?: boolean }) {
  return (
    <span
      className={`relative flex aspect-square w-full max-w-12 items-center justify-center rounded-full font-semibold tabular-nums ${styles[state]} ${pop ? 'animate-pop' : ''}`}
    >
      {pop && <span className="animate-ripple absolute inset-0 rounded-full bg-brand-light" aria-hidden="true" />}
      {state === 'done' ? (
        <svg viewBox="0 0 24 24" className={`relative h-1/2 w-1/2 ${pop ? 'animate-draw' : ''}`} fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        label
      )}
    </span>
  )
}

export const weekLetters = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
