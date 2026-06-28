import { useEffect, useRef, useState } from 'react'
import { useReactorOptional } from '../context/ReactorContext'

export function MeltdownOverlay() {
  const ctx = useReactorOptional()
  const snapshot = ctx?.snapshot
  const [flash, setFlash] = useState(false)
  const wasMeltdown = useRef(false)
  const lastWarnFlash = useRef(0)

  useEffect(() => {
    if (!snapshot) return

    const justStarted = snapshot.meltdownActive && !wasMeltdown.current
    wasMeltdown.current = snapshot.meltdownActive

    if (justStarted) {
      setFlash(true)
      const t = window.setTimeout(() => setFlash(false), 1400)
      return () => window.clearTimeout(t)
    }

    if (snapshot.meltdownFlash && snapshot.stability < 18 && !snapshot.meltdownActive) {
      const now = Date.now()
      if (now - lastWarnFlash.current < 9000) return
      lastWarnFlash.current = now
      setFlash(true)
      const t = window.setTimeout(() => setFlash(false), 600)
      return () => window.clearTimeout(t)
    }
  }, [snapshot?.meltdownActive, snapshot?.meltdownFlash, snapshot?.stability])

  if (!flash) return null

  const critical = snapshot?.meltdownActive

  return (
    <div
      className={`meltdown-overlay pointer-events-none fixed inset-0 z-[90] ${critical ? 'meltdown-overlay--critical' : 'meltdown-overlay--warn'}`}
      aria-hidden
    >
      <div className="meltdown-overlay-vignette absolute inset-0" />
      <div className="meltdown-overlay-scan absolute inset-0" />
      {critical && (
        <div className="meltdown-overlay-text absolute inset-x-0 top-[18%] text-center font-mono text-sm font-bold uppercase tracking-[0.35em] text-meltdown-400 sm:text-base">
          Meltdown
        </div>
      )}
    </div>
  )
}
