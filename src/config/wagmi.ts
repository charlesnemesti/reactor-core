import { createConfig, http } from 'wagmi'
import { coinbaseWallet } from 'wagmi/connectors/coinbaseWallet'
import { walletConnect } from 'wagmi/connectors/walletConnect'
import { mainnet, sepolia } from 'wagmi/chains'
import { createInjectedWalletConnectors } from '../lib/walletProviders'
import { ENV } from './env'

export const appChain = ENV.chainId === sepolia.id ? sepolia : mainnet

const chains = [appChain] as const

function chainTransport() {
  return ENV.rpcUrl ? http(ENV.rpcUrl) : http()
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
