import { useEffect, useRef } from 'react'

interface VantaEffectHandle {
  setOptions(options: Record<string, unknown>): void
  resize(): void
  destroy(): void
}

const BG_BLACK = 0x000000
const DOT_CYAN = 0x22d3ee
const DOT_CHARGE = 0x4ade80
const LINE_MIN = 0x52525b
const LINE_MAX = 0xe4e4e7

/** ~2.4s pulse cycle */
const COLOR_CYCLE_SPEED = 0.0026

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(a: number, b: number, t: number) {
  const ar = (a >> 16) & 0xff
  const ag = (a >> 8) & 0xff
  const ab = a & 0xff
  const br = (b >> 16) & 0xff
  const bg = (b >> 8) & 0xff
  const bb = b & 0xff
  const r = Math.round(lerp(ar, br, t))
  const g = Math.round(lerp(ag, bg, t))
  const bl = Math.round(lerp(ab, bb, t))
  return (r << 16) | (g << 8) | bl
}

function pulseT(time: number, speed: number, phase = 0) {
  const raw = (Math.sin(time * speed + phase) + 1) / 2
  return raw * raw * (3 - 2 * raw)
}

function waitForVanta(maxAttempts = 50): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const tick = () => {
      if (window.VANTA && typeof window.VANTA.NET === 'function' && window.THREE) {
        resolve()
        return
      }
      attempts += 1
      if (attempts >= maxAttempts) {
        reject(new Error('Vanta.js failed to load'))
        return
      }
      requestAnimationFrame(tick)
    }
    tick()
  })
}

export function VantaNetBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffectHandle | null>(null)
  const rafRef = useRef(0)
  const viewportRef = useRef({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false

    async function init() {
      try {
        await waitForVanta()
      } catch (err) {
        console.error('[VantaNetBackground]', err)
        return
      }

      if (cancelled || !containerRef.current || typeof window.VANTA?.NET !== 'function') return

      viewportRef.current = { w: window.innerWidth, h: window.innerHeight }

      const effect = window.VANTA.NET({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: viewportRef.current.h,
        minWidth: viewportRef.current.w,
        scale: 1,
        scaleMobile: 1,
        showDots: true,
        backgroundAlpha: 1,
        color: DOT_CYAN,
        lineColors: LINE_MAX,
        backgroundColor: BG_BLACK,
        points: 11,
        maxDistance: 20,
        spacing: 15,
      })

      effectRef.current = effect

      const animate = (time: number) => {
        if (cancelled || !effectRef.current) return

        const dotT = pulseT(time, COLOR_CYCLE_SPEED, 0)
        const lineT = pulseT(time, COLOR_CYCLE_SPEED, Math.PI * 0.5)

        effectRef.current.setOptions({
          color: lerpColor(DOT_CYAN, DOT_CHARGE, dotT),
          lineColors: lerpColor(LINE_MIN, LINE_MAX, lineT),
          backgroundColor: BG_BLACK,
          backgroundAlpha: 1,
          showDots: true,
        })

        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    void init()

    const onResize = () => {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight }
      effectRef.current?.resize()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 min-h-screen w-full"
      style={{ backgroundColor: '#000000' }}
      aria-hidden
    />
  )
}
