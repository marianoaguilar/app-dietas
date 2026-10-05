export function DateField({ value, max, onChange }: { value: string; max: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-lg font-semibold">Fecha</span>
      <input
        type="date"
        value={value}
        max={max}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border-2 border-black/15 bg-white px-4 text-lg focus:border-brand focus:outline-none"
      />
    </label>
  )
}
