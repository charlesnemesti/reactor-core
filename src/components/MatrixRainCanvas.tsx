import { useEffect, useRef } from 'react'

interface MatrixRainCanvasProps {
  active: boolean
  /** How long the rain loop runs (ms) */
  durationMs?: number
  className?: string
}

export function MatrixRainCanvas({
  active,
  durationMs = 4500,
  className = 'matrix-rain-canvas pointer-events-none absolute inset-0',
}: MatrixRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let start = 0
    const chars = '01αβ∫Σ∂0123456789ABCDEFCORE'
    const columns: { x: number; y: number; speed: number; chars: string[] }[] = []
    const fadeStart = durationMs * 0.72
    const fadeSpan = durationMs * 0.28

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(window.innerWidth * dpr)
      canvas!.height = Math.round(window.innerHeight * dpr)
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const colW = 14
      const count = Math.ceil(window.innerWidth / colW)
      columns.length = 0
      for (let i = 0; i < count; i++) {
        columns.push({
          x: i * colW,
          y: Math.random() * window.innerHeight,
          speed: 2 + Math.random() * 4,
          chars: Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]),
        })
      }
    }

    function draw(now: number) {
      if (!start) start = now
      const elapsed = now - start
      const fade =
        elapsed > fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / fadeSpan) : 1

      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const col of columns) {
        col.y += col.speed
        if (col.y > window.innerHeight + 120) col.y = -120

        for (let i = 0; i < col.chars.length; i++) {
          const cy = col.y - i * 16
          if (cy < -20 || cy > window.innerHeight + 20) continue
          const alpha = (1 - i / col.chars.length) * 0.55 * fade
          ctx!.font = '11px "IBM Plex Mono", monospace'
          ctx!.fillStyle =
            i === 0
              ? `rgba(167, 243, 208, ${alpha})`
              : `rgba(34, 211, 238, ${alpha * 0.75})`
          ctx!.fillText(col.chars[i]!, col.x, cy)
        }
      }

      if (elapsed < durationMs) raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, durationMs])

  if (!active) return null

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
