import lottie, { type AnimationItem } from 'lottie-web'
import { memo, useEffect, useRef } from 'react'
import batteryAnimation from '../assets/lottie/battery.json'
import type { ReactorCell } from '../engine/types'

/** Battery.json: full charge ≈ frame 0, empty ≈ frame 60 */
const FULL_FRAME = 0
const EMPTY_FRAME = 60
const MATURITY_SMOOTH = 8

function maturityToFrame(maturity: number): number {
  const m = Math.max(0, Math.min(1, maturity))
  return FULL_FRAME + (1 - m) * (EMPTY_FRAME - FULL_FRAME)
}

interface ReactorCellVisualProps {
  cell: ReactorCell
  width: number
  height: number
  selected: boolean
  hovered: boolean
  meltdown: boolean
  onSelect: () => void
  onHover: (active: boolean) => void
}

export const ReactorCellVisual = memo(function ReactorCellVisual({
  cell,
  width,
  height,
  selected,
  hovered,
  meltdown,
  onSelect,
  onHover,
}: ReactorCellVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const propsRef = useRef({ maturity: cell.maturity, ejected: cell.ejected })
  propsRef.current = { maturity: cell.maturity, ejected: cell.ejected }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: batteryAnimation,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    })

    animRef.current = anim

    let displayMaturity = propsRef.current.ejected ? 0 : propsRef.current.maturity
    let raf = 0
    let last = 0

    const tick = (now: number) => {
      if (!last) last = now
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const { maturity, ejected } = propsRef.current
      const target = ejected ? 0 : maturity
      displayMaturity += (target - displayMaturity) * (1 - Math.exp(-dt * MATURITY_SMOOTH))
      anim.goToAndStop(maturityToFrame(displayMaturity), true)

      raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      anim.goToAndStop(maturityToFrame(displayMaturity), true)
      raf = requestAnimationFrame(tick)
    }

    anim.addEventListener('DOMLoaded', startLoop)
    if (anim.isLoaded) startLoop()

    return () => {
      cancelAnimationFrame(raf)
      anim.removeEventListener('DOMLoaded', startLoop)
      anim.destroy()
      animRef.current = null
    }
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Fuel cell ${cell.address}`}
      aria-pressed={selected}
      className={`relative shrink-0 cursor-crosshair overflow-hidden rounded-sm transition-[transform,box-shadow,opacity,filter] duration-150 ease-out ${
        cell.ejected ? 'opacity-25 grayscale' : 'opacity-100'
      } ${hovered ? '-translate-y-0.5 scale-[1.06] z-10' : ''} ${
        selected
          ? 'ring-2 ring-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]'
          : hovered
            ? 'ring-1 ring-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
            : 'ring-1 ring-cyan-400/10'
      } ${meltdown && !cell.ejected ? 'shadow-[0_0_12px_rgba(251,191,36,0.45)]' : ''}`}
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
      <div
        ref={containerRef}
        className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
})
