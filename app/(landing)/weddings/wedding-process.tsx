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
} from "lucide-react"

// =============================================================================
// Mockup: Consultation – Email Inbox UI
// =============================================================================

function MockupConsultation() {
  const emails = [
    {
      from: "PEORY",
      subject: "Your Wedding Cake Inquiry",
      preview: "Thank you for reaching out! Let's start discussing...",
      time: "2m",
      unread: true,
    },
    {
      from: "You",
      subject: "Re: Wedding Cake Inquiry",
      preview: "We're thinking a 3-tier with florals...",
      time: "15m",
      unread: false,
    },
    {
      from: "PEORY",
      subject: "Mood Board & Inspiration",
      preview: "Here are some designs that match...",
      time: "1h",
      unread: false,
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card">
      <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2">
        <Inbox className="h-3.5 w-3.5 text-brand-500" />
        <span className="text-xs font-semibold text-foreground">Inbox</span>
        <span className="ml-auto rounded-full bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
          3
        </span>
      </div>
      <div className="flex-1">
        {emails.map((email, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 border-b border-border/30 px-3 py-2.5 ${
              email.unread ? "bg-brand-50/50 dark:bg-brand-950/20" : "bg-transparent"
            }`}
          >
            <div className={`mt-1 h-1.5 w-1.5 flex-none rounded-full ${email.unread ? "bg-brand-500" : "bg-transparent"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] ${email.unread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                  {email.from}
                </span>
                <span className="text-[10px] text-muted-foreground">{email.time}</span>
              </div>
              <p className={`mt-0.5 truncate text-[10px] ${email.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {email.subject}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Mockup: Tasting – Flavor Selection Card
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
      <div className="border-b border-border/40 px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Tasting Box</span>
      </div>
      <div className="flex-1 p-3">
        <div className="grid grid-cols-2 gap-2">
          {flavors.map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                f.selected ? "border-brand-500/40 bg-brand-50/50 dark:border-brand-500/30" : "border-border/50"
              }`}
            >
              <f.icon className={`h-3.5 w-3.5 ${f.selected ? "text-brand-600" : "text-muted-foreground"}`} />
              <span className="truncate text-[10px] font-medium text-foreground">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2">
          <Truck className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground leading-tight">Delivery available</span>
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
      <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2.5">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <div className="space-y-0.5 p-2">
        {navItems.map((item) => (
          <div key={item.label} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 ${item.active ? "bg-brand-500/10" : ""}`}>
            <item.icon className={`h-3.5 w-3.5 ${item.active ? "text-brand-600" : "text-muted-foreground"}`} />
            <span className="flex-1 text-[10px] text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-border/40 bg-muted/20 p-3">
        <div className="flex h-24 w-full items-center justify-center rounded-md border-2 border-dashed border-border/50">
          <Sparkles className="h-5 w-5 text-muted-foreground/30" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Mockup: Delivery – Responsive Tracker (wide card)
// =============================================================================

function MockupDelivery() {
  const steps = [
    { label: "Baking Complete", done: true },
    { label: "Quality Check", done: true },
    { label: "En Route", done: false },
  ]

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-card sm:flex-row">
      {/* Tracker: Stacks on mobile */}
      <div className="flex-1 border-b border-border/40 p-4 sm:border-b-0 sm:border-r">
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-brand-500" />
          <span className="whitespace-nowrap text-xs font-semibold text-foreground">Order #2048</span>
        </div>
        <div className="space-y-3">
          {steps.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <div className={`flex h-4 w-4 items-center justify-center rounded-full ${s.done ? "bg-brand-500" : "border-2 border-border"}`}>
                {s.done && <CircleCheckBig className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className={`text-[10px] ${s.done ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Details: Stacks on mobile */}
      <div className="w-full bg-muted/5 p-4 sm:w-48">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3 w-3 text-brand-500" />
            <div className="text-[10px] leading-tight">
              <div className="font-medium">The Estate</div>
              <div className="text-muted-foreground">Alpine, NJ</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3 w-3 text-brand-500" />
            <div className="text-[10px] leading-tight">
              <div className="font-medium">Setup 3:00 PM</div>
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
      <div className="relative z-10 px-6 pt-6">
        <h3 className="text-sm font-semibold text-brand-600 dark:text-brand-400">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="relative z-10 mt-6 flex min-h-0 flex-1 px-4">{children}</div>
    </div>
  )
}

// =============================================================================
// Main Section
// =============================================================================

export function WeddingProcess() {
  return (
    // ✅ py-16 sm:py-24 lg:py-32 → pt-20 sm:pt-24 pb-16 sm:pb-20
    //    Non-carousel section pattern — consistent with CustomerReviews.
    //    Removed the lg:py-32 third breakpoint that was unique to this component.
    <section className="bg-transparent pt-20 sm:pt-24 pb-16 sm:pb-20">
      {/* ✅ px-6 → px-4 sm:px-6 (mobile padding consistency with all other sections) */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ✅ mb-14 sm:mb-20 → mb-10 sm:mb-14 (consistent with all other section headers) */}
        <div className="animate-fade-up mb-10 text-center sm:mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Our Process
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From Concept to Centerpiece
          </h2>
          {/* ✅ mt-5 → mt-4 (consistent heading-to-subtext grouping) */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Creating your perfect wedding cake is a collaborative journey.
          </p>
        </div>

        {/* Bento Grid */}
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

          {/* Design - Tall Card */}
          <BentoCard
            title="Design"
            description="A custom design that captures your unique wedding style."
            className="h-[380px] sm:row-span-2 sm:h-auto sm:[grid-area:1/3/3/4]"
          >
            <MockupDesign />
          </BentoCard>

          {/* Delivery - Wide Card */}
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