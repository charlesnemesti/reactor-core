/** Vite env — set in Vercel / .env.local before launch */

const ZERO = '0x0000000000000000000000000000000000000000' as const

function addressFromEnv(value: string | undefined): `0x${string}` {
  if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) return value as `0x${string}`
  return ZERO
}

export const ENV = {
  /** $CORE token contract — required for live mode */
  coreCa: addressFromEnv(import.meta.env.VITE_CORE_CA),
  /** Reactor hook / protocol contract — claims & charge reads */
  reactorHookCa: addressFromEnv(import.meta.env.VITE_REACTOR_HOOK_CA),
  /** Ethereum mainnet = 1, Sepolia = 11155111 */
  chainId: Number(import.meta.env.VITE_CHAIN_ID ?? 1),
  /** Optional Alchemy/Infura RPC override */
  rpcUrl: import.meta.env.VITE_RPC_URL as string | undefined,
  /** WalletConnect Cloud project id (optional — MetaMask works without it) */
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined,
} as const

export function isAddressDeployed(address: `0x${string}` = ENV.coreCa): boolean {
  return address.toLowerCase() !== ZERO
}
