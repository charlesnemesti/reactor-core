/** REACTOR token + Uniswap v4 hook — 0xA86986Fb2396f9826FF03BAF67B21FCf2F7b20cC */
export const reactorAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'jarEth',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'strengthNow',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 's', type: 'uint256' },
      { name: 'cap', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'round',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'launchTime',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'honeyOf',
    stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'claimableOf',
    stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'weightOf',
    stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'cells',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'honeyStored', type: 'uint256' },
      { name: 'roundBaseline', type: 'uint256' },
      { name: 'honeyLastTs', type: 'uint64' },
      { name: 'roundOf', type: 'uint64' },
      { name: 'wTenths', type: 'uint8' },
      { name: 'balanceAtRoundStart', type: 'uint256' },
      { name: 'cumBuysRound', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'honeyTotalStored',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'eligibleWeighted',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rounds',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint64' }],
    outputs: [
      { name: 'pot', type: 'uint256' },
      { name: 'denom', type: 'uint256' },
      { name: 'collapseTs', type: 'uint64' },
      { name: 'paid', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const

/** @deprecated use reactorAbi */
export const reactorHookAbi = reactorAbi
