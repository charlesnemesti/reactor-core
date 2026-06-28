import type { EIP1193Provider } from 'viem'
import { injected } from 'wagmi/connectors/injected'

type EthereumProvider = EIP1193Provider & {
  isPhantom?: boolean
  isMetaMask?: boolean
  isRabby?: boolean
  isRainbow?: boolean
  isTrust?: boolean
  isTrustWallet?: boolean
  isOkxWallet?: boolean
  isBraveWallet?: boolean
  isZerion?: boolean
  isTokenPocket?: boolean
  providers?: EthereumProvider[]
}

type WalletWindow = Window & {
  phantom?: { ethereum?: EIP1193Provider }
  okxwallet?: EIP1193Provider
  trustwallet?: EIP1193Provider
  ethereum?: EthereumProvider
}

export interface WalletDefinition {
  id: string
  name: string
  shortName: string
  icon: string
  iconClass: string
  detect: () => EIP1193Provider | undefined
}

function getProviders(): EthereumProvider[] {
  if (typeof window === 'undefined') return []
  const eth = (window as WalletWindow).ethereum
  if (!eth) return []
  return eth.providers?.length ? eth.providers : [eth]
}

function findProvider(match: (provider: EthereumProvider) => boolean): EIP1193Provider | undefined {
  return getProviders().find(match)
}

function isMetaMaskOnly(provider: EthereumProvider): boolean {
  return !!provider.isMetaMask && !provider.isPhantom && !provider.isRabby && !provider.isBraveWallet
}

export const INJECTED_WALLETS: WalletDefinition[] = [
  {
    id: 'metaMask',
    name: 'MetaMask',
    shortName: 'MetaMask',
    icon: 'MM',
    iconClass: 'metamask',
    detect: () => findProvider(isMetaMaskOnly),
  },
  {
    id: 'rabby',
    name: 'Rabby',
    shortName: 'Rabby',
    icon: 'RB',
    iconClass: 'rabby',
    detect: () => findProvider((p) => !!p.isRabby),
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    shortName: 'Rainbow',
    icon: 'RW',
    iconClass: 'rainbow',
    detect: () => findProvider((p) => !!p.isRainbow),
  },
  {
    id: 'phantom',
    name: 'Phantom',
    shortName: 'Phantom',
    icon: 'PH',
    iconClass: 'phantom',
    detect: () => {
      if (typeof window === 'undefined') return undefined
      const w = window as WalletWindow
      if (w.phantom?.ethereum) return w.phantom.ethereum
      return findProvider((p) => !!p.isPhantom)
    },
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    shortName: 'OKX',
    icon: 'OK',
    iconClass: 'okx',
    detect: () => {
      if (typeof window === 'undefined') return undefined
      const w = window as WalletWindow
      if (w.okxwallet) return w.okxwallet
      return findProvider((p) => !!p.isOkxWallet)
    },
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    shortName: 'Trust',
    icon: 'TW',
    iconClass: 'trust',
    detect: () => {
      if (typeof window === 'undefined') return undefined
      const w = window as WalletWindow
      if (w.trustwallet) return w.trustwallet
      return findProvider((p) => !!(p.isTrust || p.isTrustWallet))
    },
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    shortName: 'Brave',
    icon: 'BR',
    iconClass: 'brave',
    detect: () => findProvider((p) => !!p.isBraveWallet),
  },
  {
    id: 'zerion',
    name: 'Zerion',
    shortName: 'Zerion',
    icon: 'ZR',
    iconClass: 'zerion',
    detect: () => findProvider((p) => !!p.isZerion),
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    shortName: 'TokenPocket',
    icon: 'TP',
    iconClass: 'tokenpocket',
    detect: () => findProvider((p) => !!p.isTokenPocket),
  },
]

export function createInjectedWalletConnectors() {
  return INJECTED_WALLETS.map((wallet) =>
    injected({
      target() {
        const provider = wallet.detect()
        if (!provider) return undefined
        return {
          id: wallet.id,
          name: wallet.name,
          provider,
        }
      },
      shimDisconnect: true,
    }),
  )
}

const WALLET_META = Object.fromEntries(
  INJECTED_WALLETS.map((w) => [w.name, w]),
) as Record<string, WalletDefinition>

const EXTRA_WALLETS: Record<string, Pick<WalletDefinition, 'shortName' | 'icon' | 'iconClass'>> = {
  'Coinbase Wallet': { shortName: 'Coinbase', icon: 'CB', iconClass: 'coinbase' },
  WalletConnect: { shortName: 'WalletConnect', icon: 'WC', iconClass: 'walletconnect' },
}

export const WALLET_CONNECTOR_ORDER = [
  'MetaMask',
  'Rabby',
  'Rainbow',
  'Phantom',
  'OKX Wallet',
  'Trust Wallet',
  'Brave Wallet',
  'Zerion',
  'TokenPocket',
  'Coinbase Wallet',
  'WalletConnect',
] as const

export function getWalletShortName(name: string): string {
  return WALLET_META[name]?.shortName ?? EXTRA_WALLETS[name]?.shortName ?? name.split(' ')[0] ?? 'Wallet'
}

export function getWalletIcon(name: string): string {
  return WALLET_META[name]?.icon ?? EXTRA_WALLETS[name]?.icon ?? name.slice(0, 2).toUpperCase()
}

export function getWalletIconClass(name: string): string {
  return WALLET_META[name]?.iconClass ?? EXTRA_WALLETS[name]?.iconClass ?? 'default'
}

export function sortConnectorsByName<T extends { name: string }>(connectors: T[]): T[] {
  return [...connectors].sort((a, b) => {
    const ai = WALLET_CONNECTOR_ORDER.indexOf(a.name as (typeof WALLET_CONNECTOR_ORDER)[number])
    const bi = WALLET_CONNECTOR_ORDER.indexOf(b.name as (typeof WALLET_CONNECTOR_ORDER)[number])
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}
