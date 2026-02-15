// =============================================================================
// File: src/components/ui/backgrounds/types.ts
// Description: Shared type definitions for the background system.
//   Fully generic — no hardcoded list of background types or variants.
// =============================================================================

import type { ComponentType } from "react"

/**
 * Every background component must accept this prop shape.
 * Variant meanings are up to each component (cool/warm/lux/etc).
 */
export interface BackgroundProps {
  variant?: string
}

/**
 * Route → background mapping used in siteConfig.
 * `type` must match a key in the background registry.
 * `variant` is passed through to the component as-is.
 */
export interface BackgroundConfig {
  type: string
  variant?: string
}

/**
 * The registry maps type names → components.
 */
export type BackgroundRegistry = Record<string, ComponentType<BackgroundProps>>
