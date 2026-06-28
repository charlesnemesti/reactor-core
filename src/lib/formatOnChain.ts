import { formatUnits } from 'viem'

export function formatTokenAmount(value: bigint, decimals = 18, maxFractionDigits = 0): string {
  const n = Number(formatUnits(value, decimals))
  return n.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits })
}

export function formatEthFromWei(value: bigint, digits = 4): string {
  return Number(formatUnits(value, 18)).toFixed(digits)
}
