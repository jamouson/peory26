// =============================================================================
// File: src/app/(landing)/cakes/layout.tsx
// Description: Nested layout for /cakes — overrides the parent wave
//   background with the warm marble variant.
// =============================================================================

import { MarbleBackground } from "@/components/ui/marble-background"

export default function CakesLayout({
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