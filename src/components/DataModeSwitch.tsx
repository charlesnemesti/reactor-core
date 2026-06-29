import { useDataModeOptional, type DataMode } from '../context/DataModeContext'

export function DataModeSwitch({ compact = false }: { compact?: boolean }) {
  const ctx = useDataModeOptional()
  if (!ctx?.contractAvailable) return null

  const { dataMode, setDataMode } = ctx
  const activeIdx = dataMode === 'demo' ? 0 : 1

  return (
    <div
      className={`data-mode-switch relative flex items-center rounded-full border border-[var(--border-subtle)] bg-steel-950/80 p-0.5 ${
        compact ? 'shrink-0' : ''
      }`}
      role="group"
      aria-label="Data source"
    >
      <span
        className="data-mode-switch-glider"
        style={{
          width: '50%',
          transform: `translateX(${activeIdx * 100}%)`,
        }}
        aria-hidden
      />
      {(['demo', 'live'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setDataMode(mode)}
          aria-pressed={dataMode === mode}
          className={`data-mode-switch-btn relative z-10 px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors sm:px-2.5 sm:text-[10px] ${
            dataMode === mode ? 'text-steel-950' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          {mode === 'demo' ? 'Demo' : 'Live'}
        </button>
      ))}
    </div>
  )
}

export function dataModeBootMessage(_mode: DataMode, live: boolean): string {
  if (live) return 'Connecting to mainnet…'
  return 'Initializing reactor · demo mode…'
}
