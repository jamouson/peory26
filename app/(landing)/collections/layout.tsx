// =============================================================================
// File: src/app/(landing)/collections/layout.tsx
// Description: Nested layout for /collections — warm marble variant.
// =============================================================================

import { MarbleBackground } from "@/components/ui/marble-background"

export default function CollectionsLayout({
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
