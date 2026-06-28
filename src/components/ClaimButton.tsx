import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { reactorAbi } from '../abis/reactor'
import { REACTOR_HOOK_CA } from '../config/contract'
import { useReactorWallet } from '../hooks/useReactorWallet'

interface ClaimButtonProps {
  disabled?: boolean
  className?: string
}

export function ClaimButton({ disabled = false, className = '' }: ClaimButtonProps) {
  const { isConnected, wrongChain, hookLive, formatted } = useReactorWallet()
  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const claimable = Number(formatted.claimableEth ?? 0)
  const canClaim = hookLive && isConnected && !wrongChain && claimable > 0 && !disabled

  function handleClaim() {
    reset()
    writeContract({
      address: REACTOR_HOOK_CA,
      abi: reactorAbi,
      functionName: 'claim',
    })
  }

  if (!hookLive) return null

  return (
    <div className={className}>
      <button
        type="button"
        className="btn-primary btn-beam w-full"
        disabled={!canClaim || isPending || isConfirming}
        onClick={handleClaim}
      >
        {isPending || isConfirming
          ? 'Claiming…'
          : isSuccess
            ? 'Claimed ✓'
            : `Claim ${formatted.claimableEth ?? '0'} ETH`}
      </button>
      {!isConnected && (
        <p className="mt-2 text-center font-mono text-[10px] text-[var(--text-muted)]">
          Connect wallet to claim
        </p>
      )}
      {error && (
        <p className="mt-2 text-center font-mono text-[10px] text-meltdown-400" role="alert">
          {error.message.split('\n')[0]}
        </p>
      )}
    </div>
  )
}
