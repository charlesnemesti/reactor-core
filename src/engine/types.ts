export interface ReactorCell {
  id: string
  address: string
  balance: number
  chargeScore: number
  /** Cosmetic maturity 0–1 — drives cell glow on canvas */
  maturity: number
  heldMs: number
  weight: number
  ejected: boolean
  row: number
  col: number
}

export interface ReactorSnapshot {
  cycle: number
  cells: ReactorCell[]
  coreEth: number
  /** 0–100 percent of S / Smax */
  stability: number
  bufferS: number
  bufferSmax: number
  totalBuysEth: number
  totalSellsEth: number
  meltdownActive: boolean
  meltdownFlash: boolean
  claimableEth: number
  selectedCellId: string | null
  hoveredCellId: string | null
  demoLabel: string
}

export interface DemoEngineConfig {
  cellCount: number
  cols: number
  alpha: number
  gamma: number
  reserveEth: number
}

export type DemoEngineListener = (snapshot: ReactorSnapshot) => void

export interface DemoEngine {
  subscribe: (listener: DemoEngineListener) => () => void
  getSnapshot: () => ReactorSnapshot
  selectCell: (id: string | null) => void
  hoverCell: (id: string | null) => void
  tick: (dtMs: number) => void
  destroy: () => void
}
