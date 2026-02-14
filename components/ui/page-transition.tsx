// =============================================================================
// File: src/components/ui/page-transition.tsx
// Description: Wrapper that replays the fade-up entrance animation on every
//   route change. Uses key={pathname} to force React to unmount/remount the
//   wrapper div, which re-triggers the CSS animation.
// =============================================================================

"use client"

import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  )
}
