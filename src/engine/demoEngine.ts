import {
  BETA_MULTIPLIER,
  CORE_OVERHEAT_ETH,
  THETA_SMAX,
} from '../config/contract'
import type {
  DemoEngine,
  DemoEngineConfig,
  DemoEngineListener,
  ReactorCell,
  ReactorSnapshot,
} from './types'

/** Seed aligned with on-chain fields: jarEth, strengthNow (S/Smax), round, trade volume */
export const DEMO_CONTRACT_BASELINE = {
  reserveEth: 0.36,
  bufferFill: 0.76,
  coreEth: 0.031,
  cycle: 3,
  cellCount: 20,
  totalBuysEth: 0.287,
  totalSellsEth: 0.198,
} as const

const DEFAULT_CONFIG: DemoEngineConfig = {
  cellCount: DEMO_CONTRACT_BASELINE.cellCount,
  cols: 6,
  alpha: 0.18,
  gamma: 0.0008,
  reserveEth: DEMO_CONTRACT_BASELINE.reserveEth,
}

/** Simulated cycle buy/sell volume band shown in live telemetry */
const DEMO_VOLUME_MIN = 0.15
const DEMO_VOLUME_MAX = 0.534

function randomVolume(): number {
  return DEMO_VOLUME_MIN + Math.random() * (DEMO_VOLUME_MAX - DEMO_VOLUME_MIN)
}

function addTradeVolume(current: number): number {
  const delta = 0.001 + Math.random() * 0.004
  let next = current + delta
  if (next > DEMO_VOLUME_MAX) {
    next = randomVolume()
  }
  return next
}

function randomHex(seed: number): string {
  const chars = '0123456789abcdef'
  let out = '0x'
  for (let i = 0; i < 40; i++) {
    out += chars[(seed * 17 + i * 13) % 16]
  }
  return out
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function createCells(count: number, cols: number, pageSeed = 0): ReactorCell[] {
  const cells: ReactorCell[] = []

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const seed = pageSeed * 997 + i * 13 + 1
    const address = randomHex(seed)
    const balance = 800 + ((seed * 137) % 4200) + Math.random() * 600
    cells.push({
      id: `cell-p${pageSeed}-${i}`,
      address: shortenAddress(address),
      balance,
      chargeScore: balance * (20 + (seed % 40)),
      maturity: 0.12 + Math.random() * 0.78,
      heldMs: 60_000 + seed * 1200 + Math.random() * 40_000,
      weight: seed % 17 === 0 ? 0.1 : 1.0,
      ejected: Math.random() < 0.08,
      row,
      col,
    })
  }

  return cells
}

export function createDemoEngine(
  partialConfig: Partial<DemoEngineConfig> = {},
): DemoEngine {
  const config = { ...DEFAULT_CONFIG, ...partialConfig }
  const beta = config.alpha * BETA_MULTIPLIER
  let bufferSmax = THETA_SMAX * config.reserveEth
  let bufferS = bufferSmax * DEMO_CONTRACT_BASELINE.bufferFill
  let coreEth = DEMO_CONTRACT_BASELINE.coreEth
  let cycle = DEMO_CONTRACT_BASELINE.cycle
  let totalBuysEth: number = DEMO_CONTRACT_BASELINE.totalBuysEth
  let totalSellsEth: number = DEMO_CONTRACT_BASELINE.totalSellsEth
  let meltdownActive = false
  let meltdownFlash = false
  let meltdownTimer = 0
  let claimableEth = 0
  let tradeTimer = 0
  let selectedCellId: string | null = null
  let hoveredCellId: string | null = null
  let gridPage = 0

  let cells = createCells(config.cellCount, config.cols, gridPage)
  const listeners = new Set<DemoEngineListener>()

  function emit() {
    const snapshot = getSnapshot()
    listeners.forEach((l) => l(snapshot))
  }

  function getSnapshot(): ReactorSnapshot {
    const stability = bufferSmax > 0 ? (bufferS / bufferSmax) * 100 : 0
    return {
      cycle,
      cells,
      coreEth,
      stability: Math.max(0, Math.min(100, stability)),
      bufferS,
      bufferSmax,
      totalBuysEth,
      totalSellsEth,
      meltdownActive,
      meltdownFlash,
      claimableEth,
      selectedCellId,
      hoveredCellId,
      gridPage,
      demoLabel: `demo · simulated · ${config.cellCount} rods · page ${gridPage + 1} · cycle ${cycle}`,
    }
  }

  function resetCycle() {
    cycle += 1
    config.reserveEth = 0.32 + Math.random() * 0.18
    bufferSmax = THETA_SMAX * config.reserveEth
    bufferS = bufferSmax * (0.65 + Math.random() * 0.25)
    coreEth = 0.012 + Math.random() * 0.028
    totalBuysEth = randomVolume()
    totalSellsEth = randomVolume()
    meltdownActive = false
    meltdownFlash = false
    claimableEth = 0

    cells = createCells(config.cellCount, config.cols, gridPage).map((cell, i) => {
      const prev = cells[i]
      if (!prev || prev.ejected) return cell
      return {
        ...cell,
        weight: 0.1,
        chargeScore: prev.chargeScore * 0.12,
        maturity: 0.2,
        heldMs: 0,
        ejected: false,
      }
    })
  }

  function triggerMeltdown() {
    meltdownActive = true
    meltdownFlash = true
    meltdownTimer = 2800

    const loyal = cells.filter((c) => !c.ejected)
    const totalScore = loyal.reduce((sum, c) => sum + c.chargeScore, 0)
    claimableEth = coreEth * 0.92

    if (totalScore > 0) {
      cells = cells.map((cell) => {
        if (cell.ejected) return { ...cell, chargeScore: 0, maturity: 0.05 }
        const share = cell.chargeScore / totalScore
        return {
          ...cell,
          maturity: Math.min(1, cell.maturity + share * 0.3),
        }
      })
    }

    coreEth = coreEth * 0.04
    bufferS = 0
  }

  function simulateTrade() {
    const isBuy = Math.random() > 0.38
    const ethAmount = 0.002 + Math.random() * 0.008

    if (isBuy) {
      totalBuysEth = addTradeVolume(totalBuysEth)
      coreEth += ethAmount * 0.02
      bufferS = Math.min(bufferSmax, bufferS + config.alpha * ethAmount)

      const idx = Math.floor(Math.random() * cells.length)
      cells = cells.map((cell, i) => {
        if (i !== idx || cell.ejected) return cell
        const added = 120 + Math.random() * 280
        return {
          ...cell,
          balance: cell.balance + added,
          ejected: false,
          weight: cell.weight < 1 ? (Math.random() > 0.4 ? 1.0 : 0.1) : cell.weight,
        }
      })
    } else {
      totalSellsEth = addTradeVolume(totalSellsEth)
      coreEth += ethAmount * 0.03
      bufferS = Math.max(0, bufferS - beta * ethAmount)

      const idx = Math.floor(Math.random() * cells.length)
      cells = cells.map((cell, i) => {
        if (i !== idx) return cell
        const soldFraction = 0.25 + Math.random() * 0.55
        const newBalance = cell.balance * (1 - soldFraction)
        return {
          ...cell,
          balance: newBalance,
          chargeScore: cell.chargeScore * (1 - soldFraction),
          maturity: Math.max(0.05, cell.maturity * (1 - soldFraction)),
          ejected: soldFraction > 0.65,
        }
      })
    }
  }

  function tick(dtMs: number) {
    const dtSec = dtMs / 1000

    if (meltdownActive) {
      meltdownTimer -= dtMs
      if (meltdownTimer <= 0) {
        resetCycle()
      }
      emit()
      return
    }

    // gravity bleed
    bufferS = Math.max(0, bufferS - config.gamma * dtSec * bufferSmax)

    // charge accumulation
    cells = cells.map((cell) => {
      if (cell.ejected) return cell
      const scoreDelta = cell.balance * cell.weight * dtSec * 0.35
      const maturityDelta = dtSec * 0.004 * cell.weight
      return {
        ...cell,
        chargeScore: cell.chargeScore + scoreDelta,
        maturity: Math.min(1, cell.maturity + maturityDelta),
        heldMs: cell.heldMs + dtMs,
      }
    })

    tradeTimer += dtMs
    if (tradeTimer > 900) {
      tradeTimer = 0
      simulateTrade()
    }

    if (bufferS <= 0) {
      triggerMeltdown()
    }

    meltdownFlash = coreEth >= CORE_OVERHEAT_ETH && bufferS / bufferSmax < 0.35

    emit()
  }

  function subscribe(listener: DemoEngineListener) {
    listeners.add(listener)
    listener(getSnapshot())
    return () => listeners.delete(listener)
  }

  return {
    subscribe,
    getSnapshot,
    selectCell(id) {
      selectedCellId = id
      emit()
    },
    hoverCell(id) {
      hoveredCellId = id
      emit()
    },
    nextPage() {
      gridPage += 1
      selectedCellId = null
      hoveredCellId = null
      cells = createCells(config.cellCount, config.cols, gridPage)
      emit()
    },
    tick,
    destroy() {
      listeners.clear()
    },
  }
}

/** Demo wallet stats for the reward panel */
export function getDemoWalletStats(snapshot: ReactorSnapshot) {
  const cell = snapshot.cells[3] ?? snapshot.cells[0]
  if (!cell) {
    return { balance: 0, chargeScore: 0, estShare: 0, claimableEth: 0 }
  }

  const loyal = snapshot.cells.filter((c) => !c.ejected)
  const totalScore = loyal.reduce((sum, c) => sum + c.chargeScore, 0)
  const estShare = totalScore > 0 ? (cell.chargeScore / totalScore) * snapshot.coreEth : 0

  return {
    balance: cell.balance,
    chargeScore: cell.chargeScore,
    estShare,
    claimableEth: snapshot.meltdownActive ? snapshot.claimableEth * 0.04 : 0,
  }
}

/** 60% rule helper for docs */
export function collapseThresholdExample(buysEth: number): number {
  return buysEth * (1 / BETA_MULTIPLIER)
}

export function formatEth(value: number, digits = 3): string {
  return value.toFixed(digits)
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000)
  const mins = Math.floor((ms % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
