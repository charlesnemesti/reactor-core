import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useReactorOptional } from '../context/ReactorContext'
import { getLiveTelemetryLines } from '../engine/telemetry'
import { BuyCoreButton } from './BuyCoreButton'
import { CommandPanel } from './CommandPanel'
import { ConnectWalletButton } from './ConnectWalletButton'
import { HeaderCoreOrb } from './HeaderCoreOrb'
import { HeaderSocialBar } from './HeaderSocialBar'
import { StabilityMeter } from './StabilityMeter'
import { VisitorCounter } from './VisitorCounter'

const FALLBACK_TELEMETRY = [
  'CONTAINMENT NOMINAL · BUFFER S STABLE',
  'CORE ACCUMULATING · 2% BUY / 3% SELL',
  '60% RULE ENFORCED · EJECTORS FORFEIT',
]

const NAV = [
  { to: '/', label: 'Reactor' },
  { to: '/docs', label: 'Docs' },
] as const

export function Header() {
  const location = useLocation()
  const reactor = useReactorOptional()
  const snapshot = reactor?.snapshot
  const [scrolled, setScrolled] = useState(false)
  const [telemetryIdx, setTelemetryIdx] = useState(0)
  const [clock, setClock] = useState('00:00:00')

  const telemetry = snapshot ? getLiveTelemetryLines(snapshot) : FALLBACK_TELEMETRY

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(
        now.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setTelemetryIdx(0)
  }, [snapshot?.cycle, snapshot?.meltdownActive, snapshot?.meltdownFlash])

  useEffect(() => {
    const id = setInterval(() => setTelemetryIdx((i) => (i + 1) % telemetry.length), 3500)
    return () => clearInterval(id)
  }, [telemetry.length])

  const activeIdx = NAV.findIndex((n) => n.to === location.pathname)
  const headerAlert = snapshot?.meltdownActive || snapshot?.meltdownFlash

  return (
    <header
      className={`header-command sticky top-0 z-50 px-3 pt-3 transition-[padding] duration-500 sm:px-5 ${
        scrolled ? 'header-command--scrolled' : ''
      } ${headerAlert ? 'header-command--alert' : ''}`}
    >
      <CommandPanel
        className={`mx-auto max-w-4xl ${snapshot?.meltdownActive ? 'command-shell--meltdown' : ''}`}
        scanline
        brackets
      >
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
          <Link to="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <HeaderCoreOrb size={scrolled ? 34 : 40} pulse={headerAlert} />
              <span className="header-orb-ring" aria-hidden />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate font-mono text-[13px] font-bold tracking-[0.12em] text-white sm:text-sm">
                REACTOR
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-charge-400 sm:text-[10px]">
                $CORE
                {snapshot && (
                  <span className="ml-2 text-[var(--text-muted)]">· C{snapshot.cycle}</span>
                )}
              </div>
            </div>
          </Link>

          <nav className="header-nav-pill relative flex shrink-0 items-center rounded-full border border-[var(--border-subtle)] bg-steel-950/80 p-0.5">
            {activeIdx >= 0 && (
              <span
                className="header-nav-glider"
                style={{
                  width: `${100 / NAV.length}%`,
                  transform: `translateX(${activeIdx * 100}%)`,
                }}
                aria-hidden
              />
            )}
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`header-nav-link relative z-10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors sm:px-4 sm:text-[11px] ${
                  location.pathname === to
                    ? 'text-steel-950'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <VisitorCounter compact />
            <ConnectWalletButton />
            <HeaderSocialBar />
            <BuyCoreButton compact className="hidden sm:inline-flex" />
          </div>
        </div>

        <div
          className={`header-telemetry overflow-hidden border-t border-[var(--border-subtle)] transition-all duration-500 ${
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
          }`}
        >
          <div className="flex items-center gap-3 px-3 py-1.5 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`command-live-dot shrink-0 ${headerAlert ? 'command-live-dot--alert' : ''}`}
                aria-hidden
              />
              <span
                className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${
                  snapshot?.meltdownActive ? 'text-meltdown-400' : 'text-charge-400'
                }`}
              >
                {snapshot?.meltdownActive ? 'Alert' : 'Live'}
              </span>
              <p
                key={`${telemetryIdx}-${telemetry[telemetryIdx]}`}
                className={`command-telemetry-text truncate font-mono text-[9px] uppercase tracking-wider sm:text-[10px] ${
                  headerAlert ? 'text-meltdown-400/90' : 'text-[var(--text-muted)]'
                }`}
              >
                {telemetry[telemetryIdx]}
              </p>
            </div>

            {snapshot && !scrolled && (
              <div className="hidden w-24 shrink-0 sm:block">
                <StabilityMeter
                  stability={snapshot.stability}
                  meltdownActive={snapshot.meltdownActive}
                  compact
                />
              </div>
            )}

            <time className="shrink-0 font-mono text-[9px] tabular-nums text-cyan-400/80 sm:text-[10px]">
              {clock}
            </time>
          </div>
        </div>
      </CommandPanel>
    </header>
  )
}
