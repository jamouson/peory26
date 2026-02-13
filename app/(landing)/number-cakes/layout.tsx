// =============================================================================
// File: src/app/(landing)/number-cakes/layout.tsx
// Description: Nested layout for /number-cakes — overrides the parent wave
//   background with the warm marble variant.
// =============================================================================

import { MarbleBackground } from "@/components/ui/marble-background"

export default function NumberCakesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarbleBackground variant="warm" />
      {children}
    </>
  )
}
