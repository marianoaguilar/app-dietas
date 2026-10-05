import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { addActivity, db } from '../db'
import { fmt, parseDecimal, round1 } from '../format'
import { useToday } from '../useToday'
import { DateField } from './DateField'
import { NumberField } from './NumberField'
import { Sheet } from './Sheet'

export function ActivityForm({ onClose }: { onClose: () => void }) {
  const today = useToday()
  const last = useLiveQuery(() => db.activities.orderBy('id').last())
  const [date, setDate] = useState(today)
  const [minutesTyped, setMinutes] = useState<string | null>(null)
  const [kmTyped, setKm] = useState<string | null>(null)

  // Empieza con los datos de la última actividad: si se repite, basta con pulsar Guardar
  const minutesStr = minutesTyped ?? (last ? String(last.minutes) : '')
  const kmStr = kmTyped ?? (last ? fmt(last.km) : '')
  const minutes = minutesStr.trim() === '' ? 0 : parseDecimal(minutesStr)
  const km = kmStr.trim() === '' ? 0 : parseDecimal(kmStr)
  const valid = minutes != null && km != null && minutes >= 0 && km >= 0 && minutes + km > 0

  const save = async () => {
    if (!valid) return
    await addActivity({ date, type: 'andar', minutes: Math.round(minutes), km: round1(km) })
    onClose()
  }

  return (
    <Sheet title="Apuntar actividad" onClose={onClose} closeLabel="Cancelar">
      <div className="space-y-5">
        <NumberField label="Distancia" unit="km" value={kmStr} onChange={setKm} step={0.5} />
        <NumberField label="Tiempo" unit="min" value={minutesStr} onChange={setMinutes} decimal={false} step={5} />
        <DateField value={date} max={today} onChange={setDate} />
        <button onClick={save} disabled={!valid} className="min-h-14 w-full rounded-2xl bg-brand text-lg font-semibold text-white disabled:opacity-40">
          Guardar
        </button>
      </div>
    </Sheet>
  )
}
