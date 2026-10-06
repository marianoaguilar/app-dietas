const colors = ['#1f7a5c', '#3fb487', '#f2b33d', '#e8734a', '#e45a8a', '#6b70d6']

// Lluvia corta de confeti para los momentos de premio. No hace nada con "Reducir movimiento".
export function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60'

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement('span')
    const size = 7 + Math.random() * 7
    piece.className = 'confetti-piece'
    piece.style.left = `${Math.random() * 100}%`
    piece.style.width = `${size}px`
    piece.style.height = `${size * (Math.random() < 0.5 ? 1 : 0.45)}px`
    piece.style.background = colors[i % colors.length]
    piece.style.borderRadius = Math.random() < 0.3 ? '50%' : '2px'
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`)
    piece.style.setProperty('--rot', `${(Math.random() - 0.5) * 1080}deg`)
    piece.style.setProperty('--dur', `${1.6 + Math.random() * 1.2}s`)
    piece.style.setProperty('--delay', `${Math.random() * 0.35}s`)
    layer.appendChild(piece)
  }

  document.body.appendChild(layer)
  setTimeout(() => layer.remove(), 3500)
}
