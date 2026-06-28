import { Link } from 'react-router-dom'
import { useReactorOptional } from '../context/ReactorContext'
import { HeroLiveStats } from './HeroLiveStats'

export function Hero() {
  const snapshot = useReactorOptional()?.snapshot

  return (
    <section className="hero-section relative flex min-h-[calc(100dvh-3.25rem)] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
      <div className="hero-stack relative z-10 w-full max-w-2xl text-center">
        <header className="hero-head">
          <p className="eyebrow hero-eyebrow">Uniswap v4 · containment game</p>

          <h1 className="hero-title">
            <span className="block">Charge a cell.</span>
            <span className="hero-title-accent mt-2 block sm:mt-3">Claim the core.</span>
          </h1>

          <p className="hero-lead mx-auto max-w-md">
            Hold the reactor, survive the meltdown, or eject and forfeit your charge.
          </p>
        </header>

        {snapshot && (
          <div className="hero-stats-wrap">
            <HeroLiveStats snapshot={snapshot} />
          </div>
        )}

        <div className="hero-actions">
          <a href="#reactor" className="btn-primary btn-beam">
            Explore reactor
          </a>
          <Link to="/docs" className="btn-secondary">
            Docs
          </Link>
        </div>
      </div>

      <a
        href="#reactor"
        className="scroll-hint absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-cyan-400"
        aria-label="Scroll to reactor"
      >
        <span>Scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10 4v12M10 16l-4-4M10 16l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  )
}
