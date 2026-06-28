import { useEffect, useRef } from 'react'
import { CORE_OVERHEAT_ETH } from '../config/contract'
import { formatEth } from '../engine/demoEngine'
import {
  chamferRectPath,
  drawGridScanlines,
  drawHudBrackets,
  drawHudScanline,
  glowColor,
  plasmaGradient,
  roundRectPath,
} from '../lib/reactorCanvas'

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
      const h = Math.round(w * 0.78)
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function drawVessel(w: number, h: number, fill: number, phase: number, glow: number) {
      const { overheating: hot, meltdownActive: meltdown } = propsRef.current
      ctx!.clearRect(0, 0, w, h)

      const pad = w * 0.04
      const frameX = pad
      const frameY = pad * 0.6
      const frameW = w - pad * 2
      const frameH = h - pad * 1.4
      const chamfer = Math.min(8, w * 0.04)
      const headerH = h * 0.11
      const footerH = h * 0.09

      const palette = meltdown
        ? 'meltdown'
        : hot
          ? 'meltdown'
          : fill > 0.75
            ? 'charged'
            : fill > 0.2
              ? 'charging'
              : 'idle'

      // ambient glow
      const glowGrad = ctx!.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.58)
      glowGrad.addColorStop(0, glowColor(palette, glow))
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = glowGrad
      ctx!.fillRect(0, 0, w, h)

      // HUD outer frame
      chamferRectPath(ctx!, frameX, frameY, frameW, frameH, chamfer)
      ctx!.fillStyle = 'rgba(6, 8, 12, 0.94)'
      ctx!.fill()
      ctx!.strokeStyle = meltdown
        ? 'rgba(248, 113, 113, 0.55)'
        : hot
          ? 'rgba(251, 191, 36, 0.45)'
          : 'rgba(34, 211, 238, 0.28)'
      ctx!.lineWidth = 1.25
      ctx!.stroke()

      drawHudBrackets(ctx!, frameX, frameY, frameW, frameH, 0.85, 10)

      // header strip
      ctx!.save()
      chamferRectPath(ctx!, frameX, frameY, frameW, headerH, chamfer)
      ctx!.clip()
      const hdr = ctx!.createLinearGradient(0, frameY, frameW, frameY)
      hdr.addColorStop(0, 'rgba(34, 211, 238, 0.12)')
      hdr.addColorStop(1, 'rgba(34, 211, 238, 0.02)')
      ctx!.fillStyle = hdr
      ctx!.fillRect(frameX, frameY, frameW, headerH)

      ctx!.beginPath()
      ctx!.arc(frameX + 12, frameY + headerH * 0.55, 3, 0, Math.PI * 2)
      ctx!.fillStyle = meltdown
        ? `rgba(248, 113, 113, ${0.7 + glow * 0.3})`
        : hot
          ? `rgba(251, 191, 36, ${0.65 + glow * 0.35})`
          : `rgba(74, 222, 128, ${0.55 + glow * 0.35})`
      ctx!.fill()

      ctx!.font = '600 9px "IBM Plex Mono", ui-monospace, monospace'
      ctx!.fillStyle = 'rgba(184, 197, 214, 0.7)'
      ctx!.textAlign = 'left'
      ctx!.textBaseline = 'middle'
      ctx!.fillText('THE CORE · ACCUMULATOR', frameX + 20, frameY + headerH * 0.55)

      ctx!.textAlign = 'right'
      ctx!.fillStyle = meltdown ? 'rgba(248, 113, 113, 0.85)' : 'rgba(34, 211, 238, 0.75)'
      ctx!.fillText(meltdown ? 'BREACH' : hot ? 'OVERHEAT' : 'NOMINAL', frameX + frameW - 10, frameY + headerH * 0.55)
      ctx!.restore()

      // chamber
      const inset = 6
      const cx = frameX + inset
      const cy = frameY + headerH + inset * 0.5
      const cw = frameW - inset * 2
      const ch = frameH - headerH - footerH - inset * 1.5
      const rx = Math.min(6, cw * 0.04)

      roundRectPath(ctx!, cx, cy, cw, ch, rx)
      ctx!.save()
      ctx!.clip()

      const cavityGrad = ctx!.createLinearGradient(0, cy, 0, cy + ch)
      cavityGrad.addColorStop(0, 'rgba(6, 8, 12, 0.98)')
      cavityGrad.addColorStop(1, 'rgba(10, 14, 20, 0.99)')
      ctx!.fillStyle = cavityGrad
      ctx!.fillRect(cx, cy, cw, ch)

      drawGridScanlines(ctx!, cx, cy, cw, ch, 4)

      const clampedFill = Math.max(0.04, Math.min(1, fill))
      const surfaceY = cy + ch * (1 - clampedFill)

      // liquid fill with wave
      const steps = Math.max(32, Math.floor(cw / 3))
      const amp = Math.max(2, ch * 0.016)

      ctx!.beginPath()
      ctx!.moveTo(cx, cy + ch)
      ctx!.lineTo(cx, surfaceY)
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = cx + cw * t
        const wave =
          Math.sin(t * Math.PI * 3.2 + phase) * amp +
          Math.sin(t * Math.PI * 5.1 + phase * 1.4) * amp * 0.55 +
          Math.sin(t * Math.PI * 1.8 + phase * 0.65) * amp * 0.35
        ctx!.lineTo(x, surfaceY + wave)
      }
      ctx!.lineTo(cx + cw, cy + ch)
      ctx!.closePath()

      const plasmaPal = meltdown ? 'meltdown' : hot ? 'meltdown' : fill > 0.6 ? 'charged' : 'charging'
      ctx!.fillStyle = plasmaGradient(ctx!, cx, surfaceY, cx, cy + ch, plasmaPal)
      ctx!.fill()

      // horizontal level segments
      const levels = 6
      for (let l = 0; l < levels; l++) {
        const ly = cy + (ch * l) / (levels - 1)
        ctx!.strokeStyle = 'rgba(34, 211, 238, 0.06)'
        ctx!.lineWidth = 0.5
        ctx!.beginPath()
        ctx!.moveTo(cx + 4, ly)
        ctx!.lineTo(cx + cw - 4, ly)
        ctx!.stroke()
      }

      // surface highlight
      ctx!.beginPath()
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = cx + cw * t
        const wave =
          Math.sin(t * Math.PI * 3.2 + phase) * amp +
          Math.sin(t * Math.PI * 5.1 + phase * 1.4) * amp * 0.55 +
          Math.sin(t * Math.PI * 1.8 + phase * 0.65) * amp * 0.35
        if (i === 0) ctx!.moveTo(x, surfaceY + wave)
        else ctx!.lineTo(x, surfaceY + wave)
      }
      ctx!.strokeStyle = meltdown
        ? 'rgba(254, 202, 202, 0.5)'
        : hot
          ? 'rgba(254, 240, 138, 0.45)'
          : 'rgba(167, 243, 208, 0.4)'
      ctx!.lineWidth = 1
      ctx!.stroke()

      // side gauge ticks
      for (let t = 0; t <= 5; t++) {
        const ty = cy + (ch * t) / 5
        ctx!.strokeStyle = 'rgba(34, 211, 238, 0.15)'
        ctx!.lineWidth = 0.75
        ctx!.beginPath()
        ctx!.moveTo(cx + cw - 2, ty)
        ctx!.lineTo(cx + cw + 2, ty)
        ctx!.stroke()
      }

      drawHudScanline(ctx!, cx, cy, cw, ch, phase, 0.06)

      // glass reflection
      const reflectGrad = ctx!.createLinearGradient(cx, cy, cx + cw * 0.3, cy)
      reflectGrad.addColorStop(0, 'rgba(255,255,255,0.06)')
      reflectGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx!.fillStyle = reflectGrad
      ctx!.fillRect(cx, cy, cw * 0.22, ch)

      ctx!.restore()

      // footer readout band
      const footerY = frameY + frameH - footerH
      ctx!.fillStyle = 'rgba(34, 211, 238, 0.05)'
      ctx!.fillRect(frameX + 1, footerY, frameW - 2, footerH - 1)

      const fillPct = Math.round(clampedFill * 100)
      ctx!.font = '700 10px "IBM Plex Mono", ui-monospace, monospace'
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.fillStyle = meltdown
        ? 'rgba(248, 113, 113, 0.9)'
        : hot
          ? 'rgba(251, 191, 36, 0.9)'
          : 'rgba(74, 222, 128, 0.85)'
      ctx!.fillText(`FILL ${fillPct}%`, frameX + frameW / 2, footerY + footerH * 0.52)

      // footer progress track
      const trackW = frameW * 0.6
      const trackX = frameX + (frameW - trackW) / 2
      const trackY = footerY + footerH * 0.82
      ctx!.fillStyle = 'rgba(26, 35, 48, 0.95)'
      ctx!.fillRect(trackX, trackY, trackW, 2)
      const trackGrad = ctx!.createLinearGradient(trackX, 0, trackX + trackW, 0)
      if (meltdown || hot) {
        trackGrad.addColorStop(0, '#dc2626')
        trackGrad.addColorStop(1, '#fbbf24')
      } else {
        trackGrad.addColorStop(0, '#16a34a')
        trackGrad.addColorStop(1, '#22d3ee')
      }
      ctx!.fillStyle = trackGrad
      ctx!.fillRect(trackX, trackY, trackW * clampedFill, 2)
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
      const h = Math.round(w * 0.78)
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
          className="stability-meter-track h-1.5 overflow-hidden rounded-full bg-steel-800"
          role="img"
          aria-label={`Core stability ${Math.round(stability)} percent`}
        >
          <div
            ref={stabilityBarRef}
            className={`stability-meter-fill h-full rounded-full transition-[width] duration-300 ${
              stabilityLow ? '' : ''
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
