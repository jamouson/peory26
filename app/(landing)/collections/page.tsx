// =============================================================================
// File: src/app/(landing)/collections/page.tsx
// Description: Collections page — just the carousel and CTA.
// =============================================================================

import type { Metadata } from "next"
import { Collections } from "../collections"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Collections | PEORY",
  description:
    "Browse our curated galleries showcasing the artistry and creativity of our cakes — year by year.",
}

export default function CollectionsPage() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Collections />
      <Cta />
    </main>
  )
}
