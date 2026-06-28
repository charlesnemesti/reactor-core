import { useEffect, useRef, useState } from 'react'
import type { ReactorSnapshot } from '../engine/types'
import { CommandPanel } from './CommandPanel'
import { FuelRodCell } from './FuelRodCell'

const COLS = 6
const PAD = 16
const GAP = 10
const MIN_CELL_W = 44
const MAX_CELL_W = 96
const CELL_ASPECT = 1.45

interface GridDims {
  cellW: number
  cellH: number
}

interface ReactorGridProps {
  snapshot: ReactorSnapshot
  onSelectCell: (id: string | null) => void
  onHoverCell: (id: string | null) => void
  onNextPage: () => void
}

export function ReactorGrid({
  snapshot,
  onSelectCell,
  onHoverCell,
  onNextPage,
}: ReactorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<GridDims>({ cellW: 56, cellH: 81 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const available = el.clientWidth - 16
      const cellW = Math.floor((available - PAD * 2 - (COLS - 1) * GAP) / COLS)
      const clamped = Math.max(MIN_CELL_W, Math.min(MAX_CELL_W, cellW))
      setDims({ cellW: clamped, cellH: Math.round(clamped * CELL_ASPECT) })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const gridWidth = COLS * dims.cellW + (COLS - 1) * GAP

  return (
    <div ref={containerRef} className="w-full">
      <CommandPanel brackets scanline={false} className="w-full p-2">
      <div
        className="grid-scanlines mx-auto rounded-lg bg-[rgba(10,14,20,0.6)]"
        style={{
          width: gridWidth + PAD * 2,
          maxWidth: '100%',
          padding: PAD,
        }}
      >
        <div
          className="mx-auto grid"
          style={{
            width: gridWidth,
            gridTemplateColumns: `repeat(${COLS}, ${dims.cellW}px)`,
            gap: GAP,
          }}
        >
          {snapshot.cells.map((cell) => (
            <FuelRodCell
              key={cell.id}
              cell={cell}
              width={dims.cellW}
              height={dims.cellH}
              selected={snapshot.selectedCellId === cell.id}
              hovered={snapshot.hoveredCellId === cell.id}
              meltdown={snapshot.meltdownActive}
              onSelect={() =>
                onSelectCell(snapshot.selectedCellId === cell.id ? null : cell.id)
              }
              onHover={(active) => onHoverCell(active ? cell.id : null)}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 px-2 pb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          Page {snapshot.gridPage + 1} · {snapshot.cells.length} rods
        </span>
        <button type="button" className="btn-secondary !py-2 !text-[11px]" onClick={onNextPage}>
          Next page →
        </button>
      </div>
      </CommandPanel>
    </div>
  )
}
