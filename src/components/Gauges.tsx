import { CORE_OVERHEAT_ETH } from '../config/contract'
import type { ReactorSnapshot } from '../engine/types'
import { CoreVessel } from './CoreVessel'

interface GaugesProps {
  snapshot: ReactorSnapshot
  layout?: 'grid' | 'stack'
  className?: string
}

export function Gauges({ snapshot, layout = 'grid', className = '' }: GaugesProps) {
  const overheating = snapshot.coreEth >= CORE_OVERHEAT_ETH

  if (layout === 'stack') {
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        <div
          className={`panel p-5 ${overheating ? 'border-amber-500/30' : ''} ${
            snapshot.meltdownActive ? 'border-meltdown-500/40 bg-meltdown-500/5' : ''
          }`}
        >
          <div className="eyebrow mb-4 text-center text-cyan-400">The core</div>
          <CoreVessel
            coreEth={snapshot.coreEth}
            stability={snapshot.stability}
            overheating={overheating}
            meltdownActive={snapshot.meltdownActive}
          />
        </div>

        <div
          className={`panel flex flex-col items-center justify-center p-4 ${
            snapshot.meltdownActive ? 'border-meltdown-500/50 bg-meltdown-500/10' : ''
          }`}
        >
          <div
            className={`font-mono text-sm font-bold uppercase tracking-[0.25em] ${
              snapshot.meltdownActive ? 'meltdown-flash' : 'text-[var(--text-muted)]'
            }`}
          >
            {snapshot.meltdownActive ? 'Meltdown' : 'Containment'}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {snapshot.meltdownActive ? 'payout cycle active' : 'awaiting breach'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${className}`}>
      <div
        className={`panel p-5 lg:col-span-1 ${overheating ? 'border-amber-500/30' : ''}`}
      >
        <div className="eyebrow mb-4 text-center text-cyan-400">The core</div>
        <CoreVessel
          coreEth={snapshot.coreEth}
          stability={snapshot.stability}
          overheating={overheating}
          meltdownActive={snapshot.meltdownActive}
        />
      </div>

      <div
        className={`panel flex flex-col items-center justify-center p-4 ${
          snapshot.meltdownActive ? 'border-meltdown-500/50 bg-meltdown-500/10' : ''
        }`}
      >
        <div
          className={`font-mono text-sm font-bold uppercase tracking-[0.25em] ${
            snapshot.meltdownActive ? 'meltdown-flash' : 'text-[var(--text-muted)]'
          }`}
        >
          {snapshot.meltdownActive ? 'Meltdown' : 'Containment'}
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {snapshot.meltdownActive ? 'payout cycle active' : 'awaiting breach'}
        </div>
      </div>
    </div>
  )
}
