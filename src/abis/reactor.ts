import type { Abi } from 'viem'
import reactorV4AbiJson from './reactorV4.json'

/** ReactorV4 token + Uniswap v4 hook — 0xc3b7da17a4A96350a07a2378e4834E2201808044 */
export const reactorAbi = reactorV4AbiJson as Abi

/** @deprecated use reactorAbi */
export const reactorHookAbi = reactorAbi
