import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { useReactorToDocsEntry } from '../../context/RouteTransitionContext'
import { isDocsEntryComplete, markDocsEntryComplete } from '../../lib/docsEntryState'
import { MatrixRainCanvas } from '../MatrixRainCanvas'

const LINES = [
  'ROUTE CHANGE DETECTED · / → /docs',
  'DECRYPTING TECHNICAL ARCHIVE…',
  'PARSING CONTAINMENT PROTOCOLS…',
  'ACCESS GRANTED',
]

const LINE_DELAY_MS = 480
const FINAL_LINE_DELAY_MS = 680
const FLASH_HOLD_MS = 320
const GATE_HOLD_MS = 880

type Phase = 'boot' | 'flash' | 'gate' | 'done'

interface DocsEntrySequenceProps {
  children: ReactNode
}

export function DocsEntrySequence({ children }: DocsEntrySequenceProps) {
  const isReactorToDocs = useReactorToDocsEntry()
  const [shouldAnimate] = useState(
    () => isReactorToDocs && !getPrefersReducedMotion() && !isDocsEntryComplete(),
  )
  const skip = !shouldAnimate

  const startedRef = useRef(false)
  const doneRef = useRef(isDocsEntryComplete())
  const [phase, setPhase] = useState<Phase>(() => (skip ? 'done' : 'boot'))
  const [lineIdx, setLineIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [, tick] = useReducer((n) => n + 1, 0)

  const ready = skip || doneRef.current || phase === 'done'
  const showOverlay = shouldAnimate && !ready
  const matrixActive = showOverlay || phase === 'gate'

  useEffect(() => {
    if (skip || startedRef.current) return
    startedRef.current = true
    document.documentElement.classList.add('docs-entry-lock')
    return () => document.documentElement.classList.remove('docs-entry-lock')
  }, [skip])

  useEffect(() => {
    if (skip || phase !== 'boot') return

    if (lineIdx >= LINES.length) {
      const t = window.setTimeout(() => setPhase('flash'), 360)
      return () => window.clearTimeout(t)
    }

    const delay = lineIdx === LINES.length - 1 ? FINAL_LINE_DELAY_MS : LINE_DELAY_MS
    const t = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setProgress(((lineIdx + 1) / LINES.length) * 100)
      tick()
    }, delay)

    return () => window.clearTimeout(t)
  }, [skip, phase, lineIdx])

  useEffect(() => {
    if (skip || phase !== 'flash') return
    const t = window.setTimeout(() => setPhase('gate'), FLASH_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [skip, phase])

  useEffect(() => {
    if (skip || phase !== 'gate') return
    const t = window.setTimeout(() => {
      doneRef.current = true
      markDocsEntryComplete()
      setPhase('done')
      document.documentElement.classList.remove('docs-entry-lock')
    }, GATE_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [skip, phase])

  return (
    <div className="docs-entry-root relative">
      {showOverlay && (
        <div
          className={`docs-entry-overlay ${phase === 'gate' ? 'docs-entry-overlay--open' : ''} ${
            phase === 'flash' ? 'docs-entry-overlay--flash' : ''
          }`}
          aria-hidden
          aria-live="polite"
        >
          <MatrixRainCanvas active={matrixActive} durationMs={5200} className="docs-entry-canvas pointer-events-none absolute inset-0" />

          <div className="docs-entry-grid pointer-events-none absolute inset-0" />

          <div className="docs-entry-shutter docs-entry-shutter--top" />
          <div className="docs-entry-shutter docs-entry-shutter--bottom" />

          {(phase === 'boot' || phase === 'flash') && (
            <div className="docs-entry-panel">
              <span className="command-bracket command-bracket--tl" aria-hidden />
              <span className="command-bracket command-bracket--tr" aria-hidden />
              <span className="command-bracket command-bracket--bl" aria-hidden />
              <span className="command-bracket command-bracket--br" aria-hidden />

              <div className="mb-4 flex items-center gap-2">
                <span className="command-live-dot" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-400">
                  Archive breach
                </span>
              </div>

              <ul className="docs-entry-lines mb-5 min-h-[5.5rem]">
                {LINES.slice(0, lineIdx).map((line, i) => (
                  <li
                    key={line}
                    className={`docs-entry-line font-mono text-xs sm:text-sm ${
                      i === LINES.length - 1 && lineIdx === LINES.length
                        ? 'docs-entry-line--granted text-charge-400'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <span className="text-cyan-400/50">{'> '}</span>
                    {line}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                  <span>Archive sync</span>
                  <span className="text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="boot-progress-track h-1 overflow-hidden rounded-full bg-steel-800">
                  <div
                    className="boot-progress-fill h-full rounded-full bg-gradient-to-r from-charge-500 to-cyan-400 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={`docs-entry-content ${ready ? 'docs-entry-content--ready' : 'docs-entry-content--waiting'} ${
          shouldAnimate && ready ? 'docs-entry-content--animated' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
