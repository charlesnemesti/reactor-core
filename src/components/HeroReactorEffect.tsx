import { useEffect, useRef } from 'react'

interface HeroReactorEffectProps {
  /** 0 at page top → 1 after ~one viewport of scroll */
  scrollProgress?: number
  /** Max canvas edge length in px */
  maxSize?: number
}

export function HeroReactorEffect({ scrollProgress = 0, maxSize = 220 }: HeroReactorEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(scrollProgress)

  scrollRef.current = scrollProgress

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let phase = 0
    let last = 0

    function resize() {
      const size = Math.min(maxSize, window.innerWidth * 0.42, window.innerHeight * 0.32)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(size * dpr)
      canvas!.height = Math.round(size * dpr)
      canvas!.style.width = `${size}px`
      canvas!.style.height = `${size}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(size: number, t: number, scroll: number) {
      const cx = size / 2
      const cy = size / 2
      ctx!.clearRect(0, 0, size, size)

      const speed = 1 + scroll * 2.4
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 * speed)
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.9 * speed + 0.4)
      const intensity = 0.65 + scroll * 0.35

      for (let i = 3; i >= 0; i--) {
        const r = size * (0.22 + i * 0.07) * (1 + pulse * 0.04)
        const a = (0.04 + (3 - i) * 0.025) * intensity
        const grad = ctx!.createRadialGradient(cx, cy, r * 0.2, cx, cy, r)
        grad.addColorStop(0, `rgba(34, 211, 238, ${a * 1.8})`)
        grad.addColorStop(0.5, `rgba(74, 222, 128, ${a})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.beginPath()
        ctx!.arc(cx, cy, r, 0, Math.PI * 2)
        ctx!.fillStyle = grad
        ctx!.fill()
      }

      for (let ring = 0; ring < 3; ring++) {
        const radius = size * (0.28 + ring * 0.1)
        const rot = t * (0.35 + ring * 0.15 + scroll * 0.55) * (ring % 2 === 0 ? 1 : -1)
        ctx!.save()
        ctx!.translate(cx, cy)
        ctx!.rotate(rot + scroll * 0.35)
        ctx!.beginPath()
        ctx!.ellipse(0, 0, radius, radius * 0.38, 0, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(34, 211, 238, ${(0.12 + ring * 0.06) * intensity})`
        ctx!.lineWidth = 1.2
        ctx!.stroke()

        const dotCount = 4 + ring
        for (let d = 0; d < dotCount; d++) {
          const angle = (d / dotCount) * Math.PI * 2
          const dx = Math.cos(angle) * radius
          const dy = Math.sin(angle) * radius * 0.38
          ctx!.beginPath()
          ctx!.arc(dx, dy, 2 + ring * 0.4, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(74, 222, 128, ${(0.5 + pulse * 0.3) * intensity})`
          ctx!.fill()
        }
        ctx!.restore()
      }

      const vesselR = size * 0.14 * (0.96 + breathe * 0.06)
      ctx!.beginPath()
      ctx!.arc(cx, cy, vesselR + 6, 0, Math.PI * 2)
      ctx!.strokeStyle = `rgba(34, 211, 238, ${(0.25 + pulse * 0.15) * intensity})`
      ctx!.lineWidth = 2
      ctx!.stroke()

      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, vesselR)
      coreGrad.addColorStop(0, `rgba(167, 243, 208, ${0.95 * intensity})`)
      coreGrad.addColorStop(0.35, `rgba(34, 211, 238, ${(0.85 + pulse * 0.1) * intensity})`)
      coreGrad.addColorStop(0.75, `rgba(6, 182, 212, ${0.7 * intensity})`)
      coreGrad.addColorStop(1, `rgba(6, 78, 59, ${0.9 * intensity})`)
      ctx!.beginPath()
      ctx!.arc(cx, cy, vesselR, 0, Math.PI * 2)
      ctx!.fillStyle = coreGrad
      ctx!.fill()

      ctx!.beginPath()
      ctx!.arc(cx - vesselR * 0.25, cy - vesselR * 0.25, vesselR * 0.22, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(255,255,255,${(0.15 + pulse * 0.1) * intensity})`
      ctx!.fill()

      const sparkCount = 10
      for (let s = 0; s < sparkCount; s++) {
        const angle = t * (1.2 + scroll * 1.8) + s * 1.3
        const dist = vesselR * (1.4 + 0.35 * Math.sin(t * 2 * speed + s))
        const sx = cx + Math.cos(angle) * dist
        const sy = cy + Math.sin(angle) * dist
        ctx!.beginPath()
        ctx!.moveTo(sx, sy)
        ctx!.lineTo(sx - Math.cos(angle) * 8, sy - Math.sin(angle) * 8)
        ctx!.strokeStyle = `rgba(34, 211, 238, ${(0.15 + (s % 3) * 0.08) * intensity})`
        ctx!.lineWidth = 1
        ctx!.stroke()
      }
    }

    function frame(now: number) {
      if (!last) last = now
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      phase += dt
      const size = canvas!.width / Math.min(window.devicePixelRatio || 1, 2)
      draw(size, phase, scrollRef.current)
      raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [maxSize])

  return (
    <div ref={containerRef} className="scroll-reactor-effect" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  )
}
