import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { CORE_CA, isCaDeployed, LIVE_DATA_ENABLED } from '../config/contract'
import type { ReactorCell } from '../engine/types'
import {
  HOLDERS_PAGE_SIZE,
  buildHolderCells,
  estimateLaunchBlock,
  fetchHolderAddresses,
} from '../lib/onChainHolders'

export function useHolderCells(page: number) {
  const client = usePublicClient()
  const enabled = LIVE_DATA_ENABLED && isCaDeployed() && !!client

  return useQuery({
    queryKey: ['holder-cells', CORE_CA, page],
    enabled,
    placeholderData: { cells: [], totalHolders: 0 },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 2,
    queryFn: async (): Promise<{ cells: ReactorCell[]; totalHolders: number }> => {
      if (!client) return { cells: [], totalHolders: 0 }

      const fromBlock = await estimateLaunchBlock(client)
      const addresses = await fetchHolderAddresses(client, fromBlock)
      return buildHolderCells(client, addresses, page)
    },
  })
}

export { HOLDERS_PAGE_SIZE }
