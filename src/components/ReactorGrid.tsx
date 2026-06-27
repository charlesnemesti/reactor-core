import { useEffect, useRef, useState } from 'react'
import type { ReactorSnapshot } from '../engine/types'
import { ReactorCellVisual } from './ReactorCellVisual'

const COLS = 12
const PAD = 16
const GAP = 6
const MIN_CELL_W = 28
const MAX_CELL_W = 58
const CELL_ASPECT = 36 / 28

interface GridDims {
  cellW: number
  cellH: number
}

interface ReactorGridProps {
  snapshot: ReactorSnapshot
  onSelectCell: (id: string | null) => void
  onHoverCell: (id: string | null) => void
}

export function ReactorGrid({ snapshot, onSelectCell, onHoverCell }: ReactorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<GridDims>({ cellW: 28, cellH: 36 })

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
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[rgba(6,8,12,0.75)] p-2 backdrop-blur-md"
    >
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
            <ReactorCellVisual
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
    </div>
  )
}
