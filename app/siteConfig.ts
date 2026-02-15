// =============================================================================
// File: src/app/siteConfig.ts
// Description: Site-wide configuration including routes and background system.
// =============================================================================

import type { BackgroundConfig } from "@/components/ui/backgrounds"

export const siteConfig = {
  name: "Peory Cake",
  url: "https://peorycake.com",
  description:
    "Exquisite floral cakes crafted with premium organic ingredients.",
  baseLinks: {
    home: "/",
    cakes: "/cakes",
    cupcakes: "/cupcakes",
    numberCakes: "/number-cakes",
    collections: "/collections",
    occasion: "/cakes#occasion",
    pricing: "/pricing",
    pure: "/pure",
    wedding: "/weddings",
    classes: "/classes",
    faq: "/faq",
    howToOrder: "/how-to-order",
    about: "/about",
    terms: "/terms",
    privacy: "/privacy",
  },
  /**
   * Maps route paths to background configs.
   * - Exact matches checked first
   * - Sub-routes inherit from closest parent (e.g. /cakes/chocolate → warm marble)
   * - Unlisted routes fall back to defaultBackground
   *
   * `type` must match a key registered in backgrounds/registry.ts
   * `variant` is passed to the component — valid values depend on the type.
   */

/**
   * Available background options:
   *
   * { type: "marble",   variant: "cool" }  — Slate veins, cool-toned stone
   * { type: "marble",   variant: "warm" }  — Stone veins, warm-toned cream
   * { type: "marble",   variant: "lux"  }  — White veins on dark background
   * { type: "wave",     variant: "cool" }  — Sharp directional veins, slate
   * { type: "wave",     variant: "warm" }  — Sharp directional veins, stone
   * { type: "silk",     variant: "cool" }  — Soft blurred folds, slate
   * { type: "silk",     variant: "warm" }  — Soft blurred folds, cream
   * { type: "stucco",   variant: "cool" }  — Matte grain only, clean slate
   * { type: "stucco",   variant: "warm" }  — Matte grain only, clean cream
   * { type: "terrazzo",  variant: "cool" }  — Fragmented chips, slate
   * { type: "terrazzo",  variant: "warm" }  — Fragmented chips, stone
   */

  backgrounds: {
    "/":             { type: "wave",    variant: "cool" },
    "/cakes":        { type: "marble",  variant: "warm" },
    "/cupcakes":     { type: "wave",    variant: "cool" },
    "/number-cakes": { type: "marble",  variant: "warm" },
    "/collections":  { type: "wave",    variant: "cool" },
    "/pure":         { type: "marble",  variant: "lux"  },
    "/weddings":     { type: "stucco",    variant: "lux" },
    "/classes":      { type: "wave",    variant: "cool" },
    "/pricing":      { type: "stucco",  variant: "cool" },
    "/faq":          { type: "wave",    variant: "lux" },
    "/how-to-order": { type: "stucco",  variant: "warm" },
    "/about":        { type: "marble",  variant: "warm" },
    "/terms":        { type: "stucco",  variant: "cool" },
    "/privacy":      { type: "stucco",  variant: "cool" },
  } as Record<string, BackgroundConfig>,
  defaultBackground: {
    type: "wave",
    variant: "cool",
  } as BackgroundConfig,
}

export type siteConfig = typeof siteConfig