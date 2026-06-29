import {
  type Address,
  type PublicClient,
  formatUnits,
  parseAbiItem,
  zeroAddress,
} from 'viem'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const reactorAbi = JSON.parse(
  readFileSync(join(__dirname, '../../src/abis/reactorV4.json'), 'utf8'),
)

const CORE_CA = (process.env.VITE_CORE_CA ??
  process.env.CORE_CA ??
  '0xc3b7da17a4A96350a07a2378e4834E2201808044') as `0x${string}`
const POOL_MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90' as const
const TOKEN_DECIMALS = 18
const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)
const ROUND_OPENED = parseAbiItem('event RoundOpened(uint32 indexed round)')

const COLS = 6
const PAGE_SIZE = 24
const LOG_CHUNK = 99n
const MIN_LOG_CHUNK = 10n
const RECENT_LOG_WINDOW = 99n

const EXCLUDED = new Set(
  [zeroAddress, CORE_CA, POOL_MANAGER].map((a) => a.toLowerCase()),
)

function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

async function findRoundOpenedBlock(client: PublicClient, latest: bigint) {
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
        if (logs.length > 0 && logs[0].blockNumber != null) return logs[0].blockNumber
        advanced = true
      } catch {
        chunk /= 2n
        if (chunk < MIN_LOG_CHUNK) return null
      }
    }
    if (start === 0n) break
    end = start - 1n
  }
  return null
}

async function estimateLaunchBlock(client: PublicClient): Promise<bigint> {
  const latest = await client.getBlockNumber()
  const opened = await findRoundOpenedBlock(client, latest)
  if (opened != null) return opened

  const lastTs = (await client.readContract({
    address: CORE_CA,
    abi: reactorAbi,
    functionName: 'lastGlobalUpdateTs',
  })) as bigint

  const now = BigInt(Math.floor(Date.now() / 1000))
  const elapsed = now > lastTs ? now - lastTs : 0n
  const blocksAgo = elapsed / 12n + 50n
  return latest > blocksAgo ? latest - blocksAgo : 0n
}

async function getTransferLogs(client: PublicClient, fromBlock: bigint, toBlock: bigint) {
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
        chunk /= 2n
        if (chunk < MIN_LOG_CHUNK) throw new Error('eth_getLogs failed on server RPC')
        end = start + chunk - 1n > toBlock ? toBlock : start + chunk - 1n
      }
    }
  }

  return allLogs
}

async function fetchHolderAddresses(client: PublicClient, fromBlock: bigint) {
  const latest = await client.getBlockNumber()
  const logs = await getTransferLogs(client, fromBlock, latest)
  const holders = new Set<Address>()

  for (const log of logs) {
    const from = log.args.from
    const to = log.args.to
    if (from && !EXCLUDED.has(from.toLowerCase())) holders.add(from)
    if (to && !EXCLUDED.has(to.toLowerCase())) holders.add(to)
  }

  return [...holders]
}

export async function scanHoldersPage(client: PublicClient, page: number) {
  const latest = await client.getBlockNumber()
  const recentFrom = latest > RECENT_LOG_WINDOW ? latest - RECENT_LOG_WINDOW : 0n

  let fromBlock = recentFrom
  if (process.env.RPC_URL || process.env.VITE_RPC_URL) {
    try {
      fromBlock = await estimateLaunchBlock(client)
    } catch {
      fromBlock = recentFrom
    }
  }

  let addresses: Address[]
  try {
    addresses = await fetchHolderAddresses(client, fromBlock)
  } catch {
    addresses = await fetchHolderAddresses(client, recentFrom)
  }

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
    if (row.status === 'success' && (row.result as bigint) > 0n) active.push(addresses[i])
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
          ? (cellResults[i].result as readonly [bigint, bigint, number, number, boolean])
          : null
      const balance =
        balanceActive[i].status === 'success' ? (balanceActive[i].result as bigint) : 0n

      const balanceNum = Number(formatUnits(balance, TOKEN_DECIMALS))
      const energyNum = Number(formatUnits(energy, TOKEN_DECIMALS))
      const roundOf = cellData ? Number(cellData[2]) : 0
      const countedEligible = cellData ? cellData[4] : false
      const maturity = balanceNum > 0 ? Math.min(1, energyNum / (balanceNum * 4 + 1)) : 0
      const roundsHeld = Math.max(0, Number(currentRound) - roundOf)

      return {
        address,
        energy,
        balanceNum,
        energyNum,
        eligible,
        countedEligible,
        maturity,
        heldMs: roundsHeld * 3_600_000,
      }
    })
    .sort((a, b) => (a.energy > b.energy ? -1 : a.energy < b.energy ? 1 : 0))

  const pageStart = page * PAGE_SIZE
  const slice = ranked.slice(pageStart, pageStart + PAGE_SIZE)

  const cells = slice.map((row, index) => ({
    id: `live-${row.address}`,
    address: shortenAddress(row.address, 4),
    balance: row.balanceNum,
    chargeScore: row.energyNum,
    maturity: row.maturity,
    heldMs: row.heldMs,
    weight: row.countedEligible ? 1.0 : row.eligible ? 1.0 : 0.1,
    ejected: !row.eligible,
    row: Math.floor(index / COLS),
    col: index % COLS,
  }))

  return { cells, totalHolders: ranked.length }
}
