import { formatDuration, formatEth, formatNumber } from '../engine/demoEngine'
import type { ReactorCell } from '../engine/types'
import { CommandPanel } from './CommandPanel'

interface CellTooltipProps {
  cell: ReactorCell
  coreEth: number
  totalChargeScore: number
}

export function CellTooltip({ cell, coreEth, totalChargeScore }: CellTooltipProps) {
  const share = totalChargeScore > 0 ? (cell.chargeScore / totalChargeScore) * coreEth : 0
  const ripeness =
    cell.maturity < 0.3 ? 'Fresh charge' : cell.maturity < 0.65 ? 'Charging' : 'Fully charged'

  return (
    <CommandPanel
      tag={`Fuel cell #${cell.id.replace('cell-', '')}`}
      glow
      className="absolute bottom-4 left-4 right-4 z-10 p-4 sm:left-auto sm:right-4 sm:w-80"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-cyan-400">{cell.address}</div>
        </div>
        {cell.ejected && (
          <span className="rounded bg-meltdown-500/20 px-2 py-0.5 font-mono text-[10px] uppercase text-meltdown-400">
            Ejected
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <TooltipStat label="Balance" value={`${formatNumber(cell.balance)} CORE`} />
        <TooltipStat label="Held" value={formatDuration(cell.heldMs)} />
        <TooltipStat label="Charge ripeness" value={ripeness} />
        <TooltipStat label="Weight" value={`${cell.weight.toFixed(1)}×`} />
        <TooltipStat label="Charge-score" value={formatNumber(cell.chargeScore)} />
        <TooltipStat label="Est. core share" value={`${formatEth(share, 4)} ETH`} />
      </dl>
    </CommandPanel>
  )
}

function TooltipStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="font-mono text-xs font-semibold text-white">{value}</dd>
    </div>
  )
}
