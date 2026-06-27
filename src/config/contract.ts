/** REACTOR ($CORE) — contract & protocol configuration (phase 2 integration stubs) */

export const TOKEN_SYMBOL = 'CORE'
export const TOKEN_NAME = 'REACTOR'
export const TOKEN_DECIMALS = 18
export const TOKEN_INITIAL_SUPPLY = 1_000_000

/** Placeholder until mainnet deployment */
export const CORE_CA = '0x0000000000000000000000000000000000000000' as const

/** Uniswap v4 hook — fees routed to THE CORE in ETH */
export const REACTOR_HOOK_CA = '0x0000000000000000000000000000000000000000' as const

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
export const UNISWAP_BUY_URL = '#'

export const LIVE_DATA_ENABLED = false
export const LAUNCH_MESSAGE = 'Live at launch'

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

/** Phase 2: wire viem/ethers reads here */
export async function readProtocolStats(): Promise<{
  coreEth: number
  stability: number
  cycle: number
  claimableEth: number
}> {
  throw new Error('On-chain reads not implemented — demo mode only')
}

export async function readWalletStats(_address: string): Promise<{
  balance: number
  chargeScore: number
  estShare: number
  claimableEth: number
}> {
  throw new Error('On-chain reads not implemented — demo mode only')
}
