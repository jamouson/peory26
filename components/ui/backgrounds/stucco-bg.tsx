// =============================================================================
// File: src/components/ui/backgrounds/stucco-bg.tsx
// Description: Matte, static texture.
//   Removes all "movement" (veins/waves) in favor of deep surface grain.
//   Ideal for forms/checkout where visual distraction must be minimized.
// =============================================================================

import React, { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type StuccoVariant = "cool" | "warm"

// ─── Texture (module-level, created once) ────────────────────────────────────

const roughGrain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`

// ─── Configs ─────────────────────────────────────────────────────────────────

interface ModeConfig {
  grainBlend: string
  grainOpacity: string
  gradient: string
}

const lightVariants: Record<StuccoVariant, ModeConfig> = {
  cool: {
    grainBlend: "mix-blend-multiply",
    grainOpacity: "0.08",
    gradient: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
  },
  warm: {
    grainBlend: "mix-blend-multiply",
    grainOpacity: "0.1",
    gradient: "linear-gradient(to bottom right, #fafaf9, #e7e5e4)",
  },
}

const darkVariants: Record<StuccoVariant, ModeConfig> = {
  cool: {
    grainBlend: "mix-blend-overlay",
    grainOpacity: "0.15",
    gradient: "linear-gradient(to bottom right, #0f172a, #020617)",
  },
  warm: {
    grainBlend: "mix-blend-overlay",
    grainOpacity: "0.12",
    gradient: "linear-gradient(to bottom right, #1c1917, #0c0a09)",
  },
}

// ─── Stucco Layer ────────────────────────────────────────────────────────────

function StuccoLayer({
  config,
  className,
}: {
  config: ModeConfig
  className?: string
}) {
  return (
    <div
      className={`${BG_BASE} ${className ?? ""}`}
      style={{ ...BG_STYLE, background: config.gradient }}
    >
      {/* LAYER 1: Deep Grain (Base Texture) */}
      <div
        className={`absolute inset-0 ${config.grainBlend}`}
        style={{
          backgroundImage: roughGrain,
          backgroundSize: "180px",
          opacity: config.grainOpacity,
        }}
      />
      {/* LAYER 2: Fine Grain (Cross-hatch Detail) */}
      <div
        className={`absolute inset-0 ${config.grainBlend}`}
        style={{
          backgroundImage: roughGrain,
          backgroundSize: "60px",
          opacity: Number(config.grainOpacity) * 0.5,
          transform: "rotate(90deg)",
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
      <StuccoLayer config={lightVariants[key]} className="dark:hidden" />
      <StuccoLayer config={darkVariants[key]} className="hidden dark:block" />
    </>
  )
})