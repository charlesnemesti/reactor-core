import { useEffect, useRef, useState } from 'react'
import { createDemoEngine } from '../engine/demoEngine'
import type { DemoEngine, ReactorSnapshot } from '../engine/types'
import { CellTooltip } from '../components/CellTooltip'
import { Gauges } from '../components/Gauges'
import { Hero } from '../components/Hero'
import { Mechanics } from '../components/Mechanics'
import { RewardPanel } from '../components/RewardPanel'
import { ReactorGrid } from '../components/ReactorGrid'

export function HomePage() {
  const engineRef = useRef<DemoEngine | null>(null)
  const [snapshot, setSnapshot] = useState<ReactorSnapshot | null>(null)

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

  if (!snapshot) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center py-12">
        <div className="content-block px-8 py-6 font-mono text-sm text-cyan-400">
          Initializing reactor…
        </div>
      </div>
    )
  }

  const activeCellId = snapshot.selectedCellId ?? snapshot.hoveredCellId
  const activeCell = snapshot.cells.find((c) => c.id === activeCellId) ?? null

  const totalChargeScore = snapshot.cells
    .filter((c) => !c.ejected)
    .reduce((sum, c) => sum + c.chargeScore, 0)

  return (
    <>
      <Hero />

      <section className="page-shell pb-12 sm:pb-16">
        <div className="content-block p-5 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-8 xl:col-span-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-1">Live map</p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Reactor grid</h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                  Every rod is one holder. Hover a cell to inspect, tap to select.
                </p>
              </div>
              <div className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                {snapshot.demoLabel}
              </div>
            </div>

            <div className="relative min-h-[280px]">
              <ReactorGrid
                snapshot={snapshot}
                onSelectCell={(id) => engineRef.current?.selectCell(id)}
                onHoverCell={(id) => engineRef.current?.hoverCell(id)}
              />
              {activeCell && (
                <CellTooltip
                  cell={activeCell}
                  coreEth={snapshot.coreEth}
                  totalChargeScore={totalChargeScore}
                />
              )}
            </div>

            <p className="text-sm text-[var(--text-muted)]">
              Tap a cell to see balance, hold time, charge ripeness and core share.
            </p>
          </div>

          <aside className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-4 lg:sticky lg:top-[4.5rem] xl:col-span-3">
            <RewardPanel snapshot={snapshot} />
            <Gauges snapshot={snapshot} layout="stack" />
          </aside>
          </div>
        </div>
      </section>

      <div id="buy">
        <Mechanics />
      </div>
    </>
  )
}
