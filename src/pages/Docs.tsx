import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BETA_MULTIPLIER,
  BUY_FEE_BPS,
  FRESH_WEIGHT,
  REENGAGEMENT_THRESHOLD,
  SELL_FEE_BPS,
  SETTLE_TIP_BPS,
  SURVIVOR_WEIGHT,
  THETA_SMAX,
  TOKEN_INITIAL_SUPPLY,
} from '../config/contract'
import { CommandPanel, CommandSectionHead } from '../components/CommandPanel'
import { DocsEntrySequence } from '../components/docs/DocsEntrySequence'
import { LiveReactorPeek } from '../components/LiveReactorPeek'
import { collapseThresholdExample } from '../engine/demoEngine'

const PARAMS = [
  { param: 'Supply', value: '1,000,000', note: 'fixed, immutable, no mint' },
  { param: 'Launch', value: 'single-sided', note: 'token-only LP, ETH≈0 at go-live, LP burned' },
  { param: 'Buy tax', value: `${BUY_FEE_BPS / 100}%`, note: 'ETH → core' },
  { param: 'Sell tax', value: `${SELL_FEE_BPS / 100}%`, note: 'ETH → core' },
  { param: 'β', value: `${BETA_MULTIPLIER} · α`, note: 'sell drains buffer 1.67× harder → 60% rule' },
  { param: 'θ (Smax)', value: String(THETA_SMAX), note: 'Smax = θ · reserve, recalculated each cycle at settle' },
  { param: 'chargeᵢ', value: '∫ w·balance dt', note: 'time-weighted; μ is cosmetic only' },
  {
    param: 'Weight wᵢ',
    value: `${FRESH_WEIGHT} / ${SURVIVOR_WEIGHT}`,
    note: `fresh ${FRESH_WEIGHT}×; survivors ${SURVIVOR_WEIGHT}× until they buy ≥${REENGAGEMENT_THRESHOLD * 100}%`,
  },
  { param: 'Core cap', value: 'none', note: 'grows until meltdown' },
  { param: 'Per-wallet cap', value: 'none', note: 'pure pro-rata by charge-score' },
  { param: 'Claim', value: 'pull, windowed', note: 'unclaimed recycles into the core' },
  { param: 'Settle', value: 'keeperless', note: `public, ${SETTLE_TIP_BPS / 100}% tip to the caller` },
]

export function DocsPage() {
  const exampleBuys = 5
  const exampleSells = collapseThresholdExample(exampleBuys)

  return (
    <DocsEntrySequence>
      <div className="page-shell py-12 sm:py-16">
        <CommandPanel tag="Documentation" className="docs-main-panel mx-auto max-w-4xl p-5 sm:p-6 lg:p-8">
          <Link
            to="/"
            className="docs-stagger-item docs-stagger-item--0 mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-400 hover:text-white"
          >
            <span aria-hidden>←</span> Back to reactor
          </Link>

          <CommandSectionHead
            className="docs-stagger-item docs-stagger-item--1 mb-8"
            eyebrow="Reference"
            title="REACTOR — docs"
            description="Target v1 mechanic. Exact α / γ values and the cycle-1 Smax bootstrap are finalized at implementation."
          />

          <div className="docs-stagger-item docs-stagger-item--2">
            <LiveReactorPeek />
          </div>

          <div className="docs-sections">
            <DocSection id="overview" num="01" title="Overview" index={0}>
          <p>
            The reactor lives in cycles, and every cycle runs the same loop: a new holder inserts a
            fuel cell → the charge inside it builds → each trade drips a fee into the core → sells
            pile up until they breach containment → the core is paid out to the loyal → the grid
            reseeds and the loop repeats.
          </p>
          <ul className="mt-4 list-none space-y-1 font-mono text-xs text-charge-400">
            <li>fixed supply {TOKEN_INITIAL_SUPPLY.toLocaleString('en-US')}</li>
            <li>fair launch</li>
            <li>immutable</li>
            <li>no team allocation</li>
            <li>LP burned</li>
          </ul>
        </DocSection>

            <DocSection id="cells" num="02" title="Cells & charge" index={1}>
          <p>
            One wallet is one fuel cell. Your first purchase mints a cell in the grid. The longer
            you hold, the deeper its charge — your share of the core is set by your charge-score,
            the time-weighted integral of your balance:
          </p>
          <Formula>chargeᵢ = ∫ wᵢ · balanceᵢ · dt</Formula>
          <p>
            Hold longer and bigger → higher score. Charge-score is computed lazily at claim time, so
            holding costs no gas.
          </p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            On the site this is visual: the cell physically grows and brightens. The maturity curve
            μ only drives that on-screen look — it is not part of the payout math, which keeps the
            contract lean.
          </p>
        </DocSection>

            <DocSection id="core" num="03" title="The core" index={2}>
          <p>
            Every trade pays a fee, taken in ETH, straight into the shared core:
          </p>
          <Formula>
            {BUY_FEE_BPS / 100}% on every buy · {SELL_FEE_BPS / 100}% on every sell → the core
          </Formula>
          <p>
            Collected in ETH via the v4 hook. The core has no cap — whatever drips in stays in until
            the reactor melts down.
          </p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            The core only ever pays out at a meltdown. While it fills, nothing is claimable yet. Past
            1 ETH the core on the site starts to overheat — a purely cosmetic “meltdown is near”
            signal.
          </p>
        </DocSection>

            <DocSection id="buffer" num="04" title="Buffer & the 60% rule" index={3}>
          <p>
            The reactor&apos;s strength is a hidden buffer <em>S</em>. Buys push it up, sells pull
            it down — harder — and a slow “gravity” bleeds it over time. When <em>S</em> hits zero,
            the reactor melts down.
          </p>
          <Formula>S += α · buyETH</Formula>
          <Formula>S −= β · sellETH (β = {BETA_MULTIPLIER} · α)</Formula>
          <Formula>S −= γ · Δt</Formula>
          <p className="mt-4">
            The β = {BETA_MULTIPLIER}·α calibration is what produces the 60% rule.
          </p>

          <CommandPanel tag="Worked example" scanline={false} className="mt-6 p-5">
            <dl className="space-y-2 font-mono text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Cycle buys</dt>
                <dd className="text-white">{exampleBuys} ETH</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Sells needed to meltdown</dt>
                <dd className="text-white">{exampleSells.toFixed(2)} ETH</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--border-subtle)] pt-2">
                <dt className="text-[var(--text-muted)]">Ratio</dt>
                <dd className="text-charge-400">≈ 60% of cycle buys → meltdown</dd>
              </div>
            </dl>
          </CommandPanel>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            The threshold Smax = θ · pool reserve is recalculated once per cycle at settle, because
            a single-sided launch starts with almost no ETH in the pool — a fixed value baked in at
            go-live wouldn&apos;t hold.
          </p>
        </DocSection>

            <DocSection id="meltdown" num="05" title="Meltdown & payout" index={4}>
          <p>
            At a meltdown the core is divided among the loyal cells, strictly in proportion to
            charge-score, with no per-wallet cap:
          </p>
          <Formula>your share = chargeᵢ / Σ charge</Formula>
          <p className="mt-4">
            Ejectors forfeit. When you sell, your stored charge is cut by the fraction you sold, so
            you arrive at the meltdown with less — or nothing. Claiming is pull-based: take your
            share whenever you like inside the claim window. Settlement is keeperless — anyone can
            trigger it for a {SETTLE_TIP_BPS / 100}% tip — and any unclaimed ETH recycles back into
            the core.
          </p>
        </DocSection>

            <DocSection id="reengagement" num="06" title="Re-engagement" index={5}>
          <p>
            To stop “passive seniority” — buy once, sit forever, keep earning — survivors carry into
            the next cycle at a {SURVIVOR_WEIGHT}× weight, ten times lighter than a fresh buyer. To
            restore the full {FRESH_WEIGHT}×, buy at least {REENGAGEMENT_THRESHOLD * 100}% of your
            cycle-start balance. New wallets are {FRESH_WEIGHT}× automatically.
          </p>
          <Formula>
            wᵢ = {FRESH_WEIGHT} if cumBuysᵢ(cycle) ≥ {REENGAGEMENT_THRESHOLD} · balanceAtCycleStartᵢ
            else {SURVIVOR_WEIGHT}
          </Formula>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            The flip is O(1) on-chain. It keeps REACTOR&apos;s core idea intact: the protocol
            rewards active play and positioning, never just sitting still.
          </p>
        </DocSection>

            <DocSection id="parameters" num="07" title="Parameters" index={6}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Parameter
                  </th>
                  <th className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Value
                  </th>
                  <th className="py-3 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {PARAMS.map((row) => (
                  <tr key={row.param} className="border-b border-[var(--border-subtle)]/60">
                    <td className="py-3 pr-4 font-mono text-cyan-400">{row.param}</td>
                    <td className="py-3 pr-4 text-white">{row.value}</td>
                    <td className="py-3 text-[var(--text-muted)]">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </DocSection>
          </div>
        </CommandPanel>
      </div>
    </DocsEntrySequence>
  )
}

function DocSection({
  id,
  num,
  title,
  index,
  children,
}: {
  id: string
  num: string
  title: string
  index: number
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={`docs-stagger-section docs-stagger-section--${index} mb-14 scroll-mt-24`}
      style={{ '--section-i': index } as CSSProperties}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="command-live-dot shrink-0" aria-hidden />
        <p className="eyebrow mb-0">{num}</p>
        <span className="command-section-line hidden flex-1 sm:block" aria-hidden />
      </div>
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      <div className="space-y-4 leading-relaxed text-[var(--text-muted)]">{children}</div>
    </section>
  )
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <CommandPanel scanline={false} brackets={false} className="my-4 px-4 py-3">
      <div className="font-mono text-sm text-charge-400">{children}</div>
    </CommandPanel>
  )
}
