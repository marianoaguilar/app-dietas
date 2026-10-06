export type Tab = 'hoy' | 'progreso' | 'dietas'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'progreso', label: 'Progreso', icon: 'M4 18l5-6 4 3 7-9' },
  { id: 'dietas', label: 'Dietas', icon: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4' },
]

export function TabBar({ current, onChange }: { current: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="mx-auto flex max-w-xl">
        {tabs.map((tab) => {
          const active = tab.id === current
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => onChange(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-0.5 pt-1.5 font-semibold ${
                  active ? 'text-brand-dark' : 'text-muted'
                }`}
              >
                {/* La pestaña activa lleva una píldora de color detrás del icono */}
                <span className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-300 ${active ? 'bg-brand-soft' : ''}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={tab.icon} />
                  </svg>
                </span>
                {tab.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
