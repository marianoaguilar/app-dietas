const num1 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })
const num1Fixed = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// 12,4 / 12 (sin decimal si es entero)
export function fmt(n: number) {
  return num1.format(n)
}

// 82,0 (siempre con un decimal, para pesos)
export function fmtKg(n: number) {
  return num1Fixed.format(n)
}

// Acepta "82,5" y "82.5". Devuelve null si no es un número válido.
export function parseDecimal(s: string): number | null {
  const n = Number(s.trim().replace(',', '.'))
  return s.trim() !== '' && Number.isFinite(n) ? n : null
}

export function round1(n: number) {
  return Math.round(n * 10) / 10
}

// Índices de Date.getDay(): 0 = domingo
export const weekdayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
