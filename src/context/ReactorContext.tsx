import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createDemoEngine } from '../engine/demoEngine'
import type { DemoEngine, ReactorSnapshot } from '../engine/types'
import { BootSequence } from '../components/BootSequence'
import { HudCorners } from '../components/HudCorners'
import { MeltdownOverlay } from '../components/MeltdownOverlay'
import { isBootComplete, markBootComplete } from '../lib/bootState'

interface ReactorContextValue {
  snapshot: ReactorSnapshot | null
  engineRef: RefObject<DemoEngine | null>
  bootDone: boolean
}

const ReactorContext = createContext<ReactorContextValue | null>(null)

export function ReactorProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<DemoEngine | null>(null)
  const [snapshot, setSnapshot] = useState<ReactorSnapshot | null>(null)
  const [bootDone, setBootDone] = useState(() => isBootComplete())

  useEffect(() => {
    const engine = createDemoEngine()
    engineRef.current = engine
    const unsubscribe = engine.subscribe(setSnapshot)

    let frame = 0
    let last = performance.now()

    function loop(now: number) {
      const dt = Math.min(now - last, 50)
      last = now
      engine.tick(dt)
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      unsubscribe()
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  function finishBoot() {
    markBootComplete()
    setBootDone(true)
  }

  return (
    <ReactorContext.Provider value={{ snapshot, engineRef, bootDone }}>
      {!bootDone && <BootSequence onDone={finishBoot} />}
      {children}
      <MeltdownOverlay />
      <HudCorners />
    </ReactorContext.Provider>
  )
}

export function useReactor() {
  const ctx = useContext(ReactorContext)
  if (!ctx) throw new Error('useReactor must be used within ReactorProvider')
  return ctx
}

export function useReactorOptional() {
  return useContext(ReactorContext)
}
