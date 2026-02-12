import Footer from "@/components/ui/Footer"
import { Navigation } from "@/components/ui/Navbar"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen selection:bg-brand-100 selection:text-brand-700 dark:bg-gray-950">
      <Navigation />
      {children}
      <Footer />
    </div>
  )
}
