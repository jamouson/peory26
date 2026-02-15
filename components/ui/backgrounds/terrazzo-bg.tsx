// =============================================================================
// File: src/components/ui/backgrounds/terrazzo-bg.tsx
// Description: Fragmented "Chip" texture.
//   Uses high-contrast thresholding to create isolated islands of color
//   resembling terrazzo flooring or cookie crumbs.
// =============================================================================

import React, { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type TerrazzoVariant = "cool" | "warm"

// ─── SVG Generator (module-level) ───────────────────────────────────────────

const terrazzoSVG = (color: string) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='chip'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -15' result='goo' /%3E%3CfeComposite operator='in' in='SourceGraphic' in2='goo' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23chip)' opacity='1'/%3E%3C/svg%3E")`

// Pre-compute chip images
const CHIP_IMAGES = {
  light: { cool: terrazzoSVG("#94a3b8"), warm: terrazzoSVG("#a8a29e") },
  dark: { cool: terrazzoSVG("#475569"), warm: terrazzoSVG("#57534e") },
}

// ─── Configs ─────────────────────────────────────────────────────────────────

interface ModeConfig {
  bg: string
  chipOpacity: string
  chipBlend: string
  chipScale: string
}

const lightVariants: Record<TerrazzoVariant, ModeConfig> = {
  cool: {
    bg: "#f1f5f9",
    chipOpacity: "0.3",
    chipBlend: "mix-blend-multiply",
    chipScale: "120px",
  },
  warm: {
    bg: "#f5f5f4",
    chipOpacity: "0.35",
    chipBlend: "mix-blend-multiply",
    chipScale: "140px",
  },
}

const darkVariants: Record<TerrazzoVariant, ModeConfig> = {
  cool: {
    bg: "#0f172a",
    chipOpacity: "0.2",
    chipBlend: "mix-blend-screen",
    chipScale: "120px",
  },
  warm: {
    bg: "#1c1917",
    chipOpacity: "0.15",
    chipBlend: "mix-blend-screen",
    chipScale: "140px",
  },
}

// ─── Terrazzo Layer ──────────────────────────────────────────────────────────

function TerrazzoLayer({
  config,
  chipImage,
  className,
}: {
  config: ModeConfig
  chipImage: string
  className?: string
}) {
  return (
    <div
      className={`${BG_BASE} ${className ?? ""}`}
      style={{ ...BG_STYLE, backgroundColor: config.bg }}
    >
      {/* LAYER 1: Large Chips */}
      <div
        className={`absolute inset-0 ${config.chipBlend}`}
        style={{
          backgroundImage: chipImage,
          backgroundSize: config.chipScale,
          opacity: config.chipOpacity,
        }}
      />
      {/* LAYER 2: Secondary Chips (offset for depth) */}
      <div
        className={`absolute inset-0 ${config.chipBlend}`}
        style={{
          backgroundImage: chipImage,
          backgroundSize: `calc(${config.chipScale} * 0.6)`,
          backgroundPosition: "50px 50px",
          opacity: Number(config.chipOpacity) * 0.5,
          transform: "rotate(45deg)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.03) 100%)",
        }}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const DEFAULT: TerrazzoVariant = "warm"

export const TerrazzoBackground = memo(function TerrazzoBackground({
  variant,
}: BackgroundProps) {
  const key = (variant && variant in lightVariants ? variant : DEFAULT) as TerrazzoVariant

  return (
    <>
      <TerrazzoLayer
        config={lightVariants[key]}
        chipImage={CHIP_IMAGES.light[key]}
        className="dark:hidden"
      />
      <TerrazzoLayer
        config={darkVariants[key]}
        chipImage={CHIP_IMAGES.dark[key]}
        className="hidden dark:block"
      />
    </>
  )
})