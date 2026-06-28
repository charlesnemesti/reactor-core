import { createConfig, fallback, http } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors/coinbaseWallet'
import { walletConnect } from 'wagmi/connectors/walletConnect'
import { mainnet, sepolia } from 'wagmi/chains'
import { createInjectedWalletConnectors } from '../lib/walletProviders'
import { ENV } from './env'

export const appChain = ENV.chainId === sepolia.id ? sepolia : mainnet

const chains = [appChain] as const

/** eth.merkle.io (viem default) often stalls in the browser — use reliable public fallbacks */
const PUBLIC_MAINNET_RPCS = [
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
  'https://cloudflare-eth.com',
] as const

const RPC_TIMEOUT_MS = 12_000

function chainTransport() {
  if (ENV.rpcUrl) return http(ENV.rpcUrl, { timeout: RPC_TIMEOUT_MS })
  if (appChain.id === mainnet.id) {
    return fallback(
      PUBLIC_MAINNET_RPCS.map((url) => http(url, { timeout: RPC_TIMEOUT_MS })),
      { rank: false },
    )
  }
  return http(undefined, { timeout: RPC_TIMEOUT_MS })
}

const connectors = [
  ...createInjectedWalletConnectors(),
  coinbaseWallet({
    appName: 'REACTOR',
    preference: 'all',
  }),
  ...(ENV.walletConnectProjectId
    ? [
        walletConnect({
          projectId: ENV.walletConnectProjectId,
          showQrModal: true,
        }),
      ]
    : []),
]

export const wagmiConfig = createConfig({
  chains: [...chains],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: chainTransport(),
    [sepolia.id]: chainTransport(),
  },
  ssr: false,
})

export const TARGET_CHAIN_ID = appChain.id
