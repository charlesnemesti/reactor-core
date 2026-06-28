import { useEffect, useState } from 'react'
import { MatrixRainCanvas } from './MatrixRainCanvas'

const LINES = [
  'INITIALIZING CONTAINMENT FIELD…',
  'LOADING FUEL ROD MATRIX [24×6]…',
  'CALIBRATING BUFFER S / SMAX…',
  'SYNCING CORE ACCUMULATOR…',
  'LINKING v4 FEE HOOK…',
  'REACTOR ONLINE',
]

interface BootSequenceProps {
  onDone: () => void
}

export function BootSequence({ onDone }: BootSequenceProps) {
  const [lineIdx, setLineIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (lineIdx >= LINES.length) {
      const t = window.setTimeout(() => setExiting(true), 520)
      return () => window.clearTimeout(t)
    }

    const t = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setProgress(((lineIdx + 1) / LINES.length) * 100)
    }, lineIdx === LINES.length - 1 ? 720 : 480)

    return () => window.clearTimeout(t)
  }, [lineIdx])

  useEffect(() => {
    if (!exiting) return
    const t = window.setTimeout(onDone, 620)
    return () => window.clearTimeout(t)
  }, [exiting, onDone])

  const isFinal = lineIdx === LINES.length && !exiting

  return (
    <div
      className={`boot-overlay fixed inset-0 z-[100] flex items-center justify-center bg-steel-950/95 backdrop-blur-sm ${
        exiting ? 'boot-overlay--exit' : ''
      }`}
      aria-live="polite"
      aria-label="Reactor boot sequence"
    >
      <MatrixRainCanvas active={!exiting} durationMs={4800} />
      <div className="boot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      <div className="boot-panel relative mx-4 w-full max-w-md overflow-hidden rounded-xl border border-[var(--border-active)] bg-steel-950/90 p-6 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
        <span className="command-bracket command-bracket--tl" aria-hidden />
        <span className="command-bracket command-bracket--tr" aria-hidden />
        <span className="command-bracket command-bracket--bl" aria-hidden />
        <span className="command-bracket command-bracket--br" aria-hidden />
        <div className="command-scanline" aria-hidden />

        <div className="relative z-[1]">
          <div className="mb-5 flex items-center gap-2">
            <span className="command-live-dot" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-400">
              Boot sequence
            </span>
          </div>

          <ul className="mb-6 min-h-[9.5rem] space-y-2 font-mono text-xs sm:text-sm">
            {LINES.slice(0, lineIdx).map((line, i) => (
              <li
                key={line}
                className={`boot-line ${i === LINES.length - 1 && isFinal ? 'boot-line--online text-charge-400' : 'text-[var(--text-muted)]'}`}
              >
                <span className="text-cyan-400/60">{'> '}</span>
                {line}
              </li>
            ))}
            {lineIdx < LINES.length && (
              <li className="boot-cursor font-mono text-xs text-cyan-400/80 sm:text-sm">
                <span className="text-cyan-400/60">{'> '}</span>
                <span className="boot-cursor-bar" aria-hidden />
              </li>
            )}
          </ul>

          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
              <span>System load</span>
              <span className="tabular-nums text-cyan-400">{Math.round(progress)}%</span>
            </div>
            <div className="boot-progress-track h-1 overflow-hidden rounded-full bg-steel-800">
              <div
                className="boot-progress-fill h-full rounded-full bg-gradient-to-r from-charge-500 to-cyan-400 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
