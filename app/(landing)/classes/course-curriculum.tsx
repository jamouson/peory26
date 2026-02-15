// =============================================================================
// File: src/app/(landing)/classes/course-curriculum.tsx
// Description: "Who is our course for?" section with curriculum highlights.
//              Uses a dark-themed card (rounded-3xl) for visual contrast.
// =============================================================================

import {
  Flower2,
  Snowflake,
  Cake,
  Clock,
  ClipboardList,
  Archive,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const curriculumItems = [
  {
    icon: Flower2,
    title: "Buttercream Flower Piping",
    description:
      "Using a perfected Italian meringue buttercream technique for realistic blooms.",
  },
  {
    icon: Snowflake,
    title: "Create a Variety of Flowers",
    description:
      "Master roses, peonies, ranunculus, and more — building a full floral vocabulary.",
  },
  {
    icon: Archive,
    title: "Flower Storage Techniques",
    description:
      "Learn proper methods to store piped flowers so they stay fresh and intact.",
  },
  {
    icon: Cake,
    title: "Decorate a Full Cake",
    description:
      "Apply everything you've learned by decorating a real cake on the last day.",
  },
  {
    icon: Clock,
    title: "Timing Strategies",
    description:
      "Baking and piping timing strategies for efficient workflow management.",
  },
  {
    icon: ClipboardList,
    title: "Order Process & Workflow",
    description:
      "Overview of cake order process, timeline, and professional workflow.",
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseCurriculum() {
  return (
    <section id="advanced" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Dark feature section */}
        <div className="overflow-hidden rounded-3xl bg-gray-950 p-8 sm:p-12 lg:p-16">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-400">
              Curriculum
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Who Is Our Course For?
            </h2>
            <p className="mt-4 text-lg text-gray-400 leading-relaxed">
              This course is ideal for serious flower cake designers — or
              aspiring ones — looking to enhance their buttercream flower
              techniques and develop profitable skills.
            </p>
          </div>

          {/* Curriculum Grid */}
          <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {curriculumItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-colors duration-300 hover:bg-white/[0.06]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20">
                  <item.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
