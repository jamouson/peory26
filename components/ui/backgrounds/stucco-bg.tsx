// =============================================================================
// File: src/components/ui/backgrounds/stucco-bg.tsx
// Description: "Subtle Matte" texture.
//   A very quiet, calming background.
//   Simulates thick, high-quality matte paper or very gently smoothed frosting.
//   Low contrast, high softness, designed not to distract.
// =============================================================================

import React, { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type StuccoVariant = "cool" | "warm"

// ─── SVG Texture Generator ───────────────────────────────────────────────────

// NEW FILTER: "Gentle Matte"
// 1. baseFrequency='0.008': Large, slow pattern.
// 2. feColorMatrix values='... 4 -1': Very low contrast. Just enough to see texture exists.
// 3. feGaussianBlur stdDeviation='30': High blur to make it extremely soft.
const subtleMatteSVG = (color: string) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='matte'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.008' numOctaves='3' result='noise' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 4 -1' in='noise' result='contrast' /%3E%3CfeGaussianBlur in='contrast' stdDeviation='30' result='blurred' /%3E%3CfeFlood flood-color='${encodeURIComponent(color)}' result='color'/%3E%3CfeComposite operator='in' in='color' in2='blurred'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='transparent' filter='url(%23matte)' opacity='1'/%3E%3C/svg%3E")`

// Pre-compute textures
const MATTE_TEXTURES = {
  light: {
    // Using lighter colors again so it's subtle
    cool: subtleMatteSVG("#cbd5e1"), // slate-300
    warm: subtleMatteSVG("#d6d3d1"), // stone-300
  },
  dark: {
    cool: subtleMatteSVG("#334155"), // slate-700
    warm: subtleMatteSVG("#44403c"), // stone-700
  },
}

// ─── Configs ─────────────────────────────────────────────────────────────────

interface ModeConfig {
  bg: string
  blendMode: string
  opacity: string
}

const lightVariants: Record<StuccoVariant, ModeConfig> = {
  cool: {
    bg: "#f0f9ff",
    blendMode: "mix-blend-multiply",
    // Dialed way back down for subtlety
    opacity: "0.15",
  },
  warm: {
    bg: "#fdfbf7",
    blendMode: "mix-blend-multiply",
    // Dialed way back down for subtlety
    opacity: "0.18",
  },
}

const darkVariants: Record<StuccoVariant, ModeConfig> = {
  cool: {
    bg: "#020617",
    blendMode: "mix-blend-screen",
    opacity: "0.1",
  },
  warm: {
    bg: "#0c0a09",
    blendMode: "mix-blend-screen",
    opacity: "0.08",
  },
}

// ─── Stucco (Subtle Matte) Layer ─────────────────────────────────────────────

function StuccoLayer({
  config,
  texture,
  className,
}: {
  config: ModeConfig
  texture: string
  className?: string
}) {
  return (
    <div
      className={`${BG_BASE} ${className ?? ""}`}
      style={{ ...BG_STYLE, backgroundColor: config.bg }}
    >
      <div
        className={`absolute inset-0 ${config.blendMode}`}
        style={{
          backgroundImage: texture,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: config.opacity,
          // Slight scale to ensure edges are clean
          transform: "scale(1.05)",
        }}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const DEFAULT: StuccoVariant = "warm"

export const StuccoBackground = memo(function StuccoBackground({
  variant,
}: BackgroundProps) {
  const key = (variant && variant in lightVariants ? variant : DEFAULT) as StuccoVariant

  return (
    <>
      <StuccoLayer
        config={lightVariants[key]}
        texture={MATTE_TEXTURES.light[key]}
        className="dark:hidden"
      />
      <StuccoLayer
        config={darkVariants[key]}
        texture={MATTE_TEXTURES.dark[key]}
        className="hidden dark:block"
      />
    </>
  )
})