// =============================================================================
// File: src/app/(landing)/layout.tsx
// Description: Landing/storefront layout with dynamic page background.
//   Background type + variant is determined per-route via siteConfig.backgrounds.
// =============================================================================

import Footer from "@/components/ui/Footer"
import { PageBackground } from "@/components/ui/page-background"
import { Navigation } from "@/components/ui/Navbar"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen selection:bg-brand-100 selection:text-brand-700 dark:bg-gray-950">
      <PageBackground />
      <Navigation />
      {children}
      <Footer />
    </div>
  )
}