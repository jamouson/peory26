// =============================================================================
// File: src/app/(landing)/cupcakes/layout.tsx
// Description: Nested layout for /cupcakes — overrides the parent wave
//   background with the warm marble variant.
// =============================================================================

import { MarbleBackground } from "@/components/ui/marble-background"

export default function CupcakesLayout({
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
