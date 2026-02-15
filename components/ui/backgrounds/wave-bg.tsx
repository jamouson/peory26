// =============================================================================
// File: src/components/ui/backgrounds/wave-bg.tsx
// Description: "Dialed Up" Wave Background with dark mode support.
//   Dual light/dark layers toggled via Tailwind dark: classes.
// =============================================================================

import { memo } from "react"
import type { BackgroundProps } from "./types"
import { BG_BASE, BG_STYLE } from "./perf"

type WaveVariant = "cool" | "warm"

// ─── SVG Textures (module-level, created once) ──────────────────────────────

const sharpFlow = (color: string) =>
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.002 0.008' numOctaves='3' seed='15' /%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -20' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}' filter='url(%23noise)' opacity='0.7'/%3E%3C/svg%3E")`

const grainTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`

// Pre-compute vein images
const VEIN_IMAGES = {
  light: { cool: sharpFlow("#64748b"), warm: sharpFlow("#78716c") },
  dark: { cool: sharpFlow("#475569"), warm: sharpFlow("#57534e") },
}

// ─── Variant Configs ─────────────────────────────────────────────────────────

interface ModeConfig {
  base: string
  veinOpacity: string
  veinBlend: string
  spotlight: string
  grainBlend: string
}

const lightVariants: Record<WaveVariant, ModeConfig> = {
  cool: {
    base: "#F8FAFC",
    veinOpacity: "0.18",
    veinBlend: "",
    spotlight:
      "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
    grainBlend: "mix-blend-multiply",
  },
  warm: {
    base: "#FAFAF9",
    veinOpacity: "0.22",
    veinBlend: "",
    spotlight:
      "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85) 10%, rgba(255,255,255,0) 80%)",
    grainBlend: "mix-blend-multiply",
  },
}

const darkVariants: Record<WaveVariant, ModeConfig> = {
  cool: {
    base: "#0a0a0a",
    veinOpacity: "0.15",
    veinBlend: "mix-blend-screen",
    spotlight:
      "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 70%)",
    grainBlend: "mix-blend-screen",
  },
  warm: {
    base: "#0a0a0a",
    veinOpacity: "0.12",
    veinBlend: "mix-blend-screen",
    spotlight:
      "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 10%, transparent 80%)",
    grainBlend: "mix-blend-screen",
  },
}

// ─── Wave Layer ──────────────────────────────────────────────────────────────

function WaveLayer({
  config,
  veinImage,
  className,
}: {
  config: ModeConfig
  veinImage: string
  className?: string
}) {
  return (
    <div
      className={`${BG_BASE} select-none ${className ?? ""}`}
      style={{ ...BG_STYLE, backgroundColor: config.base }}
    >
      <div
        className={`absolute inset-[-50%] h-[200%] w-[200%] origin-center ${config.veinBlend}`}
        style={{
          backgroundImage: veinImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: config.veinOpacity,
          transform: "rotate(-12deg)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: config.spotlight }}
      />
      <div
        className={`absolute inset-0 opacity-[0.2] ${config.grainBlend}`}
        style={{ backgroundImage: grainTexture }}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

const DEFAULT: WaveVariant = "cool"

export const WaveBackground = memo(function WaveBackground({
  variant,
}: BackgroundProps) {
  const key = (variant && variant in lightVariants ? variant : DEFAULT) as WaveVariant

  return (
    <>
      <WaveLayer
        config={lightVariants[key]}
        veinImage={VEIN_IMAGES.light[key]}
        className="dark:hidden"
      />
      <WaveLayer
        config={darkVariants[key]}
        veinImage={VEIN_IMAGES.dark[key]}
        className="hidden dark:block"
      />
    </>
  )
})