import { formatEth, formatNumber, getDemoWalletStats } from '../engine/demoEngine'
import type { ReactorSnapshot } from '../engine/types'
import { LAUNCH_MESSAGE } from '../config/contract'

interface RewardPanelProps {
  snapshot: ReactorSnapshot
  className?: string
}

export function RewardPanel({ snapshot, className = '' }: RewardPanelProps) {
  const wallet = getDemoWalletStats(snapshot)

  return (
    <section className={`panel panel-glow p-5 sm:p-6 ${className}`}>
      <div className="eyebrow mb-2 text-charge-400">Your reward · Claimable</div>
      <div className="mb-1 font-mono text-3xl font-bold text-white sm:text-4xl">
        {formatEth(wallet.claimableEth)}{' '}
        <span className="text-lg text-[var(--text-muted)] sm:text-xl">ETH</span>
      </div>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        ready to claim from the last meltdown
      </p>

      <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
        <Stat label="Your balance" value={`${formatNumber(wallet.balance)} CORE`} />
        <Stat label="Your charge-score" value={formatNumber(wallet.chargeScore)} />
        <Stat
          label="Your est. share"
          value={
            snapshot.meltdownActive
              ? `${formatEth(wallet.estShare)} ETH`
              : LAUNCH_MESSAGE
          }
        />
      </div>

      <p className="mt-5 border-t border-[var(--border-subtle)] pt-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Claim opens when the reactor melts down.{' '}
        <span className="text-meltdown-400">Eject before then and you forfeit your charge.</span>
      </p>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold text-white">{value}</div>
    </div>
  )
}
