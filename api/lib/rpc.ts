import { createPublicClient, fallback, http, type PublicClient } from 'viem'
import { mainnet } from 'viem/chains'

const RPC_TIMEOUT_MS = 20_000

const SERVER_RPCS = [
  process.env.RPC_URL,
  process.env.VITE_RPC_URL,
  'https://ethereum.publicnode.com',
  'https://cloudflare-eth.com',
  'https://eth.llamarpc.com',
].filter((url): url is string => Boolean(url))

export function createServerPublicClient(): PublicClient {
  const transports = SERVER_RPCS.map((url) => http(url, { timeout: RPC_TIMEOUT_MS }))
  return createPublicClient({
    chain: mainnet,
    transport: transports.length === 1 ? transports[0] : fallback(transports, { rank: false }),
  })
}
