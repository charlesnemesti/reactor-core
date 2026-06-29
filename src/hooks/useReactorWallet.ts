import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useChainId,
  useConnection,
  usePublicClient,
  useReadContract,
} from 'wagmi'
import { reactorAbi } from '../abis/reactor'
import {
  CORE_CA,
  TOKEN_DECIMALS,
} from '../config/contract'
import { getDataModeLabel, useDataMode } from '../context/DataModeContext'
import { TARGET_CHAIN_ID } from '../config/wagmi'
import { formatTokenAmount } from '../lib/formatOnChain'
import { formatClaimableEth, readClaimableEth } from '../lib/reactorV4Reads'

export function useReactorWallet() {
  const { address, status } = useConnection()
  const isConnected = status === 'connected'
  const chainId = useChainId()
  const client = usePublicClient()
  const { isLiveDataMode, dataMode, contractAvailable } = useDataMode()
  const hookLive = isLiveDataMode
  const wrongChain = isConnected && chainId !== TARGET_CHAIN_ID

  const balanceQuery = useReadContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isLiveDataMode && isConnected && !!address && !wrongChain,
      refetchInterval: 12_000,
    },
  })

  const energyQuery = useReadContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'energyOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hookLive && isConnected && !!address && !wrongChain,
      refetchInterval: 12_000,
    },
  })

  const claimQuery = useQuery({
    queryKey: ['wallet-claimable', CORE_CA, address],
    enabled: hookLive && isConnected && !!address && !wrongChain && !!client,
    refetchInterval: 12_000,
    queryFn: async () => {
      if (!client || !address) return { wei: 0n, round: null as number | null }
      return readClaimableEth(client, address)
    },
  })

  const coreBalance = (balanceQuery.data ?? 0n) as bigint
  const energyRaw = (energyQuery.data ?? 0n) as bigint
  const claimableWei = claimQuery.data?.wei ?? 0n
  const claimRound = claimQuery.data?.round ?? null

  const formatted = useMemo(
    () => ({
      balance: isLiveDataMode && isConnected ? formatTokenAmount(coreBalance, TOKEN_DECIMALS) : null,
      claimableEth: hookLive && isConnected ? formatClaimableEth(claimableWei) : null,
      chargeScore:
        hookLive && isConnected ? formatTokenAmount(energyRaw, TOKEN_DECIMALS, 0) : null,
    }),
    [isLiveDataMode, hookLive, isConnected, coreBalance, claimableWei, energyRaw],
  )

  return {
    address,
    isConnected,
    status,
    wrongChain,
    live: isLiveDataMode,
    hookLive,
    claimRound,
    launchMessage: getDataModeLabel(dataMode, contractAvailable),
    formatted,
    isLoading: balanceQuery.isLoading || energyQuery.isLoading || claimQuery.isLoading,
    refetch: () => {
      void balanceQuery.refetch()
      void energyQuery.refetch()
      void claimQuery.refetch()
    },
  }
}
