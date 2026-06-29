import { useState } from 'react'
import {
  CORE_CA,
  ETHERSCAN_TOKEN_URL,
  getCaDisplayLabel,
  isCaDeployed,
  TOKEN_SYMBOL,
} from '../config/contract'

export function FixedCaDock() {
  const [copied, setCopied] = useState(false)
  const deployed = isCaDeployed()
  const caLabel = getCaDisplayLabel()

  async function handleCopy() {
    if (!deployed) return
    try {
      await navigator.clipboard.writeText(CORE_CA)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside
      className={`ca-dock fixed z-[45] ${deployed ? 'ca-dock--live' : 'ca-dock--tba'}`}
      aria-label="Contract address"
    >
      <div className="ca-dock-beam" aria-hidden />
      <div className="ca-dock-panel">
        <span className="ca-dock-pulse command-live-dot" aria-hidden />
        <div className="ca-dock-body">
          <div className="ca-dock-meta">
            <span className="ca-dock-tag">Contract</span>
            <span className="ca-dock-symbol">${TOKEN_SYMBOL}</span>
          </div>

          {deployed ? (
            <a
              href={ETHERSCAN_TOKEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ca-dock-address"
              title={CORE_CA}
            >
              <span className="ca-dock-prefix">CA</span>
              <code>{caLabel}</code>
            </a>
          ) : (
            <div className="ca-dock-address ca-dock-address--static" title="To be announced at launch">
              <span className="ca-dock-prefix">CA</span>
              <code>{caLabel}</code>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!deployed}
            className={`ca-dock-copy ${copied ? 'ca-dock-copy--done' : ''}`}
            aria-label={deployed ? 'Copy contract address' : 'Contract address not available yet'}
          >
            <CopyIcon copied={copied} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}
