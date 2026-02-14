// =============================================================================
// File: src/app/(landing)/wedding/page.tsx
// Description: Wedding landing page with staggered fade-up entrance animations
//   matching the cakes page and landing page pattern.
// =============================================================================

import CodeExample from "@/components/ui/CodeExample"
import Cta from "@/components/ui/Cta"
import Hero from "./Hero"
import { WeddingProcess } from "./wedding-process"
import LogoCloud from "@/components/ui/LogoCloud"
import { Collections } from "./cake-tiers"
import { CakeFlavors } from "../flavors"
import { CustomerReviews } from "../customer-reviews"

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-fade-up {
          opacity: 0;
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>

      <main className="flex flex-col overflow-hidden">
        <div className="section-fade-up">
          <Hero />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "150ms" }}>
          <LogoCloud />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "250ms" }}>
          <Collections />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "350ms" }}>
          <WeddingProcess />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "450ms" }}>
          <CakeFlavors />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "550ms" }}>
          <CodeExample />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "650ms" }}>
          <CustomerReviews />
        </div>
        <div className="section-fade-up" style={{ animationDelay: "750ms" }}>
          <Cta />
        </div>
      </main>
    </>
  )
}