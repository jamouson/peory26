// =============================================================================
// File: app/(landing)/wedding/wedding-process.tsx
// Description: "From Concept to Centerpiece" bento section showing the 4-step
//   wedding cake process: Consultation → Tasting → Design → Delivery.
//   Typography aligned with CakeCollections & CustomerReviews sections.
//   Card mockups simplified for legibility at small sizes.
// =============================================================================

"use client"

import {
  Inbox,
  CakeSlice,
  Cherry,
  IceCreamCone,
  Citrus,
  Palette,
  Layers,
  Flower2,
  Sparkles,
  Gem,
  Truck,
  MapPin,
  Clock,
  CircleCheckBig,
  Package,
  Mail,
  Send,
} from "lucide-react"

// =============================================================================
// Mockup: Consultation – Simplified Email Thread
// =============================================================================

function MockupConsultation() {
  const threads = [
    {
      from: "PEORY",
      subject: "Your Wedding Cake Inquiry",
      time: "2m",
      unread: true,
    },
    {
      from: "You",
      subject: "Re: Wedding Cake Inquiry",
      time: "15m",
      unread: false,
    },
    {
      from: "PEORY",
      subject: "Mood Board & Inspiration",
      time: "1h",
      unread: false,
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
        <Inbox className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-semibold text-foreground">Inbox</span>
        <span className="ml-auto rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand-600 dark:text-brand-400">
          3
        </span>
      </div>

      {/* Threads */}
      <div className="flex-1">
        {threads.map((thread, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 border-b border-border/30 px-4 py-3 last:border-b-0 ${
              thread.unread
                ? "bg-brand-50/50 dark:bg-brand-950/20"
                : "bg-transparent"
            }`}
          >
            {/* Unread indicator */}
            <div
              className={`h-2 w-2 flex-none rounded-full ${
                thread.unread ? "bg-brand-500" : "bg-transparent"
              }`}
            />

            {/* Icon */}
            <div
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full ${
                thread.from === "PEORY"
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {thread.from === "PEORY" ? (
                <Mail className="h-3.5 w-3.5" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`truncate text-xs ${
                    thread.unread
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  }`}
                >
                  {thread.from}
                </span>
                <span className="flex-none text-[11px] tabular-nums text-muted-foreground">
                  {thread.time}
                </span>
              </div>
              <p
                className={`mt-0.5 truncate text-[11px] leading-snug ${
                  thread.unread
                    ? "font-medium text-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {thread.subject}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Mockup: Tasting – Flavor Selection Grid
// =============================================================================

function MockupTasting() {
  const flavors = [
    { name: "Vanilla Bean", icon: IceCreamCone, selected: true },
    { name: "Dark Chocolate", icon: CakeSlice, selected: false },
    { name: "Red Velvet", icon: Cherry, selected: true },
    { name: "Lemon Zest", icon: Citrus, selected: false },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card">
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-2.5">
        <span className="text-xs font-semibold text-foreground">
          Tasting Box
        </span>
      </div>

      {/* Flavors */}
      <div className="flex-1 p-3">
        <div className="grid grid-cols-2 gap-2">
          {flavors.map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${
                f.selected
                  ? "border-brand-500/40 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-950/20"
                  : "border-border/50"
              }`}
            >
              <f.icon
                className={`h-4 w-4 flex-none ${
                  f.selected
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground"
                }`}
              />
              <span className="truncate text-xs font-medium text-foreground">
                {f.name}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery note */}
        <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
          <Truck className="h-3.5 w-3.5 flex-none text-muted-foreground" />
          <span className="text-[11px] leading-snug text-muted-foreground">
            Pickup or Uber delivery
          </span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Mockup: Design – Sidebar Nav (tall card)
// =============================================================================

function MockupDesign() {
  const navItems = [
    { icon: Layers, label: "Tiers", count: 3, active: true },
    { icon: Palette, label: "Colors", count: null, active: false },
    { icon: Flower2, label: "Florals", count: 8, active: false },
    { icon: Gem, label: "Details", count: 5, active: false },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card">
      <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
      </div>

      {/* Nav items */}
      <div className="space-y-1 p-2.5">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${
              item.active ? "bg-brand-500/10" : ""
            }`}
          >
            <item.icon
              className={`h-4 w-4 flex-none ${
                item.active
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-muted-foreground"
              }`}
            />
            <span className="flex-1 text-xs font-medium text-foreground">
              {item.label}
            </span>
            {item.count !== null && (
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Canvas placeholder */}
      <div className="mt-auto border-t border-border/40 bg-muted/20 p-4">
        <div className="flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-border/50">
          <Sparkles className="h-6 w-6 text-muted-foreground/25" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Mockup: Delivery – Order Tracker (wide card)
// =============================================================================

function MockupDelivery() {
  const steps = [
    { label: "Baking Complete", done: true },
    { label: "Quality Check", done: true },
    { label: "En Route", done: false },
  ]

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card sm:flex-row">
      {/* Tracker */}
      <div className="flex-1 border-b border-border/40 p-5 sm:border-b-0 sm:border-r">
        <div className="mb-4 flex items-center gap-2.5">
          <Package className="h-4 w-4 text-brand-500" />
          <span className="text-xs font-semibold text-foreground">
            Order #2048
          </span>
        </div>

        <div className="space-y-3.5">
          {steps.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                  s.done
                    ? "bg-brand-500"
                    : "border-2 border-border bg-background"
                }`}
              >
                {s.done && (
                  <CircleCheckBig className="h-3 w-3 text-white" />
                )}
              </div>
              <span
                className={`text-xs ${
                  s.done
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="w-full bg-muted/5 p-5 sm:w-52">
        <div className="space-y-4">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 flex-none text-brand-500" />
            <div className="text-xs leading-relaxed">
              <div className="font-medium text-foreground">The Estate</div>
              <div className="text-muted-foreground">Alpine, NJ</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 flex-none text-brand-500" />
            <div className="text-xs leading-relaxed">
              <div className="font-medium text-foreground">Setup 3:00 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Bento Card Wrapper
// =============================================================================

interface BentoCardProps {
  title: string
  description: string
  className?: string
  children: React.ReactNode
}

function BentoCard({ title, description, className, children }: BentoCardProps) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-brand-500/20 hover:shadow-lg hover:shadow-brand-500/[0.04] ${className ?? ""}`}
    >
      {/* Text content */}
      <div className="relative z-10 px-6 pt-6">
        <h3 className="text-sm font-semibold text-brand-600 dark:text-brand-400">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Mockup area — bleeds to bottom edge of card */}
      <div className="relative z-10 mt-6 flex min-h-0 flex-1 px-4 pb-0">
        {children}
      </div>
    </div>
  )
}

// =============================================================================
// Main Section
// =============================================================================

export function WeddingProcess() {
  return (
    <section className="overflow-hidden bg-transparent pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ──
            Matches CakeCollections & CustomerReviews:
            - Centered layout
            - h2: text-3xl sm:text-5xl font-bold tracking-tight
            - p:  mt-6 text-lg text-muted-foreground
            - mb: mb-12 sm:mb-16
        */}
        <div className="animate-fade-up mb-12 text-center sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            From Concept to Centerpiece
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Creating your perfect wedding cake is a collaborative journey.
          </p>
        </div>

        {/* ── Bento Grid ── */}
        <div
          className="animate-fade-up grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-[auto_auto]"
          style={{ animationDelay: "150ms" }}
        >
          {/* Consultation */}
          <BentoCard
            title="Consultation"
            description="Personalized design discussion via email to explore your wedding theme."
            className="h-[320px] sm:h-auto sm:[grid-area:1/1/2/2]"
          >
            <MockupConsultation />
          </BentoCard>

          {/* Tasting */}
          <BentoCard
            title="Tasting"
            description="Experience our signature flavors with our curated tasting box."
            className="h-[320px] sm:h-auto sm:[grid-area:1/2/2/3]"
          >
            <MockupTasting />
          </BentoCard>

          {/* Design — Tall Card (spans 2 rows) */}
          <BentoCard
            title="Design"
            description="A custom design that captures your unique wedding style."
            className="h-[380px] sm:row-span-2 sm:h-auto sm:[grid-area:1/3/3/4]"
          >
            <MockupDesign />
          </BentoCard>

          {/* Delivery — Wide Card (spans 2 cols) */}
          <BentoCard
            title="Delivery"
            description="Professional delivery and setup at your venue for a picture-perfect centerpiece."
            className="min-h-[300px] sm:col-span-2 sm:h-auto sm:[grid-area:2/1/3/3]"
          >
            <MockupDelivery />
          </BentoCard>
        </div>
      </div>
    </section>
  )
}