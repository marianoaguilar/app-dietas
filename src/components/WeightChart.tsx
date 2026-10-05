import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { formatShort } from '../dates'
import { fmt } from '../format'

interface Props {
  trend: { week: string; weight: number }[]
  target?: number
}

// Curva con la media de cada semana
export function WeightChart({ trend, target }: Props) {
  const data = trend.map((t) => ({ ...t, label: formatShort(t.week) }))
  return (
    <div className="h-56 w-full" aria-label="Evolución del peso por semanas">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#0000001a" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 18, fill: '#5b6b63' }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis
            domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
            tick={{ fontSize: 18, fill: '#5b6b63' }}
            tickFormatter={(v: number) => fmt(v)}
            tickLine={false}
            axisLine={false}
            width={44}
            allowDecimals={false}
          />
          {target != null && <ReferenceLine y={target} stroke="#1f7a5c" strokeDasharray="6 6" />}
          <Line type="monotone" dataKey="weight" stroke="#1f7a5c" strokeWidth={4} dot={{ r: 5, fill: '#1f7a5c' }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
