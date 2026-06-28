import type { ElementType, ReactNode } from 'react'

interface CommandPanelProps {
  children: ReactNode
  className?: string
  /** Upper telemetry strip label */
  tag?: string
  glow?: boolean
  scanline?: boolean
  brackets?: boolean
  as?: ElementType
}

export function CommandPanel({
  children,
  className = '',
  tag,
  glow = false,
  scanline = true,
  brackets = true,
  as: Component = 'div',
}: CommandPanelProps) {
  return (
    <Component
      className={`command-shell relative overflow-hidden ${glow ? 'command-shell--glow' : ''} ${className}`}
    >
      {brackets && (
        <>
          <span className="command-bracket command-bracket--tl" aria-hidden />
          <span className="command-bracket command-bracket--tr" aria-hidden />
          <span className="command-bracket command-bracket--bl" aria-hidden />
          <span className="command-bracket command-bracket--br" aria-hidden />
        </>
      )}
      {scanline && <div className="command-scanline" aria-hidden />}
      {tag && (
        <div className="command-tag flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-1.5 sm:px-4">
          <span className="command-live-dot shrink-0" aria-hidden />
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {tag}
          </span>
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </Component>
  )
}

interface CommandSectionHeadProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
  /** Text sits on background — stronger contrast */
  exposed?: boolean
}

export function CommandSectionHead({
  eyebrow,
  title,
  description,
  className = '',
  exposed = false,
}: CommandSectionHeadProps) {
  return (
    <div className={`command-section-head ${exposed ? 'command-section-head--exposed' : ''} ${className}`}>
      <div className="mb-2 flex items-center gap-3">
        <span className="command-live-dot shrink-0" aria-hidden />
        <p className={`eyebrow mb-0 ${exposed ? 'text-exposed-eyebrow' : ''}`}>{eyebrow}</p>
        <span className="command-section-line hidden flex-1 sm:block" aria-hidden />
      </div>
      <h2 className={`section-title ${exposed ? 'text-exposed-title' : 'text-white'}`}>{title}</h2>
      {description && (
        <p className={`mt-3 max-w-2xl ${exposed ? 'text-exposed-muted' : 'text-[var(--text-muted)]'}`}>
          {description}
        </p>
      )}
    </div>
  )
}
