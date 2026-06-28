/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_CA?: string
  readonly VITE_REACTOR_HOOK_CA?: string
  readonly VITE_CHAIN_ID?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface VantaNetOptions {
  el: HTMLElement | string
  mouseControls?: boolean
  touchControls?: boolean
  gyroControls?: boolean
  minHeight?: number
  minWidth?: number
  scale?: number
  scaleMobile?: number
  color?: number
  backgroundColor?: number
  backgroundAlpha?: number
  points?: number
  maxDistance?: number
  spacing?: number
  showDots?: boolean
  lineColors?: number
}

interface VantaEffect {
  setOptions(options: Partial<VantaNetOptions>): void
  resize(): void
  destroy(): void
}

declare global {
  interface Window {
    THREE: Record<string, unknown>
    VANTA: {
      NET: (options: VantaNetOptions) => VantaEffect
    }
  }
}

export type { VantaEffect, VantaNetOptions }
