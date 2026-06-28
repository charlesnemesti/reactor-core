import { CORE_OVERHEAT_ETH } from '../config/contract'
import { formatEth } from '../engine/demoEngine'
import type { ReactorSnapshot } from '../engine/types'

interface HeroLiveStatsProps {
  snapshot: ReactorSnapshot
}

export function HeroLiveStats({ snapshot }: HeroLiveStatsProps) {
  const overheating = snapshot.coreEth >= CORE_OVERHEAT_ETH

  return (
    <div
      className="hero-telemetry"
      role="status"
      aria-label={`Stability ${snapshot.stability.toFixed(0)} percent, core ${formatEth(snapshot.coreEth)} ETH, cycle ${snapshot.cycle}`}
    >
      <span className={`hero-telemetry-item ${snapshot.stability < 35 ? 'hero-telemetry-item--warn' : ''}`}>
        <span className="hero-telemetry-label">Stability</span>
        <span className="hero-telemetry-value">{snapshot.stability.toFixed(0)}%</span>
      </span>

      <span className="hero-telemetry-sep" aria-hidden />

      <span className={`hero-telemetry-item ${overheating ? 'hero-telemetry-item--warn' : ''}`}>
        <span className="hero-telemetry-label">Core</span>
        <span className="hero-telemetry-value">{formatEth(snapshot.coreEth)} ETH</span>
      </span>

      <span className="hero-telemetry-sep" aria-hidden />

      <span className="hero-telemetry-item">
        <span className="hero-telemetry-label">Cycle</span>
        <span className="hero-telemetry-value">C{snapshot.cycle}</span>
      </span>
    </div>
  )
}
