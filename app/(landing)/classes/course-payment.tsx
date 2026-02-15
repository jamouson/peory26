// =============================================================================
// File: src/app/(landing)/classes/course-payment.tsx
// Description: "Flexible Payment Options" section — displays accepted payment
//              methods (Venmo, Zelle, Credit Card) as minimal cards.
// =============================================================================

import { CreditCard } from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const paymentMethods = [
  {
    name: "Venmo",
    description: "Venmo® is the fast, safe, social way to pay.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T132458.047.webp",
  },
  {
    name: "Zelle",
    description: "Zelle® is an easy way to send money.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T132521.849.webp",
  },
  {
    name: "Credit Card",
    description: "3% processing fee applies.",
    icon: CreditCard,
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CoursePayment() {
  return (
    <section className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Flexible Payment Options
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            We offer multiple convenient payment methods to make enrollment
            easy.
          </p>
        </div>

        {/* Payment Method Cards */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:mt-16 sm:grid-cols-3">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex flex-col items-center rounded-2xl border border-foreground/[0.08] bg-card p-6 text-center transition-colors duration-300 hover:bg-card/80"
            >
              {/* Logo or Icon */}
              <div className="flex h-16 w-16 items-center justify-center">
                {method.image ? (
                  <img
                    src={method.image}
                    alt={method.name}
                    className="h-12 w-12 rounded-xl object-contain"
                  />
                ) : method.icon ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
                    <method.icon className="h-6 w-6 text-brand-600" />
                  </div>
                ) : null}
              </div>

              <h3 className="mt-3 text-lg font-semibold text-foreground">
                {method.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {method.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
