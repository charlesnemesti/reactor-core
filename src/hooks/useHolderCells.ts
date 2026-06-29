import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { CORE_CA, isCaDeployed } from '../config/contract'
import { useDataMode } from '../context/DataModeContext'
import type { ReactorCell } from '../engine/types'
import { HOLDERS_PAGE_SIZE, scanHoldersPage } from '../lib/onChainHolders'

async function fetchHoldersFromApi(page: number): Promise<{
  cells: ReactorCell[]
  totalHolders: number
} | null> {
  try {
    const res = await fetch(`/api/holders?page=${page}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as { cells: ReactorCell[]; totalHolders: number }
  } catch {
    return null
  }
}

export function useHolderCells(page: number) {
  const client = usePublicClient()
  const { isLiveDataMode } = useDataMode()
  const enabled = isLiveDataMode && isCaDeployed() && !!client

  return useQuery({
    queryKey: ['holder-cells', CORE_CA, page],
    enabled,
    placeholderData: { cells: [], totalHolders: 0 },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 2,
    queryFn: async (): Promise<{ cells: ReactorCell[]; totalHolders: number }> => {
      const fromApi = await fetchHoldersFromApi(page)
      if (fromApi) return fromApi

      if (!client) return { cells: [], totalHolders: 0 }
      return scanHoldersPage(client, page, { allowArchive: false })
    },
  })
}

export { HOLDERS_PAGE_SIZE }
