import { formatEth } from '../engine/demoEngine'
import { useReactorOptional } from '../context/ReactorContext'
import { CommandPanel } from './CommandPanel'
import { StabilityMeter } from './StabilityMeter'

export function LiveReactorPeek() {
  const snapshot = useReactorOptional()?.snapshot
  if (!snapshot) return null

  return (
    <CommandPanel tag="Live reactor feed" scanline={false} className="mb-8 p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            Core
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            {formatEth(snapshot.coreEth)} ETH
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            Cycle
          </div>
          <div className="font-mono text-sm font-semibold text-white">{snapshot.cycle}</div>
        </div>
        <StabilityMeter stability={snapshot.stability} meltdownActive={snapshot.meltdownActive} compact />
      </div>
    </CommandPanel>
  )
}
