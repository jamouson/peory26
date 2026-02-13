// =============================================================================
// File: src/app/(landing)/flavors/page.tsx
// Description: Flavors page — centered carousel and CTA.
// =============================================================================

import type { Metadata } from "next"
import { Flavors } from "./flavors"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Flavors & Fillings | PEORY",
  description:
    "Classic and unique flavors made with premium ingredients — fresh, high-quality buttercream and fillings in every creation.",
}

export default function FlavorsPage() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Flavors />
      <Cta />
    </main>
  )
}
