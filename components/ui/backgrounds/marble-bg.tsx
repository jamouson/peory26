// =============================================================================
// File: src/components/ui/backgrounds/marble-bg.tsx
// Description: Balanced Procedural Marble.
// =============================================================================

import React, { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type MarbleVariant = "cool" | "warm" | "lux"

// ─── SVG Textures (module-level, created once) ──────────────────────────────

const grainTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`

const marbleFlowSVG = (color: string) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='marble'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.003' numOctaves='5' seed='5' result='noise' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 23 -11' in='noise' result='goo' /%3E%3CfeComposite operator='in' in='SourceGraphic' in2='goo' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23marble)' opacity='0.7'/%3E%3C/svg%3E")`

// Pre-compute vein images so the generator doesn't run on every render
const VEIN_IMAGES: Record<MarbleVariant, string> = {
  cool: marbleFlowSVG("rgba(112, 128, 144, 0.3)"),
  warm: marbleFlowSVG("rgba(168, 159, 145, 0.35)"),
  lux: marbleFlowSVG("rgba(255, 255, 255, 0.15)"),
}

// ─── Variant Configs ─────────────────────────────────────────────────────────

const variants: Record<
  MarbleVariant,
  { bg: string; grainOpacity: string; lighting: string }
> = {
  cool: {
    bg: "#f8fafc",
    grainOpacity: "0.1",
    lighting:
      "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.8), transparent 60%)",
  },
  warm: {
    bg: "#fafaf9",
    grainOpacity: "0.12",
    lighting:
      "radial-gradient(circle at 100% 0%, rgba(255,252,240,0.5), transparent 50%)",
  },
  lux: {
    bg: "#1a1a1a",
    grainOpacity: "0.15",
    lighting:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 70%)",
  },
}

const DEFAULT: MarbleVariant = "warm"

// ─── Component ───────────────────────────────────────────────────────────────

export const MarbleBackground = memo(function MarbleBackground({
  variant,
}: BackgroundProps) {
  const key = (variant && variant in variants ? variant : DEFAULT) as MarbleVariant
  const v = variants[key]

  return (
    <div className={BG_BASE} style={{ ...BG_STYLE, backgroundColor: v.bg }}>
      {/* LAYER 1: Deep Atmospheric Lighting */}
      <div className="absolute inset-0" style={{ background: v.lighting }} />

      {/* LAYER 2: The Organic Veins */}
      <div
        className="absolute inset-0 h-full w-full opacity-50 mix-blend-multiply"
        style={{
          backgroundImage: VEIN_IMAGES[key],
          backgroundSize: "cover",
          maskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.4) 20%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.4) 20%, black 100%)",
        }}
      />

      {/* LAYER 3: Surface Grain */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage: grainTexture,
          backgroundRepeat: "repeat",
          backgroundSize: "150px",
          opacity: v.grainOpacity,
        }}
      />
    </div>
  )
})