// =============================================================================
// File: src/app/(landing)/wedding/page.tsx
// Description: Wedding landing page.
// =============================================================================

import CodeExample from "@/components/ui/CodeExample"
import Cta from "@/components/ui/Cta"
import Hero from "./Hero"
import { WeddingProcess } from "./wedding-process"
import LogoCloud from "@/components/ui/LogoCloud"
import { CakeTiers } from "./cake-tiers"
import { CakeFlavors } from "../flavors"
import { CustomerReviews } from "../customer-reviews"

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
      <CakeTiers />
           <WeddingProcess />
           <CakeFlavors />
      <CodeExample />
     <CustomerReviews />

      <Cta />
    </main>
  )
}