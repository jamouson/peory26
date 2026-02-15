// =============================================================================
// File: src/components/ui/page-background.tsx
// Description: Reads the current pathname and renders the correct background
//   from siteConfig via the registry.
//
//   Performance:
//   - Config resolution is memoized per pathname
//   - Component lookup is O(1) via registry
//   - Individual components are React.memo'd and won't re-render unless
//     the variant prop actually changes
//   - View transition handling is done via CSS (see globals.css) targeting
//     the [data-page-bg] attribute on background elements
//
//   NOTE: The component is rendered directly (no wrapper div) to avoid
//   creating a stacking context that would trap the -z-10 backgrounds
//   and break their positioning behind page content.
// =============================================================================

"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/app/siteConfig"
import { backgroundRegistry } from "@/components/ui/backgrounds/registry"
import type { BackgroundConfig } from "@/components/ui/backgrounds/types"

function resolveConfig(pathname: string): BackgroundConfig {
  // 1. Exact match
  if (siteConfig.backgrounds[pathname]) {
    return siteConfig.backgrounds[pathname]
  }

  // 2. Closest parent prefix (longest wins)
  const match = Object.entries(siteConfig.backgrounds)
    .filter(([path]) => path !== "/" && pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]

  if (match) return match[1]

  // 3. Fallback
  return siteConfig.defaultBackground
}

export function PageBackground() {
  const pathname = usePathname()

  const { type, variant } = useMemo(() => resolveConfig(pathname), [pathname])

  const Component = backgroundRegistry[type]

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[PageBackground] Unknown background type "${type}" for "${pathname}". ` +
          `Register it in components/ui/backgrounds/registry.ts`
      )
    }
    return null
  }

  return <Component variant={variant} />
}