// =============================================================================
// File: src/app/(landing)/cakes/page.tsx
// Description: Cakes landing page. Marble background provided by cakes layout.
// =============================================================================

import type { Metadata } from "next"
import { CakesHero } from "./cakes-hero"
import { CakeCollections } from "./cake-collections"
import { CakeFlavors } from "./cake-flavors"
import { CustomerReviews } from "./customer-reviews"
import Cta from "@/components/ui/Cta"

export const metadata: Metadata = {
  title: "Cakes | PEORY",
  description:
    "Explore our handcrafted cake collection — from elegant tiered cakes to custom designs for every occasion.",
}

export default function CakesPage() {
  return (
    <>
      <CakesHero />
      <CakeCollections />
      <CakeFlavors />
      <CustomerReviews />
      <Cta />
    </>
  )
}