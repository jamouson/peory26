// =============================================================================
// File: src/app/(landing)/cakes/page.tsx
// Description: Cakes landing page. Marble background provided by cakes layout.
//   CTA is wrapped with reduced top margin since CustomerReviews now has proper
//   bottom padding — prevents the 224px dead zone on desktop.
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
      {/* ✅ Spacing wrapper — overrides Cta's own mt-32 sm:mt-56 which created
          a 224px dead zone on desktop. Now that CustomerReviews has pb-16 sm:pb-20,
          we only need a small nudge here. The wrapper's negative margin cancels out
          the CTA's built-in top margin so the rhythm stays consistent. */}
      <div className="-mt-24 sm:-mt-44">
        <Cta />
      </div>
    </>
  )
}