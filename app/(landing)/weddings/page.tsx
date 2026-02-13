// =============================================================================
// File: src/app/(landing)/wedding/page.tsx
// Description: Wedding landing page.
// =============================================================================

import CodeExample from "@/components/ui/CodeExample"
import Cta from "@/components/ui/Cta"
import Features from "@/components/ui/Features"
import Hero from "./Hero"
import { WeddingProcess } from "./wedding-process"
import LogoCloud from "@/components/ui/LogoCloud"
import { CakeCollections } from "./cake-collections"
import { CakeFlavors } from "../flavors"

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
    
      <CakeCollections />
           <WeddingProcess />
           <CakeFlavors />
      <CodeExample />
     
      <Features />
      <Cta />
    </main>
  )
}