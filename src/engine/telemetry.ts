import { CORE_OVERHEAT_ETH } from '../config/contract'
import { formatEth } from './demoEngine'
import type { ReactorSnapshot } from './types'

export function getLiveTelemetryLines(snapshot: ReactorSnapshot): string[] {
  const loyal = snapshot.cells.filter((c) => !c.ejected).length
  const overheating = snapshot.coreEth >= CORE_OVERHEAT_ETH

  if (snapshot.meltdownActive) {
    return [
      `MELTDOWN ACTIVE · CYCLE ${snapshot.cycle} PAYOUT IN PROGRESS`,
      `CLAIM POOL ${formatEth(snapshot.claimableEth)} ETH · LOYAL CELLS ONLY`,
      `EJECTORS FORFEIT · CHARGE-SCORE PRO-RATA SPLIT`,
    ]
  }

  if (snapshot.meltdownFlash || snapshot.stability < 22) {
    return [
      'CONTAINMENT CRITICAL · BUFFER S NEAR ZERO',
      overheating
        ? `CORE OVERHEAT ${formatEth(snapshot.coreEth)} ETH · BREACH IMMINENT`
        : `STABILITY ${snapshot.stability.toFixed(0)}% · MELTDOWN IMMINENT`,
      'SELL PRESSURE 1.67× BUY LIFT · 60% RULE ACTIVE',
    ]
  }

  if (overheating) {
    return [
      `CORE OVERHEAT ${formatEth(snapshot.coreEth)} ETH · VISUAL WARNING`,
      `STABILITY ${snapshot.stability.toFixed(0)}% · S ${formatEth(snapshot.bufferS, 2)}`,
      `${loyal} ACTIVE RODS · FEES 2% BUY / 3% SELL`,
    ]
  }

  return [
    `STABILITY ${snapshot.stability.toFixed(0)}% · S ${formatEth(snapshot.bufferS, 2)} / ${formatEth(snapshot.bufferSmax, 2)}`,
    `CORE ${formatEth(snapshot.coreEth)} ETH · CYCLE ${snapshot.cycle} · ${loyal} RODS LIVE`,
    `BUYS ${formatEth(snapshot.totalBuysEth)} ETH · SELLS ${formatEth(snapshot.totalSellsEth)} ETH`,
    '1 WALLET = 1 FUEL CELL · CHARGE ACCUMULATING',
  ]
}

export function stabilityTone(stability: number, meltdownActive: boolean): 'nominal' | 'warn' | 'critical' | 'meltdown' {
  if (meltdownActive) return 'meltdown'
  if (stability < 22) return 'critical'
  if (stability < 45) return 'warn'
  return 'nominal'
}
