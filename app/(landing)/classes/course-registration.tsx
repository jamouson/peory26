// =============================================================================
// File: src/app/(landing)/classes/course-registration.tsx
// Description: "How to Register" section — 3-step process with images,
//              numbered steps, and CTA. Registration deadline callout.
// =============================================================================

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/Button"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const steps = [
  {
    number: "01",
    title: "Class Inquiry Form",
    description: "Fill out our online form with your personal details.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Copy-of-Untitled-7.webp",
  },
  {
    number: "02",
    title: "Schedule Course Date(s)",
    description:
      "Choose from available dates that best fit your schedule.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T201650.918.webp",
  },
  {
    number: "03",
    title: "Secure Your Spot",
    description:
      "Make full payment to confirm your enrollment in the course.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-98.webp",
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseRegistration() {
  return (
    <section className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            How to Register
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Follow our simple registration process to secure your spot in our
            exclusive buttercream piping courses.
          </p>
          {/* Deadline badge */}
          <div className="mt-6 inline-flex rounded-full border border-foreground/10 bg-background/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span className="text-muted-foreground">
              Registration Deadline:{" "}
              <span className="font-semibold text-foreground">
                5–7 weeks
              </span>{" "}
              prior to course start
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-12 grid gap-8 sm:mt-16 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="group flex flex-col">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={step.image}
                  alt={step.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Step number overlay */}
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-sm font-bold text-white">
                  {step.number}
                </div>
              </div>

              {/* Text */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector line (hidden on last item and mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block">
                  <div className="mt-4 h-px w-full bg-foreground/[0.08]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center sm:mt-16">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScM232094RDD22T-zipPpq7C7gImSVIA1zRkoVM-ZN107Zclw/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" className="gap-2">
              Class Inquiry Form
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
