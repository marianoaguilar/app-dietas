import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { Dietas } from './screens/Dietas'
import { Hoy } from './screens/Hoy'
import { Progreso } from './screens/Progreso'

export default function App() {
  const [tab, setTab] = useState<Tab>('hoy')

  const go = (next: Tab) => {
    setTab(next)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <main className="mx-auto max-w-xl px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-32">
        <div key={tab} className="animate-screen">
          {tab === 'hoy' && <Hoy onChooseDiet={() => go('dietas')} />}
          {tab === 'progreso' && <Progreso />}
          {tab === 'dietas' && <Dietas onChosen={() => go('hoy')} />}
        </div>
      </main>
      <TabBar current={tab} onChange={go} />
    </>
  )
}
