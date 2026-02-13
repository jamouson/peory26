// =============================================================================
// File: src/app/(landing)/number-cakes/page.tsx
// Description: Number Cakes landing page. Marble background provided by layout.
//   FIX: Wrapped in <main className="flex flex-col overflow-hidden"> to match
//        home page and FAQ page patterns — prevents horizontal overflow from
//        carousel animations (translateX) and embla 100vw padding calculations
//        from breaking mobile zoom behavior.
// =============================================================================

import type { Metadata } from "next"
import { NumberCakesHero } from "./number-cakes-hero"
import { NumberCakeCollections } from "./number-cake-collections"
import { CakeFlavors } from "../flavors"
import { CustomerReviews } from "../customer-reviews"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Number Cakes | PEORY",
  description:
    "Personalized number cakes adorned with buttercream flowers for birthdays and anniversaries. Elegant designs crafted to make your celebrations memorable.",
}

export default function NumberCakesPage() {
  return (
    <main className="flex flex-col overflow-hidden">
      <NumberCakesHero />
      <NumberCakeCollections />
      <CakeFlavors />
      <CustomerReviews />
      <Cta />
    </main>
  )
}
