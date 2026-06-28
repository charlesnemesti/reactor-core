import { CORE_OVERHEAT_ETH } from '../config/contract'
import { formatEth } from '../engine/demoEngine'
import type { ReactorSnapshot } from '../engine/types'
import { CommandPanel } from './CommandPanel'
import { StabilityMeter } from './StabilityMeter'

interface StatusRailProps {
  snapshot: ReactorSnapshot
}

export function StatusRail({ snapshot }: StatusRailProps) {
  const loyal = snapshot.cells.filter((c) => !c.ejected).length
  const overheating = snapshot.coreEth >= CORE_OVERHEAT_ETH

  return (
    <div className="status-rail pointer-events-none fixed inset-x-0 bottom-4 z-40 px-3 sm:bottom-6 sm:px-5">
      <CommandPanel
        scanline={false}
        className={`status-rail-panel mx-auto max-w-3xl px-3 py-2.5 sm:px-4 ${
          snapshot.meltdownActive ? 'status-rail-panel--meltdown' : overheating ? 'status-rail-panel--overheat' : ''
        }`}
      >
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="col-span-2 sm:col-span-1">
            <StabilityMeter
              stability={snapshot.stability}
              meltdownActive={snapshot.meltdownActive}
              compact
            />
          </div>

          <Stat label="Core" value={`${formatEth(snapshot.coreEth)} ETH`} accent={overheating} />
          <Stat label="Cycle" value={String(snapshot.cycle)} />
          <Stat label="Rods" value={`${loyal} live`} />
        </div>
      </CommandPanel>
    </div>
  )
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)] sm:text-[9px]">
        {label}
      </div>
      <div
        className={`font-mono text-[11px] font-semibold tabular-nums sm:text-xs ${
          accent ? 'text-amber-400' : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
