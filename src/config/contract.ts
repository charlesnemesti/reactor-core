/** REACTOR ($REACTOR) — contract & protocol configuration */

import { ENV, isAddressDeployed } from './env'

export const TOKEN_SYMBOL = 'REACTOR'
export const TOKEN_NAME = 'REACTOR'
export const TOKEN_DECIMALS = 18
export const TOKEN_INITIAL_SUPPLY = 1_000_000

/** $REACTOR token — from VITE_CORE_CA at build time (mainnet default in env.ts) */
export const CORE_CA = ENV.coreCa

/** Reactor hook — same deployment as $REACTOR token */
export const REACTOR_HOOK_CA = isAddressDeployed(ENV.reactorHookCa)
  ? ENV.reactorHookCa
  : ENV.coreCa

export const CA_PLACEHOLDER_LABEL = 'TBA'
export const TWITTER_URL = 'https://x.com/reactor_core'

export function isCaDeployed(address: string = CORE_CA): boolean {
  return isAddressDeployed(address as `0x${string}`)
}

export function isHookDeployed(address: string = REACTOR_HOOK_CA): boolean {
  return isAddressDeployed(address as `0x${string}`)
}

export function getCaDisplayLabel(address: string = CORE_CA): string {
  return isCaDeployed(address) ? shortenAddress(address, 4) : CA_PLACEHOLDER_LABEL
}

export const UNISWAP_V4_POOL_MANAGER =
  '0x000000000004444c5dc75cB358380D2e3dE08A90' as const

export const BUY_FEE_BPS = 200 // 2%
export const SELL_FEE_BPS = 300 // 3%

export const BETA_MULTIPLIER = 1.67
export const THETA_SMAX = 0.35
export const SETTLE_TIP_BPS = 150 // 1.5%
export const REENGAGEMENT_THRESHOLD = 0.1 // 10% of round-start balance
export const SURVIVOR_WEIGHT = 0.1
export const FRESH_WEIGHT = 1.0

export const CORE_OVERHEAT_ETH = 1.0

export const ETHERSCAN_TOKEN_URL = `https://etherscan.io/token/${CORE_CA}`
export const ETHERSCAN_HOOK_URL = `https://etherscan.io/address/${REACTOR_HOOK_CA}`

/** Uniswap swap deep-link — active once CORE_CA is set */
export function getUniswapBuyUrl(): string {
  if (!isCaDeployed()) return '#buy'
  const chain = ENV.chainId === 11155111 ? 'sepolia' : 'mainnet'
  return `https://app.uniswap.org/#/swap?chain=${chain}&inputCurrency=ETH&outputCurrency=${CORE_CA}`
}

export const UNISWAP_BUY_URL = getUniswapBuyUrl()

/** Auto-switch demo → live reads when token address is configured */
export const LIVE_DATA_ENABLED = isCaDeployed()

export const LAUNCH_MESSAGE = LIVE_DATA_ENABLED ? 'Live on-chain' : 'Live at launch'

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

/** Phase 2: batch protocol reads via viem public client */
export async function readProtocolStats(): Promise<{
  coreEth: number
  stability: number
  cycle: number
  claimableEth: number
}> {
  throw new Error('On-chain protocol reads not wired yet — demo mode for global stats')
}

export async function readWalletStats(_address: string): Promise<{
  balance: number
  chargeScore: number
  estShare: number
  claimableEth: number
}> {
  throw new Error('Use useReactorWallet() hook for connected wallet reads')
}
