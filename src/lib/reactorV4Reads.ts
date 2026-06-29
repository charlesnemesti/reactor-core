import {
  type Address,
  type PublicClient,
  formatUnits,
  parseAbiItem,
} from 'viem'
import { reactorAbi } from '../abis/reactor'
import { CORE_CA } from '../config/contract'

const ROUND_OPENED = parseAbiItem('event RoundOpened(uint32 indexed round)')

let cachedLaunchBlock: bigint | null = null

export async function estimateLaunchBlock(client: PublicClient): Promise<bigint> {
  if (cachedLaunchBlock !== null) return cachedLaunchBlock

  const latest = await client.getBlockNumber()

  try {
    const opened = await findRoundOpenedBlock(client, latest)
    if (opened != null) {
      cachedLaunchBlock = opened
      return cachedLaunchBlock
    }
  } catch {
    /* fall through */
  }

  const lastTs = (await client.readContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'lastGlobalUpdateTs',
  })) as bigint

  const now = BigInt(Math.floor(Date.now() / 1000))
  const elapsed = now > lastTs ? now - lastTs : 0n
  const blocksAgo = elapsed / 12n + 2_000n
  cachedLaunchBlock = latest > blocksAgo ? latest - blocksAgo : 0n
  return cachedLaunchBlock
}

async function findRoundOpenedBlock(
  client: PublicClient,
  latest: bigint,
): Promise<bigint | null> {
  const LOG_CHUNK = 99n
  const MIN_LOG_CHUNK = 10n
  let chunk = LOG_CHUNK

  for (let end = latest; end > 0n; ) {
    const start = end > chunk ? end - chunk : 0n
    let advanced = false

    while (!advanced) {
      try {
        const logs = await client.getLogs({
          address: CORE_CA,
          event: ROUND_OPENED,
          fromBlock: start,
          toBlock: end,
          strict: true,
        })
        if (logs.length > 0 && logs[0].blockNumber != null) {
          return logs[0].blockNumber
        }
        advanced = true
      } catch {
        chunk = chunk / 2n
        if (chunk < MIN_LOG_CHUNK) return null
      }
    }

    if (start === 0n) break
    end = start - 1n
  }

  return null
}

/** Sum unclaimed ETH across settled rounds (estimate from energyOf × ethPerHoney). */
export async function readClaimableEth(
  client: PublicClient,
  wallet: Address,
): Promise<{ wei: bigint; round: number | null }> {
  const currentRound = (await client.readContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'round',
  })) as number

  if (currentRound <= 1) return { wei: 0n, round: null }

  const energy = (await client.readContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'energyOf',
    args: [wallet],
  })) as bigint

  if (energy === 0n) return { wei: 0n, round: null }

  let total = 0n
  let firstRound: number | null = null

  for (let r = 1; r < currentRound; r++) {
    const round = r as number
    const [settled, already] = await Promise.all([
      client.readContract({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'roundSettled',
        args: [round],
      }),
      client.readContract({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'claimed',
        args: [wallet, round],
      }),
    ])

    if (!settled || already) continue

    const rate = (await client.readContract({
      address: CORE_CA,
      abi: reactorAbi,
      functionName: 'ethPerHoney',
      args: [round],
    })) as bigint

    if (rate === 0n) continue

    total += (energy * rate) / 10n ** 18n
    if (firstRound === null) firstRound = round
  }

  return { wei: total, round: firstRound }
}

export function formatClaimableEth(wei: bigint): string {
  const n = Number(formatUnits(wei, 18))
  if (n === 0) return '0.000'
  if (n < 0.001) return '<0.001'
  return n.toFixed(3)
}
