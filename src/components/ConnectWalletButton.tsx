import { useEffect, useRef, useState } from 'react'
import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import type { Connector } from 'wagmi'
import { shortenAddress } from '../config/contract'
import { appChain, TARGET_CHAIN_ID } from '../config/wagmi'
import { useReactorWallet } from '../hooks/useReactorWallet'
import {
  getWalletIcon,
  getWalletIconClass,
  getWalletShortName,
  sortConnectorsByName,
} from '../lib/walletProviders'
import { WalletMenu } from './WalletMenu'

export function ConnectWalletButton() {
  const { address, isConnected, wrongChain, status } = useReactorWallet()
  const { connector } = useConnection()
  const { connect, isPending, error, reset } = useConnect()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const allConnectors = useConnectors()
  const [availableConnectors, setAvailableConnectors] = useState<Connector[]>([])

  useEffect(() => {
    let cancelled = false
    void Promise.all(
      allConnectors.map(async (connector) => {
        try {
          const provider = await connector.getProvider()
          return provider ? connector : null
        } catch {
          return null
        }
      }),
    ).then((results) => {
      if (cancelled) return
      const ready = results.filter((c): c is Connector => c !== null)
      setAvailableConnectors(
        sortConnectorsByName(
          ready.filter(
            (connector, index, list) =>
              list.findIndex((c) => c.name === connector.name) === index,
          ),
        ),
      )
    })
    return () => {
      cancelled = true
    }
  }, [allConnectors])
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const walletName = connector?.name ?? 'Wallet'
  const walletShort = getWalletShortName(walletName)
  const isConnecting = isPending || status === 'connecting'

  const closeMenu = () => setMenuOpen(false)

  const handleChangeWallet = () => {
    void disconnect()
  }

  if (wrongChain) {
    return (
      <button
        type="button"
        className="wallet-btn wallet-btn--warn"
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
      >
        {isSwitching ? 'Switching…' : `Switch to ${appChain.name}`}
      </button>
    )
  }

  const buttonLabel = isConnected && address
    ? `${walletShort} · ${shortenAddress(address, 4)}`
    : isConnecting
      ? 'Connecting…'
      : 'Connect wallet'

  return (
    <div className="wallet-root" ref={rootRef}>
      <button
        type="button"
        className={`wallet-btn ${isConnected ? 'wallet-btn--connected' : ''}`}
        disabled={isConnecting}
        onClick={() => {
          reset()
          setMenuOpen((open) => !open)
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        {isConnected && <span className="command-live-dot shrink-0" aria-hidden />}
        {buttonLabel}
      </button>

      <WalletMenu anchorRef={rootRef} open={menuOpen} onClose={closeMenu}>
        {isConnected && address ? (
          <>
            <div className="wallet-menu-header">
              <span
                className={`wallet-menu-icon wallet-menu-icon--${getWalletIconClass(walletName)}`}
                aria-hidden
              >
                {getWalletIcon(walletName)}
              </span>
              <div className="min-w-0">
                <p className="wallet-menu-wallet-name">{walletShort}</p>
                <p className="wallet-menu-address">{shortenAddress(address, 6)}</p>
              </div>
            </div>
            <button
              type="button"
              role="menuitem"
              className="wallet-menu-item"
              disabled={isDisconnecting}
              onClick={handleChangeWallet}
            >
              Change wallet
            </button>
            <button
              type="button"
              role="menuitem"
              className="wallet-menu-item wallet-menu-item--danger"
              disabled={isDisconnecting}
              onClick={() => {
                disconnect()
                closeMenu()
              }}
            >
              {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </>
        ) : (
          <>
            <p className="wallet-menu-label">Choose wallet</p>
            {availableConnectors.length === 0 ? (
              <p className="wallet-menu-empty">No wallet detected — install a browser wallet extension</p>
            ) : (
              availableConnectors.map((c) => (
                <button
                  key={c.uid}
                  type="button"
                  role="menuitem"
                  className="wallet-menu-item wallet-menu-item--option"
                  disabled={isConnecting}
                  onClick={() => {
                    reset()
                    connect({ connector: c, chainId: TARGET_CHAIN_ID })
                    closeMenu()
                  }}
                >
                  <span
                    className={`wallet-menu-icon wallet-menu-icon--${getWalletIconClass(c.name)}`}
                    aria-hidden
                  >
                    {getWalletIcon(c.name)}
                  </span>
                  <span>{c.name}</span>
                </button>
              ))
            )}
          </>
        )}
      </WalletMenu>

      {error && (
        <p className="wallet-error" role="alert">
          {error.message.split('\n')[0]}
        </p>
      )}
    </div>
  )
}
