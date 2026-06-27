import { Link } from 'react-router-dom'
import { ContractStrip } from './ContractStrip'

export function Hero() {
  return (
    <section className="page-shell relative pt-6 pb-4 sm:pt-10 sm:pb-6">
      <div className="content-block p-5 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">Uniswap v4 · containment game</p>
            <h1 className="section-title mb-4 text-left text-white">
              Charge a cell.
              <br />
              <span className="bg-gradient-to-r from-charge-400 to-cyan-400 bg-clip-text text-transparent">
                Claim the core.
              </span>
            </h1>
            <p className="mb-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Every holder is a fuel cell in the reactor. Trades drip fees into the shared core.
              When sell pressure breaches containment, loyal cells split the pot — ejectors forfeit
              their charge.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a href="#buy" className="btn-primary">
                Buy CORE
              </a>
              <Link to="/docs" className="btn-secondary">
                Docs
              </Link>
            </div>
          </div>

          <div className="w-full lg:justify-self-end">
            <ContractStrip />
          </div>
        </div>
      </div>
    </section>
  )
}
