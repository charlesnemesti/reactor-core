import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()

  return (
    <header className="header-surface sticky top-0 z-50 border-b border-[var(--border-subtle)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-active)] bg-steel-800">
            <span className="font-mono text-xs font-bold text-cyan-400">RC</span>
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-wide text-white">REACTOR</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-charge-400">
              $CORE
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className={`font-mono text-xs uppercase tracking-wider transition-colors ${
              location.pathname === '/'
                ? 'text-cyan-400'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Reactor
          </Link>
          <Link
            to="/docs"
            className={`font-mono text-xs uppercase tracking-wider transition-colors ${
              location.pathname === '/docs'
                ? 'text-cyan-400'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Docs
          </Link>
          <a href="#buy" className="btn-primary hidden text-[11px] sm:inline-flex">
            Buy CORE
          </a>
        </nav>
      </div>
    </header>
  )
}
