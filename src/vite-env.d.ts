/// <reference types="vite/client" />

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
