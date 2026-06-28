import { memo, useEffect, useRef } from 'react'
import type { ReactorCell } from '../engine/types'
import {
  borderColor,
  chamferRectPath,
  chargePalette,
  drawGridScanlines,
  drawHudBrackets,
  drawHudScanline,
  glowColor,
  plasmaGradient,
} from '../lib/reactorCanvas'

interface FuelRodCellProps {
  cell: ReactorCell
  width: number
  height: number
  selected: boolean
  hovered: boolean
  meltdown: boolean
  onSelect: () => void
  onHover: (active: boolean) => void
}

const MATURITY_SMOOTH = 7

export const FuelRodCell = memo(function FuelRodCell({
  cell,
  width,
  height,
  selected,
  hovered,
  meltdown,
  onSelect,
  onHover,
}: FuelRodCellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ cell, meltdown, selected, hovered })

  propsRef.current = { cell, meltdown, selected, hovered }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let displayMaturity = propsRef.current.cell.ejected ? 0 : propsRef.current.cell.maturity
    let phase = Math.random() * Math.PI * 2
    let raf = 0
    let last = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.max(1, Math.round(width * dpr))
      canvas!.height = Math.max(1, Math.round(height * dpr))
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function drawRod(w: number, h: number, maturity: number, pulse: number) {
      const { cell: c, meltdown: md, selected: sel, hovered: hov } = propsRef.current
      const ejected = c.ejected
      const palette = chargePalette(maturity, md, ejected)
      const bracketIntensity = sel ? 1 : hov ? 0.65 : 0.25

      ctx!.clearRect(0, 0, w, h)

      const pad = Math.max(3, w * 0.06)
      const frameX = pad
      const frameY = pad
      const frameW = w - pad * 2
      const frameH = h - pad * 2
      const chamfer = Math.min(5, w * 0.1)
      const headerH = Math.max(10, h * 0.14)
      const footerH = Math.max(9, h * 0.12)
      const chamberY = frameY + headerH
      const chamberH = frameH - headerH - footerH

      // ambient glow
      if (!ejected && maturity > 0.06) {
        const g = ctx!.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.75)
        g.addColorStop(0, glowColor(palette, pulse))
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx!.fillStyle = g
        ctx!.fillRect(0, 0, w, h)
      }

      // outer HUD frame
      chamferRectPath(ctx!, frameX, frameY, frameW, frameH, chamfer)
      ctx!.fillStyle = 'rgba(6, 8, 12, 0.92)'
      ctx!.fill()
      ctx!.strokeStyle = borderColor(palette, sel, hov)
      ctx!.lineWidth = sel ? 1.5 : 1
      ctx!.stroke()

      drawHudBrackets(ctx!, frameX, frameY, frameW, frameH, bracketIntensity, Math.min(7, w * 0.12))

      // header telemetry strip
      ctx!.save()
      chamferRectPath(ctx!, frameX, frameY, frameW, headerH, chamfer)
      ctx!.clip()
      const headerGrad = ctx!.createLinearGradient(0, frameY, frameW, frameY)
      headerGrad.addColorStop(0, 'rgba(34, 211, 238, 0.1)')
      headerGrad.addColorStop(1, 'rgba(34, 211, 238, 0.02)')
      ctx!.fillStyle = headerGrad
      ctx!.fillRect(frameX, frameY, frameW, headerH)
      ctx!.restore()

      // status LED
      const ledR = Math.max(1.5, w * 0.035)
      const ledX = frameX + 5
      const ledY = frameY + headerH * 0.52
      ctx!.beginPath()
      ctx!.arc(ledX, ledY, ledR, 0, Math.PI * 2)
      if (ejected) {
        ctx!.fillStyle = 'rgba(100, 116, 139, 0.5)'
      } else if (palette === 'meltdown') {
        ctx!.fillStyle = `rgba(251, 191, 36, ${0.7 + pulse * 0.3})`
      } else if (palette === 'charged') {
        ctx!.fillStyle = `rgba(74, 222, 128, ${0.65 + pulse * 0.35})`
      } else {
        ctx!.fillStyle = `rgba(34, 211, 238, ${0.45 + pulse * 0.3})`
      }
      ctx!.fill()

      // rod ID micro label
      const rodNum = c.id.replace(/\D/g, '').slice(-2) || '00'
      ctx!.font = `600 ${Math.max(6, w * 0.14)}px "IBM Plex Mono", ui-monospace, monospace`
      ctx!.fillStyle = ejected ? 'rgba(148, 163, 184, 0.5)' : 'rgba(184, 197, 214, 0.65)'
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'middle'
      ctx!.fillText(`R${rodNum}`, frameX + frameW - 4, frameY + headerH * 0.52)

      // chamber inset
      const inset = Math.max(2, w * 0.04)
      const cx = frameX + inset
      const cy = chamberY + inset * 0.5
      const cw = frameW - inset * 2
      const ch = chamberH - inset

      chamferRectPath(ctx!, cx, cy, cw, ch, chamfer * 0.6)
      ctx!.strokeStyle = 'rgba(34, 211, 238, 0.08)'
      ctx!.lineWidth = 0.75
      ctx!.stroke()

      ctx!.save()
      chamferRectPath(ctx!, cx, cy, cw, ch, chamfer * 0.6)
      ctx!.clip()

      // cavity
      const cavity = ctx!.createLinearGradient(0, cy, 0, cy + ch)
      cavity.addColorStop(0, 'rgba(8, 12, 18, 0.98)')
      cavity.addColorStop(1, 'rgba(4, 6, 10, 0.99)')
      ctx!.fillStyle = cavity
      ctx!.fillRect(cx, cy, cw, ch)

      drawGridScanlines(ctx!, cx, cy, cw, ch, 5)

      // plasma fill — bottom-up with wave surface
      const fill = ejected ? 0.03 : Math.max(0.05, maturity)
      const fillTop = cy + ch * (1 - fill)

      if (fill > 0.04) {
        const steps = Math.max(12, Math.floor(cw / 2))
        const amp = Math.max(0.6, ch * 0.012)

        ctx!.beginPath()
        ctx!.moveTo(cx, cy + ch)
        ctx!.lineTo(cx, fillTop)

        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const x = cx + cw * t
          const wave =
            Math.sin(t * Math.PI * 4 + phase * 2) * amp +
            Math.sin(t * Math.PI * 2.2 + phase * 1.3) * amp * 0.5
          ctx!.lineTo(x, fillTop + wave)
        }

        ctx!.lineTo(cx + cw, cy + ch)
        ctx!.closePath()
        ctx!.fillStyle = plasmaGradient(ctx!, cx, fillTop, cx, cy + ch, palette)
        ctx!.fill()

        // segmented charge bars overlay
        const segCount = 8
        const segW = cw / segCount
        for (let s = 0; s < segCount; s++) {
          const segFill = (s + 1) / segCount
          if (segFill > fill + 0.02) continue
          const sx = cx + s * segW + segW * 0.15
          ctx!.fillStyle = 'rgba(255, 255, 255, 0.04)'
          ctx!.fillRect(sx, cy + 2, segW * 0.08, ch - 4)
        }

        // surface edge highlight
        ctx!.beginPath()
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const x = cx + cw * t
          const wave =
            Math.sin(t * Math.PI * 4 + phase * 2) * amp +
            Math.sin(t * Math.PI * 2.2 + phase * 1.3) * amp * 0.5
          if (i === 0) ctx!.moveTo(x, fillTop + wave)
          else ctx!.lineTo(x, fillTop + wave)
        }
        ctx!.strokeStyle = ejected
          ? 'rgba(148, 163, 184, 0.15)'
          : palette === 'meltdown'
            ? 'rgba(254, 240, 138, 0.45)'
            : palette === 'charged'
              ? 'rgba(167, 243, 208, 0.4)'
              : 'rgba(103, 232, 249, 0.35)'
        ctx!.lineWidth = 0.75
        ctx!.stroke()
      }

      // vertical tick marks (gauge)
      ctx!.strokeStyle = 'rgba(34, 211, 238, 0.12)'
      ctx!.lineWidth = 0.5
      for (let t = 0; t <= 4; t++) {
        const ty = cy + (ch * t) / 4
        ctx!.beginPath()
        ctx!.moveTo(cx + cw - 3, ty)
        ctx!.lineTo(cx + cw - 1, ty)
        ctx!.stroke()
      }

      drawHudScanline(ctx!, cx, cy, cw, ch, phase, ejected ? 0.03 : 0.08)

      // ejected strike overlay
      if (ejected) {
        ctx!.strokeStyle = 'rgba(248, 113, 113, 0.25)'
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.moveTo(cx + 2, cy + 2)
        ctx!.lineTo(cx + cw - 2, cy + ch - 2)
        ctx!.stroke()
      }

      ctx!.restore()

      // footer charge readout
      const footerY = frameY + frameH - footerH
      ctx!.fillStyle = 'rgba(34, 211, 238, 0.04)'
      ctx!.fillRect(frameX + 1, footerY, frameW - 2, footerH - 1)

      const pct = Math.round(maturity * 100)
      ctx!.font = `700 ${Math.max(7, w * 0.16)}px "IBM Plex Mono", ui-monospace, monospace`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      if (ejected) {
        ctx!.fillStyle = 'rgba(248, 113, 113, 0.55)'
        ctx!.fillText('OUT', frameX + frameW / 2, footerY + footerH * 0.52)
      } else {
        ctx!.fillStyle =
          palette === 'meltdown'
            ? `rgba(251, 191, 36, ${0.85 + pulse * 0.15})`
            : palette === 'charged'
              ? `rgba(74, 222, 128, ${0.85 + pulse * 0.1})`
              : `rgba(34, 211, 238, ${0.75 + pulse * 0.15})`
        ctx!.fillText(`${pct}%`, frameX + frameW / 2, footerY + footerH * 0.52)
      }

      // mini progress track in footer
      const trackW = frameW * 0.55
      const trackX = frameX + (frameW - trackW) / 2
      const trackY = footerY + footerH * 0.82
      ctx!.fillStyle = 'rgba(26, 35, 48, 0.9)'
      ctx!.fillRect(trackX, trackY, trackW, 1.5)
      if (!ejected) {
        const fillGrad = ctx!.createLinearGradient(trackX, 0, trackX + trackW, 0)
        if (palette === 'meltdown') {
          fillGrad.addColorStop(0, '#f59e0b')
          fillGrad.addColorStop(1, '#fbbf24')
        } else if (palette === 'charged') {
          fillGrad.addColorStop(0, '#16a34a')
          fillGrad.addColorStop(1, '#4ade80')
        } else {
          fillGrad.addColorStop(0, '#06b6d4')
          fillGrad.addColorStop(1, '#22d3ee')
        }
        ctx!.fillStyle = fillGrad
        ctx!.fillRect(trackX, trackY, trackW * maturity, 1.5)
      }

      // charged particle traces
      if (!ejected && maturity > 0.5) {
        const count = 1 + Math.floor(maturity * 2)
        for (let s = 0; s < count; s++) {
          const px = cx + cw * (0.15 + ((s * 0.35 + phase * 0.08) % 0.7))
          const py = fillTop + (cy + ch - fillTop) * (0.25 + ((s * 0.4) % 0.65))
          ctx!.beginPath()
          ctx!.arc(px, py, 0.7, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(255,255,255,${0.06 + pulse * 0.05})`
          ctx!.fill()
        }
      }
    }

    function frame(now: number) {
      if (!last) last = now
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      phase += dt * 1.8

      const { cell: c } = propsRef.current
      const target = c.ejected ? 0 : c.maturity
      displayMaturity += (target - displayMaturity) * (1 - Math.exp(-dt * MATURITY_SMOOTH))
      const pulse = 0.5 + 0.5 * Math.sin(phase * 1.8)

      drawRod(width, height, displayMaturity, pulse)
      raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [width, height])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Fuel cell ${cell.address}, ${Math.round(cell.maturity * 100)}% charge`}
      aria-pressed={selected}
      className={`fuel-rod-cell relative shrink-0 cursor-crosshair overflow-visible transition-[transform,filter] duration-200 ease-out ${
        cell.ejected ? 'opacity-35' : 'opacity-100'
      } ${hovered ? '-translate-y-0.5 scale-[1.04] z-10' : ''} ${
        selected ? 'fuel-rod-cell--selected' : ''
      } ${meltdown && !cell.ejected ? 'fuel-rod-cell--meltdown' : ''}`}
      style={{ width, height }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
    </div>
  )
})
