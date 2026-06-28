/** Shared canvas design tokens — mirrors src/index.css reactor HUD palette */

export const HUD = {
  steel950: '#06080c',
  steel900: '#0a0e14',
  steel800: '#121820',
  steel700: '#1a2330',
  cyan: '#22d3ee',
  cyanDim: 'rgba(34, 211, 238, 0.18)',
  cyanMid: 'rgba(34, 211, 238, 0.45)',
  cyanBright: 'rgba(34, 211, 238, 0.75)',
  charge: '#4ade80',
  chargeDim: 'rgba(74, 222, 128, 0.2)',
  chargeMid: 'rgba(74, 222, 128, 0.55)',
  amber: '#fbbf24',
  amberMid: 'rgba(251, 191, 36, 0.55)',
  meltdown: '#f87171',
  meltdownMid: 'rgba(248, 113, 113, 0.6)',
  muted: 'rgba(184, 197, 214, 0.45)',
  whiteSoft: 'rgba(255, 255, 255, 0.12)',
} as const

export function chamferRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  chamfer: number,
) {
  const c = Math.min(chamfer, w / 4, h / 4)
  ctx.beginPath()
  ctx.moveTo(x + c, y)
  ctx.lineTo(x + w - c, y)
  ctx.lineTo(x + w, y + c)
  ctx.lineTo(x + w, y + h - c)
  ctx.lineTo(x + w - c, y + h)
  ctx.lineTo(x + c, y + h)
  ctx.lineTo(x, y + h - c)
  ctx.lineTo(x, y + c)
  ctx.closePath()
}

export function roundRectPath(
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

export function drawHudBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  intensity: number,
  size = 6,
) {
  const a = 0.25 + intensity * 0.55
  ctx.strokeStyle = `rgba(34, 211, 238, ${a})`
  ctx.lineWidth = 1.25
  const len = size

  const corners: [number, number, number, number, number, number][] = [
    [x, y + len, x, y, x + len, y],
    [x + w - len, y, x + w, y, x + w, y + len],
    [x, y + h - len, x, y + h, x + len, y + h],
    [x + w - len, y + h, x + w, y + h, x + w, y + h - len],
  ]

  for (const [x1, y1, x2, y2, x3, y3] of corners) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.stroke()
  }
}

export function drawHudScanline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  phase: number,
  alpha = 0.07,
) {
  const scanY = y + ((phase * 0.35) % 1) * h
  const grad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8)
  grad.addColorStop(0, 'rgba(34, 211, 238, 0)')
  grad.addColorStop(0.5, `rgba(34, 211, 238, ${alpha})`)
  grad.addColorStop(1, 'rgba(34, 211, 238, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(x, scanY - 8, w, 16)
}

export function drawGridScanlines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing = 4,
) {
  ctx.save()
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.035)'
  ctx.lineWidth = 0.5
  for (let ly = y + 2; ly < y + h; ly += spacing) {
    ctx.beginPath()
    ctx.moveTo(x + 1, ly)
    ctx.lineTo(x + w - 1, ly)
    ctx.stroke()
  }
  ctx.restore()
}

export type ChargePalette = 'idle' | 'charging' | 'charged' | 'meltdown' | 'ejected'

export function chargePalette(
  maturity: number,
  meltdown: boolean,
  ejected: boolean,
): ChargePalette {
  if (ejected) return 'ejected'
  if (meltdown) return 'meltdown'
  if (maturity > 0.72) return 'charged'
  if (maturity > 0.18) return 'charging'
  return 'idle'
}

export function plasmaGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  palette: ChargePalette,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  switch (palette) {
    case 'ejected':
      g.addColorStop(0, 'rgba(71, 85, 105, 0.35)')
      g.addColorStop(1, 'rgba(30, 41, 59, 0.5)')
      break
    case 'meltdown':
      g.addColorStop(0, 'rgba(254, 240, 138, 0.92)')
      g.addColorStop(0.4, 'rgba(251, 191, 36, 0.88)')
      g.addColorStop(1, 'rgba(180, 83, 9, 0.9)')
      break
    case 'charged':
      g.addColorStop(0, 'rgba(167, 243, 208, 0.95)')
      g.addColorStop(0.35, 'rgba(74, 222, 128, 0.92)')
      g.addColorStop(1, 'rgba(6, 95, 70, 0.94)')
      break
    case 'charging':
      g.addColorStop(0, 'rgba(103, 232, 249, 0.92)')
      g.addColorStop(0.4, 'rgba(34, 211, 238, 0.85)')
      g.addColorStop(1, 'rgba(14, 116, 144, 0.9)')
      break
    default:
      g.addColorStop(0, 'rgba(34, 211, 238, 0.15)')
      g.addColorStop(1, 'rgba(6, 8, 12, 0.6)')
  }
  return g
}

export function glowColor(palette: ChargePalette, pulse: number): string {
  const a = 0.06 + pulse * 0.08
  switch (palette) {
    case 'meltdown':
      return `rgba(251, 191, 36, ${a * 2.2})`
    case 'charged':
      return `rgba(74, 222, 128, ${a * 1.8})`
    case 'charging':
      return `rgba(34, 211, 238, ${a * 1.6})`
    default:
      return `rgba(34, 211, 238, ${a * 0.5})`
  }
}

export function borderColor(
  palette: ChargePalette,
  selected: boolean,
  hovered: boolean,
): string {
  if (selected) return HUD.cyanBright
  if (hovered) return HUD.cyanMid
  if (palette === 'meltdown') return HUD.amberMid
  if (palette === 'charged') return 'rgba(74, 222, 128, 0.35)'
  if (palette === 'ejected') return 'rgba(100, 116, 139, 0.3)'
  return HUD.cyanDim
}
