// =============================================================================
// File: src/app/(landing)/classes/classes-faq-cta.tsx
// Description: FAQ call-to-action section at the bottom of the classes page.
//              Reusable pattern — can be imported on any page that needs a
//              FAQ redirect with a branded card.
// =============================================================================

import Link from "next/link"
import { ArrowRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/Button"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClassesFaqCta() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-foreground/[0.08] bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950">
            <HelpCircle className="h-7 w-7 text-brand-600" />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Have a Question?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            We're here to help! Whether you're curious about class details,
            scheduling, or anything in between, check out our answers to the
            most asked questions.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/faq">
              <Button variant="primary" className="gap-2">
                Visit FAQ
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScM232094RDD22T-zipPpq7C7gImSVIA1zRkoVM-ZN107Zclw/viewform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="gap-2">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
