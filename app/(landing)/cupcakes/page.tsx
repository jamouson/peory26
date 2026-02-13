// =============================================================================
// File: src/app/(landing)/cupcakes/page.tsx
// Description: Cupcakes landing page. Marble background provided by cupcakes layout.
//   FIX: Wrapped in <main className="flex flex-col overflow-hidden"> to match
//        home page and FAQ page patterns — prevents horizontal overflow from
//        carousel animations (translateX) and embla 100vw padding calculations
//        from breaking mobile zoom behavior.
// =============================================================================

import type { Metadata } from "next"
import { CupcakesHero } from "./cupcakes-hero"
import { CupcakeCollections } from "./cupcake-collections"
import { CupcakeFlavors } from "./cupcake-flavors"
import { CustomerReviews } from "./customer-reviews"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Cupcakes | PEORY",
  description:
    "Discover our handcrafted cupcakes — classic and unique flavors made with premium ingredients for every occasion.",
}

export default function CupcakesPage() {
  return (
    <main className="flex flex-col overflow-hidden">
      <CupcakesHero />
      <CupcakeCollections />
      <CupcakeFlavors />
      <CustomerReviews />
      <Cta />
    </main>
  )
}
