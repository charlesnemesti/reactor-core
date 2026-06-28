import { useEffect, useState } from 'react'
import { useReactorOptional } from '../context/ReactorContext'
import { HeroReactorEffect } from './HeroReactorEffect'

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function ScrollReactorOrb() {
  const snapshot = useReactorOptional()?.snapshot
  const meltdown = snapshot?.meltdownActive || snapshot?.meltdownFlash
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const range = Math.max(window.innerHeight * 0.85, 420)
      setScrollProgress(clamp01(window.scrollY / range))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const lift = scrollProgress * 28
  const scale = 0.78 + scrollProgress * 0.22
  const rotate = scrollProgress * 14
  const opacity = 0.62 + scrollProgress * 0.38

  return (
    <div
      className={`scroll-reactor-orb pointer-events-none fixed z-[8] ${meltdown ? 'scroll-reactor-orb--alert' : ''}`}
      aria-hidden
      style={{
        opacity,
        transform: `translate3d(0, ${-lift}px, 0) scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      <HeroReactorEffect scrollProgress={scrollProgress} maxSize={200} />
    </div>
  )
}
