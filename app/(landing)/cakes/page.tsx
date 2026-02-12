// =============================================================================
// File: src/app/(landing)/cakes/page.tsx
// Description: Cakes landing page with hero258-inspired layout featuring
//   announcement badge, bold heading, CTA, and interactive expandable cards.
// =============================================================================

import type { Metadata } from "next"
import { CakesHero } from "./cakes-hero"
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
      <Cta />
    </>
  )
}