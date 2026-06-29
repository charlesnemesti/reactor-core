import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { usePublicClient } from 'wagmi'
import { reactorAbi } from '../abis/reactor'
import { CORE_CA, CORE_OVERHEAT_ETH, isCaDeployed } from '../config/contract'
import { useDataMode } from '../context/DataModeContext'

export interface ProtocolStats {
  coreEth: number
  stability: number
  bufferS: number
  bufferSmax: number
  cycle: number
  meltdownActive: boolean
  meltdownFlash: boolean
  honeyTotal: number
  eligibleWeighted: number
}

const EMPTY: ProtocolStats = {
  coreEth: 0,
  stability: 100,
  bufferS: 0,
  bufferSmax: 1,
  cycle: 1,
  meltdownActive: false,
  meltdownFlash: false,
  honeyTotal: 0,
  eligibleWeighted: 0,
}

export function useProtocolStats() {
  const client = usePublicClient()
  const { isLiveDataMode } = useDataMode()
  const enabled = isLiveDataMode && isCaDeployed() && !!client

  return useQuery({
    queryKey: ['protocol-stats', CORE_CA],
    enabled,
    placeholderData: EMPTY,
    refetchInterval: 12_000,
    retry: 2,
    queryFn: async (): Promise<ProtocolStats> => {
      if (!client) return EMPTY

      const [jarWei, strengthRaw, strengthPct, strengthScale, honeyTotal, currentRound] =
        await Promise.all([
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'jarEth',
          }),
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'strength',
          }),
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'strengthPercent',
          }),
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'STRENGTH_SCALE',
          }),
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'totalEligibleHoney',
          }),
          client.readContract({
            address: CORE_CA,
            abi: reactorAbi,
            functionName: 'round',
          }),
        ]) as [bigint, number, bigint, number, bigint, number]

      const coreEth = Number(formatUnits(jarWei, 18))
      const stability = Math.max(0, Math.min(100, Number(strengthPct)))
      const bufferS = Number(strengthRaw)
      const bufferSmax = Number(strengthScale)
      const meltdownActive = strengthRaw === 0 && jarWei > 0n
      const meltdownFlash =
        !meltdownActive && coreEth >= CORE_OVERHEAT_ETH && stability < 35

      return {
        coreEth,
        stability,
        bufferS,
        bufferSmax,
        cycle: Number(currentRound),
        meltdownActive,
        meltdownFlash,
        honeyTotal: Number(formatUnits(honeyTotal, 18)),
        eligibleWeighted: Number(formatUnits(honeyTotal, 18)),
      }
    },
  })
}
