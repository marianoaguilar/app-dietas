export function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-4 w-full overflow-hidden rounded-full bg-black/10">
      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}
