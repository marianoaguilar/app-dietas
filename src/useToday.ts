import { useEffect, useState } from 'react'
import { todayStr } from './dates'

// La fecha de hoy, actualizada al volver a la app (puede quedarse abierta de un día para otro)
export function useToday() {
  const [today, setToday] = useState(todayStr)
  useEffect(() => {
    const refresh = () => setToday(todayStr())
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    const timer = setInterval(refresh, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
      clearInterval(timer)
    }
  }, [])
  return today
}
