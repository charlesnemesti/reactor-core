import { Link } from 'react-router-dom'

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
    <section className="page-shell py-12 sm:py-16">
      <div className="content-block p-5 sm:p-6 lg:p-8">
        <p className="eyebrow mb-2">How it works</p>
        <h2 className="section-title mb-3 text-white">Mechanics</h2>
        <p className="mb-10 max-w-2xl text-[var(--text-muted)]">
          The full loop — buffer math, the 60% rule, charge-score and payouts.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <article key={step.num} className="panel panel-glow p-5">
              <div className="mb-3 font-mono text-sm font-bold text-cyan-400">{step.num}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{step.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Read the full breakdown in the{' '}
          <Link to="/docs" className="text-cyan-400 underline-offset-2 hover:underline">
            docs
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
