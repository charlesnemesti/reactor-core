import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { LIVE_DATA_ENABLED } from '../config/contract'
import type { ProtocolStats } from '../hooks/useProtocolStats'
import { createDemoEngine } from '../engine/demoEngine'
import type { DemoEngine, ReactorSnapshot } from '../engine/types'
import { useHolderCells } from '../hooks/useHolderCells'
import { useProtocolStats } from '../hooks/useProtocolStats'
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

const LIVE_PROTOCOL_FALLBACK: ProtocolStats = {
  coreEth: 0,
  stability: 100,
  bufferS: 0,
  bufferSmax: 1,
  cycle: 1,
  meltdownActive: false,
  meltdownFlash: false,
  honeyTotal: 0,
  eligibleWeighted: 0,
}

export function ReactorProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<DemoEngine | null>(null)
  const [demoSnapshot, setDemoSnapshot] = useState<ReactorSnapshot | null>(null)
  const [bootDone, setBootDone] = useState(() => isBootComplete())
  const [gridPage, setGridPage] = useState(0)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null)

  const live = LIVE_DATA_ENABLED
  const {
    data: protocol = LIVE_PROTOCOL_FALLBACK,
    isLoading: protocolLoading,
    isError: protocolError,
    isSuccess: protocolOk,
  } = useProtocolStats()
  const {
    data: holderData,
    isLoading: holdersLoading,
    isError: holdersError,
    isSuccess: holdersOk,
  } = useHolderCells(gridPage)

  useEffect(() => {
    if (live) return

    const engine = createDemoEngine()
    engineRef.current = engine
    const unsubscribe = engine.subscribe(setDemoSnapshot)

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
  }, [live])

  const liveSnapshot = useMemo((): ReactorSnapshot => {
    const cells = holderData?.cells ?? []
    const totalHolders = holderData?.totalHolders ?? 0
    const loyal = cells.filter((c) => !c.ejected).length

    let demoLabel = `live · on-chain · ${totalHolders} rods · page ${gridPage + 1} · cycle ${protocol.cycle}`
    if (protocolLoading && !protocolOk) {
      demoLabel = 'live · syncing protocol…'
    } else if (protocolError && !protocolOk) {
      demoLabel = 'live · protocol read failed · retrying'
    } else if (holdersLoading && !holdersOk) {
      demoLabel = 'live · scanning holders…'
    } else if (holdersError && !holdersOk) {
      demoLabel = 'live · holder scan failed · retrying'
    } else if (totalHolders === 0) {
      demoLabel = `live · on-chain · awaiting first holders · cycle ${protocol.cycle}`
    } else {
      demoLabel = `live · on-chain · ${totalHolders} rods · page ${gridPage + 1} · cycle ${protocol.cycle} · ${loyal} active`
    }

    return {
      cycle: protocol.cycle,
      cells,
      coreEth: protocol.coreEth,
      stability: protocol.stability,
      bufferS: protocol.bufferS,
      bufferSmax: protocol.bufferSmax,
      totalBuysEth: 0,
      totalSellsEth: 0,
      meltdownActive: protocol.meltdownActive,
      meltdownFlash: protocol.meltdownFlash,
      claimableEth: 0,
      selectedCellId,
      hoveredCellId,
      gridPage,
      demoLabel,
    }
  }, [
    protocol,
    protocolLoading,
    protocolError,
    protocolOk,
    holderData,
    holdersLoading,
    holdersError,
    holdersOk,
    selectedCellId,
    hoveredCellId,
    gridPage,
  ])

  const snapshot = live ? liveSnapshot : demoSnapshot

  useMemo(() => {
    if (!live) return

    engineRef.current = {
      subscribe(listener) {
        if (snapshot) listener(snapshot)
        return () => {}
      },
      getSnapshot: () => snapshot ?? ({} as ReactorSnapshot),
      selectCell: (id) => setSelectedCellId(id),
      hoverCell: (id) => setHoveredCellId(id),
      nextPage: () => {
        setGridPage((p) => p + 1)
        setSelectedCellId(null)
        setHoveredCellId(null)
      },
      tick: () => {},
      destroy: () => {},
    }
  }, [live, snapshot])

  const finishBoot = useCallback(() => {
    markBootComplete()
    setBootDone(true)
  }, [])

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
