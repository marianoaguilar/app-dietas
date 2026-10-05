import { useEffect, type ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  closeLabel?: string
  children: ReactNode
}

// Panel que se abre sobre la pantalla, con un botón grande para cerrarlo
export function Sheet({ title, onClose, closeLabel = 'Cerrar', children }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pt-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-6 min-h-14 w-full rounded-2xl bg-brand-soft text-lg font-semibold text-brand-dark"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
