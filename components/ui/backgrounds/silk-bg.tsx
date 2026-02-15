// =============================================================================
// File: src/components/ui/backgrounds/silk-bg.tsx
// Description: Soft, billowing texture for "Creamy" aesthetics.
//   Removes sharp veins in favor of large, gentle folds.
//   Perfect for text-heavy pages where high-contrast veins distract.
// =============================================================================

import React, { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type SilkVariant = "cool" | "warm"

// ─── SVG Textures (module-level, created once) ──────────────────────────────

// Change 1: Increased baseFrequency slightly (0.006 -> 0.008) for more defined folds
// Change 2: Increased internal rect opacity (0.5 -> 0.8) for stronger raw texture
const silkFlowSVG = (color: string) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='silk'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.008' numOctaves='2' result='noise' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7' in='noise' result='goo' /%3E%3CfeComposite operator='in' in='SourceGraphic' in2='goo' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23silk)' opacity='0.8'/%3E%3C/svg%3E")`

const microGrain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`

// Pre-compute flow images
const FLOW_IMAGES = {
  light: { cool: silkFlowSVG("#cbd5e1"), warm: silkFlowSVG("#d6d3d1") },
  dark: { cool: silkFlowSVG("#334155"), warm: silkFlowSVG("#44403c") },
}

// ─── Variant Configs ─────────────────────────────────────────────────────────

interface ModeConfig {
  bg: string
  flowBlend: string
  grainOpacity: string
  lighting: string
}

const lightVariants: Record<SilkVariant, ModeConfig> = {
  cool: {
    bg: "#f8fafc",
    flowBlend: "mix-blend-multiply",
    grainOpacity: "0.05",
    lighting:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,1), transparent 80%)",
  },
  warm: {
    bg: "#fafaf9",
    flowBlend: "mix-blend-multiply",
    grainOpacity: "0.08",
    lighting:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8), transparent 70%)",
  },
}

const darkVariants: Record<SilkVariant, ModeConfig> = {
  cool: {
    bg: "#020617",
    flowBlend: "mix-blend-screen",
    grainOpacity: "0.08",
    lighting:
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 60%)",
  },
  warm: {
    bg: "#0c0a09",
    flowBlend: "mix-blend-screen",
    grainOpacity: "0.06",
    lighting:
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), transparent 60%)",
  },
}

// ─── Silk Layer ──────────────────────────────────────────────────────────────

function SilkLayer({
  config,
  flowImage,
  className,
}: {
  config: ModeConfig
  flowImage: string
  className?: string
}) {
  return (
    <div
      className={`${BG_BASE} ${className ?? ""}`}
      style={{ ...BG_STYLE, backgroundColor: config.bg }}
    >
      <div
        className="absolute inset-0"
        style={{ background: config.lighting }}
      />
      <div
        // Change 3: Increased opacity-40 to opacity-70 for higher visibility
        className={`absolute inset-0 h-full w-full opacity-70 ${config.flowBlend}`}
        style={{
          backgroundImage: flowImage,
          backgroundSize: "cover",
          // Change 4: Reduced blur from 60px to 35px to define shapes better
          filter: "blur(35px)",
          transform: "scale(1.5)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: microGrain, opacity: config.grainOpacity }}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const DEFAULT: SilkVariant = "warm"

export const SilkBackground = memo(function SilkBackground({
  variant,
}: BackgroundProps) {
  const key = (variant && variant in lightVariants ? variant : DEFAULT) as SilkVariant

  return (
    <>
      <SilkLayer
        config={lightVariants[key]}
        flowImage={FLOW_IMAGES.light[key]}
        className="dark:hidden"
      />
      <SilkLayer
        config={darkVariants[key]}
        flowImage={FLOW_IMAGES.dark[key]}
        className="hidden dark:block"
      />
    </>
  )
})