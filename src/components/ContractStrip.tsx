import { useState } from 'react'
import { CORE_CA, LAUNCH_MESSAGE, TOKEN_SYMBOL, shortenAddress } from '../config/contract'

export function ContractStrip() {
  const [copied, setCopied] = useState(false)
  const shortAddress = shortenAddress(CORE_CA, 6)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CORE_CA)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="panel panel-glow w-full p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="eyebrow">Contract</div>
        <span className="shrink-0 rounded-full border border-[var(--border-subtle)] bg-steel-800/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {LAUNCH_MESSAGE}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <code
              className="truncate font-mono text-sm text-white sm:text-base"
              title={CORE_CA}
            >
              {shortAddress}
            </code>
            <span className="shrink-0 rounded border border-charge-500/30 bg-charge-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-charge-400">
              {'$'}{TOKEN_SYMBOL}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-[var(--text-muted)]">
            Mainnet address · placeholder until deploy
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="btn-secondary shrink-0 text-[11px]"
          aria-label="Copy contract address"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
