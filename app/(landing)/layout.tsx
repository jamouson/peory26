// =============================================================================
// File: src/app/(landing)/layout.tsx
// Description: Landing/storefront layout with wave background.
// =============================================================================

import Footer from "@/components/ui/Footer"
import { MarbleBackground } from "@/components/ui/wave-background"
import { Navigation } from "@/components/ui/Navbar"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen selection:bg-brand-100 selection:text-brand-700 dark:bg-gray-950">
      <MarbleBackground />
      <Navigation />
      {children}
      <Footer />
    </div>
  )
}