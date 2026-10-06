import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { celebrate } from '../celebrate'
import { db, saveWeight } from '../db'
import { fmtKg, parseDecimal, round1 } from '../format'
import { useToday } from '../useToday'
import { DateField } from './DateField'
import { NumberField } from './NumberField'
import { Sheet } from './Sheet'

export function WeightForm({ onClose }: { onClose: () => void }) {
  const today = useToday()
  const [date, setDate] = useState(today)
  const [typed, setTyped] = useState<string | null>(null)
  const [kilos, setKilos] = useState<number | null>(null)
  const last = useLiveQuery(() => db.weight_entries.orderBy('date').last())

  // Empieza con el último peso apuntado para que baste con ajustarlo
  const value = typed ?? (last ? fmtKg(last.weight_kg) : '')
  const kg = parseDecimal(value)
  const valid = kg != null && kg >= 30 && kg <= 300

  const save = async () => {
    if (!valid) return
    const milestone = await saveWeight(date, round1(kg))
    if (milestone == null) return onClose()
    setKilos(milestone)
    celebrate()
  }

  if (kilos != null) {
    return (
      <Sheet title="¡Enhorabuena!" onClose={onClose} closeLabel="Seguir">
        <div className="animate-fade-up py-4 text-center">
          <p className="text-5xl font-bold text-brand tabular-nums">−{kilos} kg</p>
          <p className="mt-4 text-2xl font-bold">{kilos === 1 ? '¡Primer kilo menos!' : `¡Ya van ${kilos} kilos menos!`}</p>
          <p className="mt-2 text-lg text-muted">Lo estás haciendo genial. Sigue así.</p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title="Apuntar peso" onClose={onClose} closeLabel="Cancelar">
      <div className="space-y-5">
        <NumberField label="Peso" unit="kg" value={value} onChange={setTyped} step={0.1} />
        <DateField value={date} max={today} onChange={setDate} />
        <button onClick={save} disabled={!valid} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white disabled:opacity-40">
          Guardar
        </button>
      </div>
    </Sheet>
  )
}
