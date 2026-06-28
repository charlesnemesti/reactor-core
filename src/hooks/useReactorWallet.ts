import { useMemo } from 'react'
import {
  useChainId,
  useConnection,
  useReadContract,
  useReadContracts,
} from 'wagmi'
import { reactorAbi } from '../abis/reactor'
import {
  CORE_CA,
  isCaDeployed,
  LAUNCH_MESSAGE,
  REACTOR_HOOK_CA,
  TOKEN_DECIMALS,
} from '../config/contract'
import { TARGET_CHAIN_ID } from '../config/wagmi'
import { formatEthFromWei, formatTokenAmount } from '../lib/formatOnChain'

export function useReactorWallet() {
  const { address, status } = useConnection()
  const isConnected = status === 'connected'
  const chainId = useChainId()
  const live = isCaDeployed()
  const hookLive = live
  const wrongChain = isConnected && chainId !== TARGET_CHAIN_ID

  const balanceQuery = useReadContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: live && isConnected && !!address && !wrongChain,
      refetchInterval: 12_000,
    },
  })

  const hookReads = useReadContracts({
    contracts: address
      ? ([
          {
            address: REACTOR_HOOK_CA,
            abi: reactorAbi,
            functionName: 'claimableOf',
            args: [address],
          },
          {
            address: REACTOR_HOOK_CA,
            abi: reactorAbi,
            functionName: 'honeyOf',
            args: [address],
          },
        ] as const)
      : [],
    query: {
      enabled: hookLive && isConnected && !!address && !wrongChain,
      refetchInterval: 12_000,
    },
  })

  const coreBalance = balanceQuery.data ?? 0n
  const claimableWei =
    hookReads.data?.[0]?.status === 'success' ? (hookReads.data[0].result as bigint) : 0n
  const chargeScoreRaw =
    hookReads.data?.[1]?.status === 'success' ? (hookReads.data[1].result as bigint) : 0n

  const formatted = useMemo(
    () => ({
      balance: live && isConnected ? formatTokenAmount(coreBalance, TOKEN_DECIMALS) : null,
      claimableEth: hookLive && isConnected ? formatEthFromWei(claimableWei) : null,
      chargeScore:
        hookLive && isConnected ? formatTokenAmount(chargeScoreRaw, TOKEN_DECIMALS, 0) : null,
    }),
    [live, hookLive, isConnected, coreBalance, claimableWei, chargeScoreRaw],
  )

  return {
    address,
    isConnected,
    status,
    wrongChain,
    live,
    hookLive,
    launchMessage: LAUNCH_MESSAGE,
    formatted,
    isLoading: balanceQuery.isLoading || hookReads.isLoading,
    refetch: () => {
      void balanceQuery.refetch()
      void hookReads.refetch()
    },
  }
}
