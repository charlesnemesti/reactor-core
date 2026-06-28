import { useVisitorCount } from '../hooks/useVisitorCount'

interface VisitorCounterProps {
  compact?: boolean
}

export function VisitorCounter({ compact = false }: VisitorCounterProps) {
  const count = useVisitorCount()

  if (compact) {
    return (
      <span
        className="visitor-counter visitor-counter--compact inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] sm:text-[10px]"
        title="Live visitors on site"
      >
        <span className="command-live-dot shrink-0" aria-hidden />
        <span className="text-cyan-400/80">{count}</span>
        <span>online</span>
      </span>
    )
  }

  return (
    <div
      className="visitor-counter inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-steel-950/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
      title="Live visitors on site"
    >
      <span className="command-live-dot shrink-0" aria-hidden />
      <span className="text-[var(--text-muted)]">Visitors</span>
      <span className="visitor-counter-value tabular-nums text-cyan-400">{count}</span>
      <span className="text-[var(--text-muted)]">live</span>
    </div>
  )
}
