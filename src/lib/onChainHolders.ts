import {
  type Address,
  type PublicClient,
  formatUnits,
  parseAbiItem,
  zeroAddress,
} from 'viem'
import { reactorAbi } from '../abis/reactor'
import { CORE_CA, shortenAddress, TOKEN_DECIMALS } from '../config/contract'
import type { ReactorCell } from '../engine/types'
import { estimateLaunchBlock } from '../lib/reactorV4Reads'

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

const COLS = 6
const PAGE_SIZE = 24
/** Most free RPCs reject eth_getLogs ranges above ~100 blocks */
const LOG_CHUNK = 99n
const MIN_LOG_CHUNK = 10n

export { estimateLaunchBlock }

async function getTransferLogs(
  client: PublicClient,
  fromBlock: bigint,
  toBlock: bigint,
) {
  const allLogs = []
  let chunk = LOG_CHUNK

  for (let start = fromBlock; start <= toBlock; ) {
    let end = start + chunk - 1n > toBlock ? toBlock : start + chunk - 1n
    let advanced = false

    while (!advanced) {
      try {
        const logs = await client.getLogs({
          address: CORE_CA,
          event: TRANSFER,
          fromBlock: start,
          toBlock: end,
          strict: true,
        })
        allLogs.push(...logs)
        start = end + 1n
        advanced = true
      } catch {
        chunk = chunk / 2n
        if (chunk < MIN_LOG_CHUNK) {
          throw new Error('eth_getLogs failed — configure VITE_RPC_URL with a dedicated RPC')
        }
        end = start + chunk - 1n > toBlock ? toBlock : start + chunk - 1n
      }
    }
  }

  return allLogs
}

export async function fetchHolderAddresses(
  client: PublicClient,
  fromBlock: bigint,
): Promise<Address[]> {
  const latest = await client.getBlockNumber()
  const logs = await getTransferLogs(client, fromBlock, latest)
  const holders = new Set<Address>()

  for (const log of logs) {
    const from = log.args.from
    const to = log.args.to
    if (from && from !== zeroAddress) holders.add(from)
    if (to && to !== zeroAddress) holders.add(to)
  }

  return [...holders]
}

export async function buildHolderCells(
  client: PublicClient,
  addresses: Address[],
  page: number,
): Promise<{ cells: ReactorCell[]; totalHolders: number }> {
  if (addresses.length === 0) return { cells: [], totalHolders: 0 }

  const currentRound = (await client.readContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'round',
  })) as number

  const balanceResults = await client.multicall({
    contracts: addresses.map((address) => ({
      address: CORE_CA,
      abi: reactorAbi,
      functionName: 'balanceOf' as const,
      args: [address] as const,
    })),
    allowFailure: true,
  })

  const active: Address[] = []
  for (let i = 0; i < addresses.length; i++) {
    const row = balanceResults[i]
    if (row.status === 'success' && (row.result as bigint) > 0n) {
      active.push(addresses[i])
    }
  }

  if (active.length === 0) return { cells: [], totalHolders: 0 }

  const [balanceActive, energyResults, eligibleResults, cellResults] = await Promise.all([
    client.multicall({
      contracts: active.map((address) => ({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'balanceOf' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
    client.multicall({
      contracts: active.map((address) => ({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'energyOf' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
    client.multicall({
      contracts: active.map((address) => ({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'isEligible' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
    client.multicall({
      contracts: active.map((address) => ({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'cells' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
  ])

  const ranked = active
    .map((address, i) => {
      const energy =
        energyResults[i].status === 'success' ? (energyResults[i].result as bigint) : 0n
      const eligible =
        eligibleResults[i].status === 'success' ? (eligibleResults[i].result as boolean) : false
      const cellData =
        cellResults[i].status === 'success'
          ? (cellResults[i].result as readonly [
              bigint,
              bigint,
              number,
              number,
              boolean,
            ])
          : null
      const balance =
        balanceActive[i].status === 'success' ? (balanceActive[i].result as bigint) : 0n

      const balanceNum = Number(formatUnits(balance, TOKEN_DECIMALS))
      const energyNum = Number(formatUnits(energy, TOKEN_DECIMALS))
      const honeyStored = cellData ? Number(formatUnits(cellData[0], TOKEN_DECIMALS)) : 0
      const roundOf = cellData ? Number(cellData[2]) : 0
      const countedEligible = cellData ? cellData[4] : false
      const maturity =
        balanceNum > 0 ? Math.min(1, energyNum / (balanceNum * 4 + 1)) : 0
      const roundsHeld = Math.max(0, Number(currentRound) - roundOf)

      return {
        address,
        energy,
        balance,
        balanceNum,
        energyNum,
        eligible,
        countedEligible,
        maturity,
        heldMs: roundsHeld * 3_600_000,
        honeyStored,
      }
    })
    .sort((a, b) => (a.energy > b.energy ? -1 : a.energy < b.energy ? 1 : 0))

  const pageStart = page * PAGE_SIZE
  const slice = ranked.slice(pageStart, pageStart + PAGE_SIZE)

  const cells = slice.map((row, index) => {
    const col = index % COLS
    const gridRow = Math.floor(index / COLS)
    return {
      id: `live-${row.address}`,
      address: shortenAddress(row.address, 4),
      balance: row.balanceNum,
      chargeScore: row.energyNum,
      maturity: row.maturity,
      heldMs: row.heldMs,
      weight: row.countedEligible ? 1.0 : row.eligible ? 1.0 : 0.1,
      ejected: !row.eligible,
      row: gridRow,
      col,
    }
  })

  return { cells, totalHolders: ranked.length }
}

export const HOLDERS_PAGE_SIZE = PAGE_SIZE
