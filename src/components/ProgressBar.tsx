// Barra del camino: se llena desde cero al aparecer y acaba en una banderita (la meta)
export function ProgressBar({ pct, label }: { pct: number; label: string }) {
  const width = Math.min(100, Math.max(0, pct))
  return (
    <div className="flex items-center gap-2">
      <div role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-5 flex-1 overflow-hidden rounded-full bg-black/8">
        <div className="animate-grow h-full rounded-full bg-linear-to-r from-brand-light to-brand" style={{ width: `${width}%` }} />
      </div>
      <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 21V4" />
        <path d="M5 4h12l-2.5 4L17 12H5" fill="currentColor" fillOpacity={0.25} />
      </svg>
    </div>
  )
}
