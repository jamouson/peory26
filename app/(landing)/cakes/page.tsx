// =============================================================================
// File: src/app/(landing)/cakes/page.tsx
// Description: Cakes landing page with hero, collections, flavors, and CTA.
// =============================================================================

import type { Metadata } from "next"
import { CakesHero } from "./cakes-hero"
import { CakeCollections } from "./cake-collections"
import { CakeFlavors } from "./cake-flavors"
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
      <Cta />
    </>
  )
}