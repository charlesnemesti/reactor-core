import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { usePublicClient } from 'wagmi'
import { reactorAbi } from '../abis/reactor'
import { CORE_CA, CORE_OVERHEAT_ETH, isCaDeployed, LIVE_DATA_ENABLED } from '../config/contract'

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
  const enabled = LIVE_DATA_ENABLED && isCaDeployed() && !!client

  return useQuery({
    queryKey: ['protocol-stats', CORE_CA],
    enabled,
    placeholderData: EMPTY,
    refetchInterval: 12_000,
    retry: 2,
    queryFn: async (): Promise<ProtocolStats> => {
      if (!client) return EMPTY

      const roundNum = await client.readContract({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'round',
      })

      const [jarWei, strength, honeyTotal, eligible, roundMeta] = await Promise.all([
        client.readContract({
          address: CORE_CA,
          abi: reactorAbi,
          functionName: 'jarEth',
        }),
        client.readContract({
          address: CORE_CA,
          abi: reactorAbi,
          functionName: 'strengthNow',
        }),
        client.readContract({
          address: CORE_CA,
          abi: reactorAbi,
          functionName: 'honeyTotalStored',
        }),
        client.readContract({
          address: CORE_CA,
          abi: reactorAbi,
          functionName: 'eligibleWeighted',
        }),
        client.readContract({
          address: CORE_CA,
          abi: reactorAbi,
          functionName: 'rounds',
          args: [roundNum],
        }),
      ])

      const coreEth = Number(formatUnits(jarWei, 18))
      const bufferS = Number(strength[0])
      const bufferSmax = Number(strength[1])
      const stability =
        bufferSmax > 0 ? Math.max(0, Math.min(100, (bufferS / bufferSmax) * 100)) : 0
      const collapseTs = Number(roundMeta[2])
      const meltdownActive = bufferSmax > 0 && strength[0] === 0n && collapseTs > 0
      const meltdownFlash =
        !meltdownActive && coreEth >= CORE_OVERHEAT_ETH && stability < 35

      return {
        coreEth,
        stability,
        bufferS,
        bufferSmax,
        cycle: Number(roundNum),
        meltdownActive,
        meltdownFlash,
        honeyTotal: Number(formatUnits(honeyTotal, 18)),
        eligibleWeighted: Number(formatUnits(eligible, 18)),
      }
    },
  })
}
