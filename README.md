# REACTOR ($CORE)

A HIVE-style containment game re-themed as an industrial reactor. Hold a fuel cell, accumulate charge-score, and claim your share of **THE CORE** when sell pressure triggers a meltdown.

> **Status:** Demo / preview mode — frontend + docs complete. On-chain contract integration is phase 2.

## Mechanism (summary)

- **1 wallet = 1 fuel cell** — first buy mints your rod in the grid
- **Fees → THE CORE** — 2% buy / 3% sell in ETH via Uniswap v4 hook
- **Containment buffer S** — buys raise it, sells drain it 1.67× faster (the **60% rule**)
- **Meltdown** — when S hits zero, loyal holders split the core pro-rata by charge-score
- **Ejectors forfeit** — selling cuts your charge proportionally
- **Re-engagement** — survivors enter next cycle at 0.1× weight until they buy ≥10%

See the full math in the in-app [Docs](/docs) page.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- Canvas 2D for the live reactor grid
- TypeScript demo engine (`src/engine/demoEngine.ts`) — no web3 in v1

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # preview production build
```

## Project structure

```
src/
  config/contract.ts    # Token params + phase 2 web3 stubs
  engine/
    demoEngine.ts       # Simulated buffer, core, charge-score, meltdown loop
    types.ts
  components/           # UI: Hero, ReactorGrid, Gauges, Mechanics, etc.
  pages/
    Home.tsx              # Landing + live demo map
    Docs.tsx              # Full mechanism documentation
```

## Phase 2 (not implemented)

- Deploy ERC-20 + Uniswap v4 hook on Ethereum mainnet
- Wire `readProtocolStats()` / `readWalletStats()` in `src/config/contract.ts`
- Replace demo engine with live on-chain reads
- Enable wallet connect + claim flow

## License

Private / all rights reserved.
