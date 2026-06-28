import { stabilityTone } from '../engine/telemetry'

interface StabilityMeterProps {
  stability: number
  meltdownActive: boolean
  compact?: boolean
}

export function StabilityMeter({ stability, meltdownActive, compact = false }: StabilityMeterProps) {
  const tone = stabilityTone(stability, meltdownActive)
  const pct = Math.max(0, Math.min(100, stability))

  return (
    <div className={`stability-meter stability-meter--${tone} ${compact ? 'stability-meter--compact' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
          Stability
        </span>
        <span className="font-mono text-[10px] tabular-nums text-white">{pct.toFixed(0)}%</span>
      </div>
      <div className="stability-meter-track mt-1.5 h-1.5 overflow-hidden rounded-full bg-steel-800">
        <div
          className="stability-meter-fill h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact && (
        <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">
          <span>S buffer</span>
          <span className={tone === 'critical' || tone === 'meltdown' ? 'text-meltdown-400' : 'text-charge-400'}>
            {tone === 'meltdown' ? 'breach' : tone === 'critical' ? 'critical' : tone === 'warn' ? 'degraded' : 'nominal'}
          </span>
        </div>
      )}
    </div>
  )
}
