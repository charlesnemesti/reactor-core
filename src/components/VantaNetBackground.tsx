import { useEffect, useRef } from 'react'

interface VantaEffectHandle {
  setOptions(options: Record<string, unknown>): void
  resize(): void
  destroy(): void
}

const BASE = {
  color: 0xff3f81,
  backgroundColor: 0x23153c,
  points: 10,
  maxDistance: 20,
  spacing: 15,
} as const

const RANGES = {
  color: [0xff3f81, 0x22d3ee] as const,
  backgroundColor: [0x23153c, 0x1a2330] as const,
  maxDistance: [18, 22] as const,
  spacing: [13, 17] as const,
}

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

function oscillate(min: number, max: number, time: number, speed: number) {
  const t = (Math.sin(time * speed) + 1) / 2
  return lerp(min, max, t)
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

      const effect = window.VANTA.NET({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: window.innerHeight,
        minWidth: window.innerWidth,
        scale: 1,
        scaleMobile: 1,
        showDots: true,
        backgroundAlpha: 1,
        ...BASE,
      })

      effectRef.current = effect

      const animate = (time: number) => {
        if (cancelled || !effectRef.current) return

        const tColor = (Math.sin(time * 0.00008) + 1) / 2
        const tBg = (Math.sin(time * 0.00006 + 1.2) + 1) / 2

        effectRef.current.setOptions({
          color: lerpColor(RANGES.color[0], RANGES.color[1], tColor),
          backgroundColor: lerpColor(RANGES.backgroundColor[0], RANGES.backgroundColor[1], tBg),
          maxDistance: oscillate(RANGES.maxDistance[0], RANGES.maxDistance[1], time, 0.00007),
          spacing: oscillate(RANGES.spacing[0], RANGES.spacing[1], time, 0.00006),
        })

        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    void init()

    const onResize = () => effectRef.current?.resize()
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
      style={{ backgroundColor: '#23153c' }}
      aria-hidden
    />
  )
}
