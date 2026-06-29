import { useState } from 'react'
import { getDataModeLabel, useDataMode } from '../context/DataModeContext'
import {
  CORE_CA,
  getCaDisplayLabel,
  isCaDeployed,
  TOKEN_SYMBOL,
  TWITTER_URL,
} from '../config/contract'
import { CommandPanel } from './CommandPanel'

export function ContractStrip() {
  const [copied, setCopied] = useState(false)
  const deployed = isCaDeployed()
  const caLabel = getCaDisplayLabel()
  const { dataMode, contractAvailable } = useDataMode()
  const modeLabel = getDataModeLabel(dataMode, contractAvailable)

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
    <CommandPanel tag="Contract" glow className="w-full p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <a
          href={TWITTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="header-icon-btn !h-8 !px-2.5"
          aria-label="REACTOR on X"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-[10px]">X</span>
        </a>
        <span className="shrink-0 rounded-full border border-[var(--border-subtle)] bg-steel-800/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {modeLabel}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              CA:
            </span>
            <code
              className="truncate font-mono text-sm text-white sm:text-base"
              title={deployed ? CORE_CA : 'To be announced at launch'}
            >
              {caLabel}
            </code>
            <span className="shrink-0 rounded border border-charge-500/30 bg-charge-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-charge-400">
              {'$'}{TOKEN_SYMBOL}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-[var(--text-muted)]">
            {deployed ? 'Mainnet contract address' : 'Mainnet address · TBA at launch'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!deployed}
          className="btn-secondary shrink-0 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={deployed ? 'Copy contract address' : 'Contract address not available yet'}
        >
          {copied ? 'Copied' : 'Copy CA'}
        </button>
      </div>
    </CommandPanel>
  )
}
