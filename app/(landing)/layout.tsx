// =============================================================================
// File: src/app/(landing)/layout.tsx
// Description: Landing/storefront layout with wave background.
//   PageTransition replays the fade-up animation on every route change.
//   Keyframes defined once in globals.css — no duplicate <style> blocks needed.
// =============================================================================

import Footer from "@/components/ui/Footer"
import { MarbleBackground } from "@/components/ui/wave-background"
import { Navigation } from "@/components/ui/Navbar"
import { PageTransition } from "@/components/ui/page-transition"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen selection:bg-brand-100 selection:text-brand-700 dark:bg-gray-950">
      <MarbleBackground />
      <Navigation />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </div>
  )
}