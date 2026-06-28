import { getUniswapBuyUrl, isCaDeployed, TOKEN_SYMBOL } from '../config/contract'
import { useReactorWallet } from '../hooks/useReactorWallet'

interface BuyCoreButtonProps {
  className?: string
  compact?: boolean
}

export function BuyCoreButton({ className = '', compact = false }: BuyCoreButtonProps) {
  const { isConnected, live } = useReactorWallet()
  const deployed = isCaDeployed()

  if (!deployed) {
    return (
      <a
        href="#buy"
        className={`btn-primary btn-beam ${compact ? '!px-3 !py-2 !text-[10px]' : ''} ${className}`}
        title="Contract not deployed yet"
      >
        Buy {TOKEN_SYMBOL}
      </a>
    )
  }

  if (!isConnected) {
    return (
      <a
        href="#buy"
        className={`btn-primary btn-beam ${compact ? '!px-3 !py-2 !text-[10px]' : ''} ${className}`}
        title="Connect wallet first"
      >
        Buy {TOKEN_SYMBOL}
      </a>
    )
  }

  return (
    <a
      href={getUniswapBuyUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary btn-beam ${compact ? '!px-3 !py-2 !text-[10px]' : ''} ${className}`}
      title={live ? `Swap ETH → ${TOKEN_SYMBOL} on Uniswap` : undefined}
    >
      Buy {TOKEN_SYMBOL}
    </a>
  )
}
