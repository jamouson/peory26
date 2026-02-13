// =============================================================================
// File: src/app/(landing)/cakes/page.tsx
// Description: Cakes landing page. Marble background provided by cakes layout.
//   FIX: Wrapped in <main className="flex flex-col overflow-hidden"> to match
//        home page and FAQ page patterns — prevents horizontal overflow from
//        carousel animations (translateX) and embla 100vw padding calculations
//        from breaking mobile zoom behavior.
// =============================================================================

import type { Metadata } from "next"
import { CakesHero } from "./cakes-hero"
import { CakeCollections } from "./cake-collections"
import { CakeFlavors } from "../flavors"
import { CustomerReviews } from "../customer-reviews"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Cakes | PEORY",
  description:
    "Explore our handcrafted cake collection — from elegant tiered cakes to custom designs for every occasion.",
}

export default function CakesPage() {
  return (
    <main className="flex flex-col overflow-hidden">
      <CakesHero />
      <CakeCollections />
      <CakeFlavors />
      <CustomerReviews />
      <Cta />
    </main>
  )
}