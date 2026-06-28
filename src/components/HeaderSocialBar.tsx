import { useState } from 'react'
import {
  CORE_CA,
  getCaDisplayLabel,
  isCaDeployed,
  TWITTER_URL,
} from '../config/contract'

export function HeaderSocialBar() {
  const [copied, setCopied] = useState(false)
  const deployed = isCaDeployed()
  const caLabel = getCaDisplayLabel()

  async function handleCopy() {
    if (!deployed) return
    try {
      await navigator.clipboard.writeText(CORE_CA)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="header-social-bar flex shrink-0 items-center gap-1.5 sm:gap-2">
      <a
        href={TWITTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="header-icon-btn"
        aria-label="REACTOR on X"
      >
        <XIcon />
      </a>

      <span
        className="header-ca-pill font-mono"
        data-deployed={deployed ? 'true' : 'false'}
        title={deployed ? CORE_CA : 'Contract address at launch'}
      >
        CA: {caLabel}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!deployed}
        className="header-icon-btn header-icon-btn--copy"
        aria-label={deployed ? 'Copy contract address' : 'Contract address not available yet'}
        title={deployed ? 'Copy contract address' : 'Available at launch'}
      >
        <CopyIcon copied={copied} />
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2"
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
