interface Props {
  label: string
  unit: string
  value: string
  onChange: (value: string) => void
  decimal?: boolean
  // Botones − y + a los lados, con este paso
  step?: number
}

export function NumberField({ label, unit, value, onChange, decimal = true, step }: Props) {
  const bump = (delta: number) => {
    const n = Number(value.replace(',', '.')) || 0
    const next = Math.max(0, Math.round((n + delta) * 10) / 10)
    onChange(decimal ? next.toFixed(1).replace('.', ',') : String(next))
  }

  return (
    <label className="block">
      <span className="mb-1 block text-lg font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        {step && (
          <button type="button" onClick={() => bump(-step)} aria-label={`Quitar ${step}`} className="min-h-14 min-w-14 rounded-2xl bg-brand-soft text-2xl font-bold text-brand-dark">
            −
          </button>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white pr-14 pl-4 text-center text-2xl font-semibold focus:border-brand focus:outline-none"
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg text-muted">{unit}</span>
        </div>
        {step && (
          <button type="button" onClick={() => bump(step)} aria-label={`Sumar ${step}`} className="min-h-14 min-w-14 rounded-2xl bg-brand-soft text-2xl font-bold text-brand-dark">
            +
          </button>
        )}
      </div>
    </label>
  )
}
