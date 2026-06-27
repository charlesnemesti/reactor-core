import { useEffect, useRef } from 'react'
import { CORE_OVERHEAT_ETH } from '../config/contract'
import { formatEth } from '../engine/demoEngine'

interface CoreVesselProps {
  coreEth: number
  stability: number
  overheating: boolean
  meltdownActive: boolean
  className?: string
}

const FILL_SMOOTH = 5.5
const WAVE_SPEED = 1.35

export function CoreVessel({
  coreEth,
  stability,
  overheating,
  meltdownActive,
  className = '',
}: CoreVesselProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stabilityPctRef = useRef<HTMLSpanElement>(null)
  const stabilityBarRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef({ coreEth, stability, overheating, meltdownActive })
  const animRef = useRef({
    fill: 0,
    stability: 0,
    phase: 0,
    glow: 0,
    raf: 0,
    last: 0,
  })

  propsRef.current = { coreEth, stability, overheating, meltdownActive }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const anim = animRef.current
    anim.fill = Math.min(1, propsRef.current.coreEth / CORE_OVERHEAT_ETH)
    anim.stability = propsRef.current.stability

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const w = container!.clientWidth
      const h = Math.round(w * 0.72)
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function drawVessel(w: number, h: number, fill: number, phase: number, glow: number) {
      const { overheating: hot, meltdownActive: meltdown } = propsRef.current
      ctx!.clearRect(0, 0, w, h)

      const pad = w * 0.08
      const lidH = h * 0.1
      const rx = w * 0.06
      const innerX = pad
      const innerY = pad + lidH * 0.35
      const innerW = w - pad * 2
      const innerH = h - innerY - pad * 0.6

      // ambient glow behind vessel
      const glowColor = meltdown
        ? `rgba(239, 68, 68, ${0.12 + glow * 0.08})`
        : hot
          ? `rgba(251, 191, 36, ${0.1 + glow * 0.06})`
          : `rgba(34, 211, 238, ${0.08 + glow * 0.05})`
      const glowGrad = ctx!.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.55)
      glowGrad.addColorStop(0, glowColor)
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = glowGrad
      ctx!.fillRect(0, 0, w, h)

      // vessel shell
      roundRect(ctx!, innerX - 2, innerY - 2, innerW + 4, innerH + 4, rx + 2)
      ctx!.fillStyle = 'rgba(26, 35, 48, 0.95)'
      ctx!.fill()
      ctx!.strokeStyle = meltdown
        ? 'rgba(239, 68, 68, 0.55)'
        : hot
          ? 'rgba(251, 191, 36, 0.45)'
          : 'rgba(34, 211, 238, 0.28)'
      ctx!.lineWidth = 1.5
      ctx!.stroke()

      // glass inner cavity
      roundRect(ctx!, innerX, innerY, innerW, innerH, rx)
      ctx!.save()
      ctx!.clip()

      const cavityGrad = ctx!.createLinearGradient(0, innerY, 0, innerY + innerH)
      cavityGrad.addColorStop(0, 'rgba(6, 8, 12, 0.95)')
      cavityGrad.addColorStop(1, 'rgba(10, 14, 20, 0.98)')
      ctx!.fillStyle = cavityGrad
      ctx!.fillRect(innerX, innerY, innerW, innerH)

      // liquid fill
      const clampedFill = Math.max(0.04, Math.min(1, fill))
      const surfaceY = innerY + innerH * (1 - clampedFill)

      ctx!.beginPath()
      ctx!.moveTo(innerX, innerY + innerH)
      ctx!.lineTo(innerX, surfaceY)

      const steps = Math.max(32, Math.floor(innerW / 3))
      const amp = Math.max(2, innerH * 0.018)
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = innerX + innerW * t
        const wave =
          Math.sin(t * Math.PI * 3.2 + phase) * amp +
          Math.sin(t * Math.PI * 5.1 + phase * 1.4) * amp * 0.55 +
          Math.sin(t * Math.PI * 1.8 + phase * 0.65) * amp * 0.35
        ctx!.lineTo(x, surfaceY + wave)
      }

      ctx!.lineTo(innerX + innerW, innerY + innerH)
      ctx!.closePath()

      const liquidGrad = ctx!.createLinearGradient(0, surfaceY, 0, innerY + innerH)
      if (meltdown) {
        liquidGrad.addColorStop(0, 'rgba(248, 113, 113, 0.95)')
        liquidGrad.addColorStop(0.45, 'rgba(239, 68, 68, 0.88)')
        liquidGrad.addColorStop(1, 'rgba(127, 29, 29, 0.92)')
      } else if (hot) {
        liquidGrad.addColorStop(0, 'rgba(253, 224, 71, 0.95)')
        liquidGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.9)')
        liquidGrad.addColorStop(1, 'rgba(180, 83, 9, 0.88)')
      } else {
        liquidGrad.addColorStop(0, 'rgba(110, 231, 183, 0.95)')
        liquidGrad.addColorStop(0.35, 'rgba(34, 211, 238, 0.88)')
        liquidGrad.addColorStop(1, 'rgba(6, 78, 59, 0.92)')
      }
      ctx!.fillStyle = liquidGrad
      ctx!.fill()

      // surface highlight
      ctx!.beginPath()
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = innerX + innerW * t
        const wave =
          Math.sin(t * Math.PI * 3.2 + phase) * amp +
          Math.sin(t * Math.PI * 5.1 + phase * 1.4) * amp * 0.55 +
          Math.sin(t * Math.PI * 1.8 + phase * 0.65) * amp * 0.35
        if (i === 0) ctx!.moveTo(x, surfaceY + wave)
        else ctx!.lineTo(x, surfaceY + wave)
      }
      ctx!.strokeStyle = meltdown
        ? 'rgba(254, 202, 202, 0.55)'
        : hot
          ? 'rgba(254, 240, 138, 0.5)'
          : 'rgba(167, 243, 208, 0.45)'
      ctx!.lineWidth = 1.2
      ctx!.stroke()

      // inner bubbles / particles
      const bubbleCount = 6
      for (let b = 0; b < bubbleCount; b++) {
        const bx = innerX + innerW * (0.15 + ((b * 0.17 + phase * 0.08) % 0.7))
        const by =
          innerY +
          innerH * (0.55 + 0.35 * ((b * 0.23 + phase * 0.04) % 1)) * clampedFill
        const br = 1.2 + (b % 3) * 0.6
        ctx!.beginPath()
        ctx!.arc(bx, by, br, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(255,255,255,0.08)'
        ctx!.fill()
      }

      // glass reflection
      const reflectGrad = ctx!.createLinearGradient(innerX, innerY, innerX + innerW * 0.35, innerY)
      reflectGrad.addColorStop(0, 'rgba(255,255,255,0.07)')
      reflectGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx!.fillStyle = reflectGrad
      ctx!.fillRect(innerX, innerY, innerW * 0.28, innerH)

      ctx!.restore()

      // core lid / hatch
      const lidY = innerY - lidH * 0.55
      const lidW = innerW * 0.72
      const lidX = innerX + (innerW - lidW) / 2
      roundRect(ctx!, lidX, lidY, lidW, lidH, lidH * 0.35)
      const lidGrad = ctx!.createLinearGradient(lidX, lidY, lidX, lidY + lidH)
      lidGrad.addColorStop(0, 'rgba(58, 74, 94, 0.95)')
      lidGrad.addColorStop(1, 'rgba(26, 35, 48, 0.98)')
      ctx!.fillStyle = lidGrad
      ctx!.fill()
      ctx!.strokeStyle = meltdown
        ? 'rgba(239, 68, 68, 0.6)'
        : hot
          ? 'rgba(251, 191, 36, 0.5)'
          : 'rgba(34, 211, 238, 0.35)'
      ctx!.lineWidth = 1
      ctx!.stroke()

      // lid glow strip
      roundRect(ctx!, lidX + lidW * 0.12, lidY + lidH * 0.72, lidW * 0.76, lidH * 0.18, 2)
      ctx!.fillStyle = meltdown
        ? `rgba(239, 68, 68, ${0.5 + glow * 0.3})`
        : hot
          ? `rgba(251, 191, 36, ${0.45 + glow * 0.25})`
          : `rgba(34, 211, 238, ${0.35 + glow * 0.2})`
      ctx!.fill()
    }

    function frame(now: number) {
      if (!anim.last) anim.last = now
      const dt = Math.min((now - anim.last) / 1000, 0.05)
      anim.last = now

      const targetFill = Math.min(1, propsRef.current.coreEth / CORE_OVERHEAT_ETH)
      anim.fill += (targetFill - anim.fill) * (1 - Math.exp(-dt * FILL_SMOOTH))
      anim.stability +=
        (propsRef.current.stability - anim.stability) * (1 - Math.exp(-dt * FILL_SMOOTH))
      anim.phase += dt * WAVE_SPEED
      anim.glow = 0.5 + 0.5 * Math.sin(anim.phase * 2.1)

      const w = container!.clientWidth
      const h = Math.round(w * 0.72)
      drawVessel(w, h, anim.fill, anim.phase, anim.glow)

      if (stabilityPctRef.current) {
        stabilityPctRef.current.textContent = `${Math.round(anim.stability)}%`
        stabilityPctRef.current.classList.toggle('text-meltdown-400', anim.stability < 25)
        stabilityPctRef.current.classList.toggle('text-charge-400', anim.stability >= 25)
      }
      if (stabilityBarRef.current) {
        stabilityBarRef.current.style.width = `${anim.stability}%`
      }

      anim.raf = requestAnimationFrame(frame)
    }

    resize()
    anim.raf = requestAnimationFrame(frame)

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(anim.raf)
      ro.disconnect()
      anim.last = 0
    }
  }, [])

  const stabilityLow = stability < 25

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        ref={containerRef}
        className={`relative mx-auto w-full max-w-[220px] ${
          meltdownActive ? 'meltdown-flash' : overheating ? 'overheat-active' : ''
        }`}
      >
        <canvas ref={canvasRef} className="block w-full" aria-hidden />
      </div>

      <div className="mt-1 text-center">
        <div
          className={`font-mono text-3xl font-bold tracking-tight ${
            meltdownActive ? 'text-meltdown-400' : overheating ? 'text-amber-400' : 'text-white'
          }`}
        >
          {formatEth(coreEth)}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
          ETH · {overheating ? 'overheats past 1.0' : meltdownActive ? 'meltdown payout' : 'accumulating fees'}
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
        <div className="mb-2 flex items-end justify-between">
          <span className="eyebrow text-[10px]">Core stability</span>
          <span
            ref={stabilityPctRef}
            className={`font-mono text-xl font-bold ${
              stabilityLow ? 'text-meltdown-400' : 'text-charge-400'
            }`}
          >
            {Math.round(stability)}%
          </span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-steel-700/80"
          role="img"
          aria-label={`Core stability ${Math.round(stability)} percent`}
        >
          <div
            ref={stabilityBarRef}
            className={`h-full rounded-full ${
              stabilityLow
                ? 'bg-gradient-to-r from-meltdown-600 via-amber-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.35)]'
                : 'bg-gradient-to-r from-charge-600 via-cyan-400 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
            }`}
            style={{ width: `${stability}%` }}
          />
        </div>

        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          strength buffer · {stabilityLow ? 'critical · breach near' : 'stable · contained'}
        </p>
      </div>
    </div>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
