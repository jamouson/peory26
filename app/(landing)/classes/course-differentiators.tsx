// =============================================================================
// File: src/app/(landing)/classes/course-differentiators.tsx
// Description: "What sets this course apart?" section — side-by-side layout
//              with image and differentiator list.
// =============================================================================

import { ArrowRight, Star, Target, Award } from "lucide-react"
import { Button } from "@/components/Button"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const differentiators = [
  {
    icon: Star,
    title: "One-on-One Attention",
    description:
      "Learn directly from an expert cake designer in a private setting for fully personalized instruction.",
  },
  {
    icon: Target,
    title: "Market-Ready Skills",
    description:
      "Focus on practical, marketable skills you can apply immediately to start or grow your cake business.",
  },
  {
    icon: Award,
    title: "Real-World Experience",
    description:
      "Learn from an experienced cake designer with an established customer portfolio and proven techniques.",
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseDifferentiators() {
  return (
    <section className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="group relative aspect-[4/3] overflow-hidden rounded-[2.5rem]">
            <img
              src="https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T154338.501.webp"
              alt="Buttercream flower piping class in progress"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              What Sets This Course Apart?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Learn directly from an expert cake designer in a small class for
              personalized, market-ready skills.
            </p>

            {/* Differentiator List */}
            <div className="mt-10 space-y-8">
              {differentiators.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
                    <item.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScM232094RDD22T-zipPpq7C7gImSVIA1zRkoVM-ZN107Zclw/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
