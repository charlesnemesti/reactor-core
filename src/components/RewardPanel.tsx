import { formatEth, formatNumber, getDemoWalletStats } from '../engine/demoEngine'
import type { ReactorSnapshot } from '../engine/types'
import { isCaDeployed, LAUNCH_MESSAGE, shortenAddress, TOKEN_SYMBOL } from '../config/contract'
import { useReactorWallet } from '../hooks/useReactorWallet'
import { ClaimButton } from './ClaimButton'
import { CommandPanel } from './CommandPanel'

interface RewardPanelProps {
  snapshot: ReactorSnapshot
  className?: string
}

export function RewardPanel({ snapshot, className = '' }: RewardPanelProps) {
  const demo = getDemoWalletStats(snapshot)
  const wallet = useReactorWallet()
  const live = isCaDeployed()

  const useOnChain = live && wallet.isConnected && !wallet.wrongChain
  const tag = useOnChain && wallet.address
    ? `Your cell · ${shortenAddress(wallet.address, 3)}`
    : 'Your reward · Claimable'

  const balance =
    useOnChain && wallet.formatted.balance
      ? `${wallet.formatted.balance} ${TOKEN_SYMBOL}`
      : live
        ? '—'
        : `${formatNumber(demo.balance)} ${TOKEN_SYMBOL}`

  const chargeScore =
    useOnChain && wallet.formatted.chargeScore
      ? wallet.formatted.chargeScore
      : live
        ? '—'
        : formatNumber(demo.chargeScore)

  const claimableEth =
    useOnChain && wallet.formatted.claimableEth
      ? wallet.formatted.claimableEth
      : live
        ? '0.000'
        : formatEth(demo.claimableEth)

  const estShare =
    snapshot.meltdownActive || (useOnChain && Number(claimableEth) > 0)
      ? `${claimableEth} ETH`
      : LAUNCH_MESSAGE

  return (
    <CommandPanel as="section" tag={tag} glow className={`p-5 sm:p-6 ${className}`}>
      <div className="mb-1 font-mono text-3xl font-bold text-white sm:text-4xl">
        {claimableEth}{' '}
        <span className="text-lg text-[var(--text-muted)] sm:text-xl">ETH</span>
      </div>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        {useOnChain
          ? 'On-chain claimable from the reactor'
          : live
            ? 'Connect wallet to load your cell'
            : 'ready to claim from the last meltdown (demo)'}
      </p>

      <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
        <Stat label="Your balance" value={balance} />
        <Stat label="Your charge-score" value={chargeScore} />
        <Stat label="Your est. share" value={estShare} />
      </div>

      {wallet.hookLive && (
        <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
          <ClaimButton disabled={!snapshot.meltdownActive && Number(claimableEth) <= 0} />
        </div>
      )}

      <p className="mt-5 border-t border-[var(--border-subtle)] pt-4 text-sm leading-relaxed text-[var(--text-muted)]">
        {live ? (
          <>
            Connect your wallet to sync balance and claim when the hook reports rewards.{' '}
            <span className="text-meltdown-400">Eject before meltdown and you forfeit charge.</span>
          </>
        ) : (
          <>
            Claim opens when the reactor melts down.{' '}
            <span className="text-meltdown-400">Eject before then and you forfeit your charge.</span>
          </>
        )}
      </p>
    </CommandPanel>
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
