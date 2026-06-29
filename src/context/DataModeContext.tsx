import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isCaDeployed } from '../config/contract'

export type DataMode = 'demo' | 'live'

const STORAGE_KEY = 'reactor-data-mode'

interface DataModeContextValue {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  /** True when user selected live and a contract address is configured */
  isLiveDataMode: boolean
  contractAvailable: boolean
}

const DataModeContext = createContext<DataModeContextValue | null>(null)

function readStoredMode(contractAvailable: boolean): DataMode {
  if (!contractAvailable) return 'demo'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'live') return 'live'
  } catch {
    /* ignore */
  }
  return 'demo'
}

export function DataModeProvider({ children }: { children: ReactNode }) {
  const contractAvailable = isCaDeployed()
  const [dataMode, setDataModeState] = useState<DataMode>(() => readStoredMode(contractAvailable))

  const setDataMode = useCallback(
    (mode: DataMode) => {
      if (mode === 'live' && !contractAvailable) return
      setDataModeState(mode)
      try {
        localStorage.setItem(STORAGE_KEY, mode)
      } catch {
        /* ignore */
      }
    },
    [contractAvailable],
  )

  const isLiveDataMode = dataMode === 'live' && contractAvailable

  const value = useMemo(
    () => ({ dataMode, setDataMode, isLiveDataMode, contractAvailable }),
    [dataMode, setDataMode, isLiveDataMode, contractAvailable],
  )

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>
}

export function useDataMode() {
  const ctx = useContext(DataModeContext)
  if (!ctx) throw new Error('useDataMode must be used within DataModeProvider')
  return ctx
}

export function useDataModeOptional() {
  return useContext(DataModeContext)
}

export function getDataModeLabel(mode: DataMode, contractAvailable: boolean): string {
  if (mode === 'live' && contractAvailable) return 'Live on-chain'
  return 'Demo · simulated'
}
