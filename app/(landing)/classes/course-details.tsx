// =============================================================================
// File: src/app/(landing)/classes/course-details.tsx
// Description: Course Details section — overview of class structure with
//              feature highlights and a 2×2 image grid.
// =============================================================================

import { Clock, Users, CalendarDays, GraduationCap } from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: GraduationCap,
    label: "Two Levels",
    description: "Beginner and Advanced",
  },
  {
    icon: CalendarDays,
    label: "4 Days",
    description: "4–5 hours each day",
  },
  {
    icon: Users,
    label: "One-on-One",
    description: "Focused, personal learning",
  },
  {
    icon: Clock,
    label: "Flexible Schedule",
    description: "Choose dates that fit you",
  },
]

const images = [
  {
    src: "https://peorycake.com/wp-content/uploads/2024/11/ools.webp",
    alt: "Piping tools and materials",
  },
  {
    src: "https://peorycake.com/wp-content/uploads/2024/11/ools-5-1.webp",
    alt: "Buttercream flowers close-up",
  },
  {
    src: "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-25.gif",
    alt: "Flower piping demonstration",
  },
  {
    src: "https://peorycake.com/wp-content/uploads/2024/11/ools-6.webp",
    alt: "Finished floral arrangement",
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseDetails() {
  return (
    <section id="course-details" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Course Details
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Choose Beginner or Advanced level, each includes 4 days of
            personalized, one-on-one instruction, 4–5 hours per day.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-4 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center rounded-2xl border border-foreground/[0.08] bg-card p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
                <feature.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.label}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Image Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
