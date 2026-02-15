// =============================================================================
// File: src/app/(landing)/number-cakes/layout.tsx
// Description: Nested layout for /number-cakes — overrides the parent wave
//   background with the warm marble variant.
// =============================================================================

import { StuccoBackground } from "@/components/ui/backgrounds/stucco-bg"

export default function NumberCakesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StuccoBackground variant="warm" />
      {children}
    </>
  )
}
