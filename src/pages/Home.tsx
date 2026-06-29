import { CellTooltip } from '../components/CellTooltip'
import { CommandPanel, CommandSectionHead } from '../components/CommandPanel'
import { ContractStrip } from '../components/ContractStrip'
import { Gauges } from '../components/Gauges'
import { Hero } from '../components/Hero'
import { Mechanics } from '../components/Mechanics'
import { RewardPanel } from '../components/RewardPanel'
import { ReactorGrid } from '../components/ReactorGrid'
import { StatusRail } from '../components/StatusRail'
import { dataModeBootMessage } from '../components/DataModeSwitch'
import { useDataMode } from '../context/DataModeContext'
import { useReactor } from '../context/ReactorContext'

export function HomePage() {
  const { snapshot, engineRef } = useReactor()
  const { dataMode, isLiveDataMode } = useDataMode()

  if (!snapshot) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center py-12">
        <CommandPanel tag="Boot sequence" className="px-8 py-6">
          <p className="font-mono text-sm text-cyan-400">
            {dataModeBootMessage(dataMode, isLiveDataMode)}
          </p>
        </CommandPanel>
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

      <section id="reactor" className="section-block page-shell py-20 pb-28 sm:py-28 sm:pb-32">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <CommandSectionHead
            exposed
            eyebrow="Live map"
            title="Reactor grid"
            description={
              isLiveDataMode
                ? 'Every rod is one holder. Hover to inspect, tap to select. Pages slice on-chain holders by charge-score.'
                : 'Every rod is one simulated holder. Hover to inspect, tap to select. Demo metrics mirror the on-chain reactor.'
            }
          />
          <div className="w-full max-w-sm shrink-0 lg:max-w-xs">
            <ContractStrip />
          </div>
        </div>

        <CommandPanel
          tag="Grid control · Live feed"
          glow={snapshot.meltdownActive}
          className={`p-5 sm:p-6 lg:p-8 ${snapshot.meltdownActive ? 'command-shell--meltdown' : ''}`}
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="order-1 flex flex-col gap-5 lg:order-2 lg:col-span-8 xl:col-span-9">
              <div className="flex justify-end">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  {snapshot.demoLabel}
                </div>
              </div>

              <div className="relative min-h-[280px]">
                <ReactorGrid
                  snapshot={snapshot}
                  onSelectCell={(id) => engineRef.current?.selectCell(id)}
                  onHoverCell={(id) => engineRef.current?.hoverCell(id)}
                  onNextPage={() => engineRef.current?.nextPage()}
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

            <aside className="order-2 flex flex-col gap-5 lg:order-1 lg:col-span-4 lg:sticky lg:top-[4.5rem] xl:col-span-3">
              <RewardPanel snapshot={snapshot} />
              <Gauges snapshot={snapshot} layout="stack" />
            </aside>
          </div>
        </CommandPanel>
      </section>

      <div id="buy" className="section-block pb-24 sm:pb-28">
        <Mechanics />
      </div>

      <StatusRail snapshot={snapshot} />
    </>
  )
}
