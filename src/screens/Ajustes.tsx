import { useState } from 'react'
import { NumberField } from '../components/NumberField'
import { saveSettings, type Settings } from '../db'
import { fmtKg, parseDecimal, round1, weekdayNames } from '../format'

// Lunes primero
const weekOrder = [1, 2, 3, 4, 5, 6, 0]

export function Ajustes({ settings, firstWeight, onBack }: { settings: Settings; firstWeight?: number; onBack: () => void }) {
  const initialStart = settings.start_weight_kg ?? firstWeight
  const [start, setStart] = useState(initialStart != null ? fmtKg(initialStart) : '')
  const [target, setTarget] = useState(settings.target_weight_kg != null ? fmtKg(settings.target_weight_kg) : '')
  const [weekday, setWeekday] = useState(settings.weigh_in_weekday ?? 1)

  // Un campo vacío se guarda como "sin dato"; uno mal escrito impide guardar
  const parse = (s: string) => (s.trim() === '' ? undefined : parseDecimal(s))
  const values = { start: parse(start), target: parse(target) }
  const valid = Object.values(values).every((v) => v !== null && (v === undefined || v > 0))

  const save = async () => {
    if (!valid) return
    await saveSettings({
      start_weight_kg: values.start != null ? round1(values.start) : undefined,
      target_weight_kg: values.target != null ? round1(values.target) : undefined,
      weigh_in_weekday: weekday,
    })
    onBack()
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="min-h-12 text-lg font-semibold text-brand">
        ‹ Progreso
      </button>
      <h1 className="text-3xl font-bold">Ajustes</h1>
      <section className="space-y-5 rounded-3xl bg-white p-5 shadow-sm">
        <NumberField label="Peso al empezar" unit="kg" value={start} onChange={setStart} />
        <NumberField label="Peso objetivo" unit="kg" value={target} onChange={setTarget} />
        <div>
          <span className="mb-2 block text-lg font-semibold">Día para pesarse</span>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Día para pesarse">
            {weekOrder.map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={weekday === d}
                onClick={() => setWeekday(d)}
                className={`min-h-12 rounded-2xl text-lg font-semibold first-letter:uppercase ${weekday === d ? 'bg-brand text-white' : 'bg-brand-soft text-brand-dark'}`}
              >
                {weekdayNames[d].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <button onClick={save} disabled={!valid} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white disabled:opacity-40">
        Guardar
      </button>
    </div>
  )
}
