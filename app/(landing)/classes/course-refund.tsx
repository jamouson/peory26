// =============================================================================
// File: src/app/(landing)/classes/course-refund.tsx
// Description: "Refund Policy" section — tiered refund timeline displayed
//              as clear visual cards with status indicators.
// =============================================================================

import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const refundTiers = [
  {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    status: "Full Refund",
    timeframe: "More than 1 month before start date",
  },
  {
    icon: AlertCircle,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    status: "Partial Refund",
    timeframe: "2–4 weeks before start date",
  },
  {
    icon: XCircle,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    status: "No Refund",
    timeframe: "Less than 1 week before start date",
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CourseRefund() {
  return (
    <section className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Refund Policy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            We understand that circumstances can change, and we've structured
            our policy to be fair and accommodating.
          </p>
        </div>

        {/* Refund Tiers */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:mt-16 sm:grid-cols-3">
          {refundTiers.map((tier) => (
            <div
              key={tier.status}
              className="flex flex-col items-center rounded-2xl border border-foreground/[0.08] bg-card p-6 text-center"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${tier.bgColor}`}
              >
                <tier.icon className={`h-6 w-6 ${tier.iconColor}`} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {tier.status}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {tier.timeframe}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
