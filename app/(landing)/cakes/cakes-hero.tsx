// =============================================================================
// File: src/app/(landing)/cakes/cakes-hero.tsx
// Description: Hero section inspired by shadcnblocks hero258 — announcement
//   badge, bold heading, description, CTA, trust indicators, and interactive
//   expandable cards that reveal content on hover.
// =============================================================================

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Cake,
  Heart,
  Star,
  PartyPopper,
  Gift,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/Button"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const cakeCategories = [
  {
    id: "tiered",
    title: "Tiered Cakes",
    subtitle: "1–3 tiers of elegance",
    description:
      "From intimate single-tier centerpieces to grand three-tier showstoppers. Each layer is handcrafted with premium ingredients and decorated to match your vision.",
    icon: Cake,
    color: "from-rose-500/20 to-pink-500/20",
    accent: "text-rose-600 dark:text-rose-400",
    image: "🎂",
  },
  {
    id: "cupcakes",
    title: "Cupcakes",
    subtitle: "Bite-sized perfection",
    description:
      "Perfect for parties, favors, and everyday indulgence. Choose from our signature flavors or create a custom assortment for your event.",
    icon: Heart,
    color: "from-amber-500/20 to-orange-500/20",
    accent: "text-amber-600 dark:text-amber-400",
    image: "🧁",
  },
  {
    id: "number",
    title: "Number Cakes",
    subtitle: "Celebrate every milestone",
    description:
      "Show-stopping number and letter cakes adorned with fresh florals, macarons, and meringues. The sweetest way to mark birthdays and anniversaries.",
    icon: PartyPopper,
    color: "from-violet-500/20 to-purple-500/20",
    accent: "text-violet-600 dark:text-violet-400",
    image: "🔢",
  },
  {
    id: "custom",
    title: "Custom Designs",
    subtitle: "Your imagination, our craft",
    description:
      "Bring any concept to life — from sculpted 3D cakes to hand-painted watercolor designs. We specialize in turning your wildest ideas into edible art.",
    icon: Sparkles,
    color: "from-emerald-500/20 to-teal-500/20",
    accent: "text-emerald-600 dark:text-emerald-400",
    image: "✨",
  },
  {
    id: "wedding",
    title: "Wedding Cakes",
    subtitle: "For your forever moment",
    description:
      "Timeless, romantic, and unforgettable. From classic buttercream elegance to modern minimalist designs with sugar flowers and metallic accents.",
    icon: Gift,
    color: "from-sky-500/20 to-blue-500/20",
    accent: "text-sky-600 dark:text-sky-400",
    image: "💒",
  },
]

const trustIndicators = [
  { label: "5,000+", sublabel: "Cakes Delivered" },
  { label: "4.9★", sublabel: "Average Rating" },
  { label: "100%", sublabel: "Made Fresh" },
  { label: "NYC", sublabel: "Based & Shipped" },
]

// ---------------------------------------------------------------------------
// Expandable Card Component
// ---------------------------------------------------------------------------

function ExpandableCard({
  category,
  isActive,
  onHover,
  index,
}: {
  category: (typeof cakeCategories)[0]
  isActive: boolean
  onHover: () => void
  index: number
}) {
  const Icon = category.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onMouseEnter={onHover}
      className={`
        relative cursor-pointer overflow-hidden rounded-2xl border
        transition-all duration-500 ease-out
        ${
          isActive
            ? "flex-[2.5] border-foreground/10 bg-gradient-to-br shadow-xl dark:shadow-2xl"
            : "flex-1 border-foreground/5 bg-muted/50 hover:bg-muted/80"
        }
      `}
      style={{
        minHeight: "320px",
      }}
    >
      {/* Gradient background when active */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.color} transition-opacity duration-500 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        {/* Top section */}
        <div>
          <div
            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
              isActive
                ? "bg-foreground/10"
                : "bg-foreground/5"
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-colors duration-300 ${
                isActive ? category.accent : "text-muted-foreground"
              }`}
            />
          </div>

          <h3
            className={`text-lg font-semibold tracking-tight transition-colors duration-300 ${
              isActive ? "text-foreground" : "text-foreground/80"
            }`}
          >
            {category.title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {category.subtitle}
          </p>
        </div>

        {/* Expanded content */}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-4"
            >
              <p className="text-sm leading-relaxed text-foreground/70">
                {category.description}
              </p>
              <Link
                href={`/cakes/${category.id}`}
                className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${category.accent} transition-colors hover:underline`}
              >
                Explore {category.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Large emoji watermark when active */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute -bottom-4 -right-2 text-8xl"
              aria-hidden
            >
              {category.image}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Hero Component
// ---------------------------------------------------------------------------

export function CakesHero() {
  const [activeCard, setActiveCard] = useState(0)

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent dark:from-rose-950/20" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-36 sm:px-6 sm:pt-44 lg:px-8">
        {/* Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-foreground/10 bg-background/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>Now accepting orders for Spring 2025</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Handcrafted Cakes for{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-pink-400">
              Every Occasion
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            From intimate celebrations to grand weddings, each PEORY cake is a
            work of art — baked fresh with premium ingredients and decorated with
            meticulous attention to detail.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Link href="/sign-in">
            <Button variant="primary" className="gap-2">
              Order Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost">Learn More</Button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14 flex items-center justify-center gap-8 sm:gap-12"
        >
          {trustIndicators.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {item.label}
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                {item.sublabel}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Interactive Expandable Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 hidden gap-3 lg:flex"
        >
          {cakeCategories.map((category, index) => (
            <ExpandableCard
              key={category.id}
              category={category}
              isActive={activeCard === index}
              onHover={() => setActiveCard(index)}
              index={index}
            />
          ))}
        </motion.div>

        {/* Mobile: Stacked cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:hidden">
          {cakeCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <Link
                  href={`/cakes/${category.id}`}
                  className={`group flex items-start gap-4 rounded-xl border border-foreground/5 bg-gradient-to-br p-5 transition-all hover:border-foreground/10 hover:shadow-md ${category.color}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/10">
                    <Icon className={`h-5 w-5 ${category.accent}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}