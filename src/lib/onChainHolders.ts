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

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

const COLS = 6
const PAGE_SIZE = 24
const LOG_CHUNK = 9_000n

export async function estimateLaunchBlock(client: PublicClient): Promise<bigint> {
  const [launchTime, latest] = await Promise.all([
    client.readContract({
      address: CORE_CA,
      abi: reactorAbi,
      functionName: 'launchTime',
    }),
    client.getBlockNumber(),
  ])

  const now = BigInt(Math.floor(Date.now() / 1000))
  const elapsed = now > launchTime ? now - launchTime : 0n
  const blocksAgo = elapsed / 12n + 500n
  const from = latest > blocksAgo ? latest - blocksAgo : 0n
  return from
}

export async function fetchHolderAddresses(
  client: PublicClient,
  fromBlock: bigint,
): Promise<Address[]> {
  const latest = await client.getBlockNumber()
  const holders = new Set<Address>()

  for (let start = fromBlock; start <= latest; start += LOG_CHUNK) {
    const end = start + LOG_CHUNK - 1n > latest ? latest : start + LOG_CHUNK - 1n
    const logs = await client.getLogs({
      address: CORE_CA,
      event: TRANSFER,
      fromBlock: start,
      toBlock: end,
    })

    for (const log of logs) {
      const from = log.args.from
      const to = log.args.to
      if (from && from !== zeroAddress) holders.add(from)
      if (to && to !== zeroAddress) holders.add(to)
    }
  }

  return [...holders]
}

export async function buildHolderCells(
  client: PublicClient,
  addresses: Address[],
  page: number,
): Promise<{ cells: ReactorCell[]; totalHolders: number }> {
  if (addresses.length === 0) return { cells: [], totalHolders: 0 }

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
    if (row.status === 'success' && row.result > 0n) {
      active.push(addresses[i])
    }
  }

  if (active.length === 0) return { cells: [], totalHolders: 0 }

  const [balanceActive, honeyResults, weightResults, cellResults] = await Promise.all([
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
        functionName: 'honeyOf' as const,
        args: [address] as const,
      })),
      allowFailure: true,
    }),
    client.multicall({
      contracts: active.map((address) => ({
        address: CORE_CA,
        abi: reactorAbi,
        functionName: 'weightOf' as const,
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

  const nowSec = BigInt(Math.floor(Date.now() / 1000))
  const ranked = active
    .map((address, i) => {
      const honey =
        honeyResults[i].status === 'success' ? (honeyResults[i].result as bigint) : 0n
      const weightRaw =
        weightResults[i].status === 'success' ? Number(weightResults[i].result as number) : 10
      const cellData =
        cellResults[i].status === 'success'
          ? (cellResults[i].result as readonly [
              bigint,
              bigint,
              bigint,
              bigint,
              number,
              bigint,
              bigint,
            ])
          : null
      const balance =
        balanceActive[i].status === 'success' ? (balanceActive[i].result as bigint) : 0n

      const honeyLastTs = cellData ? Number(cellData[2]) : 0
      const heldMs = honeyLastTs > 0 ? Number(nowSec - BigInt(honeyLastTs)) * 1000 : 0
      const balanceNum = Number(formatUnits(balance, TOKEN_DECIMALS))
      const honeyNum = Number(formatUnits(honey, TOKEN_DECIMALS))
      const maturity =
        balanceNum > 0 ? Math.min(1, honeyNum / (balanceNum * 4 + 1)) : 0

      return {
        address,
        honey,
        balance,
        balanceNum,
        honeyNum,
        weight: weightRaw / 10,
        heldMs,
        maturity,
      }
    })
    .sort((a, b) => (a.honey > b.honey ? -1 : a.honey < b.honey ? 1 : 0))

  const pageStart = page * PAGE_SIZE
  const slice = ranked.slice(pageStart, pageStart + PAGE_SIZE)

  const cells = slice.map((row, index) => {
    const col = index % COLS
    const gridRow = Math.floor(index / COLS)
    return {
      id: `live-${row.address}`,
      address: shortenAddress(row.address, 4),
      balance: row.balanceNum,
      chargeScore: row.honeyNum,
      maturity: row.maturity,
      heldMs: row.heldMs,
      weight: row.weight,
      ejected: row.balance === 0n,
      row: gridRow,
      col,
    }
  })

  return { cells, totalHolders: ranked.length }
}

export const HOLDERS_PAGE_SIZE = PAGE_SIZE
