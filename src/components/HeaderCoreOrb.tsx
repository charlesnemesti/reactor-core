import { useEffect, useRef } from 'react'

interface HeaderCoreOrbProps {
  size?: number
  pulse?: boolean
}

export function HeaderCoreOrb({ size = 40, pulse: alert = false }: HeaderCoreOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0
    let phase = 0
    let last = 0

    function draw(t: number) {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.28
      const pulse = 0.5 + 0.5 * Math.sin(t * (alert ? 4.5 : 2.2))

      ctx!.clearRect(0, 0, size, size)

      ctx!.beginPath()
      ctx!.arc(cx, cy, r + 4, 0, Math.PI * 2)
      ctx!.strokeStyle = alert
        ? `rgba(248, 113, 113, ${0.35 + pulse * 0.45})`
        : `rgba(34, 211, 238, ${0.2 + pulse * 0.25})`
      ctx!.lineWidth = 1
      ctx!.stroke()

      const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r)
      if (alert) {
        g.addColorStop(0, `rgba(254, 202, 202, ${0.85 + pulse * 0.15})`)
        g.addColorStop(0.5, `rgba(248, 113, 113, ${0.75 + pulse * 0.2})`)
        g.addColorStop(1, 'rgba(127, 29, 29, 0.95)')
      } else {
        g.addColorStop(0, `rgba(167, 243, 208, ${0.9})`)
        g.addColorStop(0.5, `rgba(34, 211, 238, ${0.75 + pulse * 0.2})`)
        g.addColorStop(1, 'rgba(6, 78, 59, 0.95)')
      }
      ctx!.beginPath()
      ctx!.arc(cx, cy, r * (0.92 + pulse * 0.08), 0, Math.PI * 2)
      ctx!.fillStyle = g
      ctx!.fill()

      for (let i = 0; i < 3; i++) {
        const angle = t * (alert ? 2.8 : 1.4) + i * 2.1
        ctx!.beginPath()
        ctx!.arc(
          cx + Math.cos(angle) * (r + 6),
          cy + Math.sin(angle) * (r + 6),
          1.2,
          0,
          Math.PI * 2,
        )
        ctx!.fillStyle = alert
          ? `rgba(248, 113, 113, ${0.5 + pulse * 0.4})`
          : `rgba(74, 222, 128, ${0.4 + pulse * 0.3})`
        ctx!.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    function frame(now: number) {
      if (!last) last = now
      phase += Math.min((now - last) / 1000, 0.05)
      last = now
      draw(phase)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [size, alert])

  return (
    <canvas
      ref={canvasRef}
      className={`header-core-orb shrink-0 ${alert ? 'header-core-orb--alert' : ''}`}
      width={size}
      height={size}
      aria-hidden
    />
  )
}
