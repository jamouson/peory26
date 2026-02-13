// =============================================================================
// File: src/app/(landing)/flavors/layout.tsx
// Description: Nested layout for /flavors — warm marble variant.
// =============================================================================

import { MarbleBackground } from "@/components/ui/marble-background"

export default function FlavorsLayout({
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
