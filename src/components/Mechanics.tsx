import { Link } from 'react-router-dom'
import { BuyCoreButton } from './BuyCoreButton'
import { CommandPanel, CommandSectionHead } from './CommandPanel'
import { ConnectWalletButton } from './ConnectWalletButton'
import { isCaDeployed } from '../config/contract'

const STEPS = [
  {
    num: '01',
    title: 'Insert',
    body: 'Your first buy mints a fuel cell. Hold it and the charge inside builds over time, raising your score.',
  },
  {
    num: '02',
    title: 'Collection',
    body: 'Every buy and sell drips a fee — 2% / 3%, taken in ETH — into the shared core.',
  },
  {
    num: '03',
    title: 'Meltdown',
    body: 'Sells drain a hidden buffer 1.67× harder than buys lift it. At zero the reactor melts down.',
  },
  {
    num: '04',
    title: 'Survival',
    body: 'Loyal cells split the core by charge-score. Ejectors forfeit — they walk away with nothing.',
  },
]

export function Mechanics() {
  return (
    <section className="page-shell py-20 sm:py-28">
      <CommandPanel tag="How it works" className="p-5 sm:p-6 lg:p-8">
        <CommandSectionHead
          className="mb-10"
          eyebrow="Mechanics"
          title="The containment loop"
          description="The full loop — buffer math, the 60% rule, charge-score and payouts."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <CommandPanel key={step.num} tag={step.num} scanline={false} className="p-5">
              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{step.body}</p>
            </CommandPanel>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Read the full breakdown in the{' '}
          <Link to="/docs" className="text-cyan-400 underline-offset-2 hover:underline">
            docs
          </Link>
          .
        </p>

        {isCaDeployed() && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-6">
            <ConnectWalletButton />
            <BuyCoreButton />
          </div>
        )}
      </CommandPanel>
    </section>
  )
}
