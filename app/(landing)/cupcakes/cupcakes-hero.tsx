// =============================================================================
// File: src/app/(landing)/cupcakes/cupcakes-hero.tsx
// Description: Hero section for the cupcakes landing page with occasion cards.
//   Spacing optimized for consistent vertical rhythm across all breakpoints.
//   NOTE: @keyframes fade-up and .animate-fade-up live in globals.css.
//   Only card-specific hover/transition styles remain in the <style> block.
// =============================================================================

"use client"

import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Heart,
  PartyPopper,
  Baby,
  Briefcase,
  Cake,
  GlassWater,
  GraduationCap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/Button"
import type { LucideIcon } from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface CupcakeCategory {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
}

const weddingCard: CupcakeCategory = {
  id: "weddings",
  title: "Weddings",
  description:
    "Elegant, multi-tiered wedding cakes tailored to your theme and taste, creating a stunning centerpiece for your big day.",
  icon: Heart,
  accent: "text-rose-300",
}

const cupcakeCategories: CupcakeCategory[] = [
  {
    id: "childrens-birthdays",
    title: "Children's Birthdays",
    description:
      "Fun, vibrant cakes that capture the excitement of childrens of all ages.",
    icon: PartyPopper,
    accent: "text-amber-300",
  },
  {
    id: "corporate-events",
    title: "Corporate Events",
    description:
      "Custom anniversary cake that reflects your journey together.",
    icon: Briefcase,
    accent: "text-violet-300",
  },
  {
    id: "adult-birthdays",
    title: "Adult Birthdays",
    description:
      "Celebrate this Korean tradition with a beautifully crafted cake that blends cultural symbolism with personalized designs for your child\u2019s special milestone.",
    icon: Cake,
    accent: "text-sky-300",
  },
  {
    id: "baby-showers",
    title: "Baby Showers",
    description:
      "Cakes designed to match your d\u00e9cor, perfect for welcoming the new arrival.",
    icon: Baby,
    accent: "text-pink-300",
  },
  {
    id: "graduations",
    title: "Graduations",
    description:
      "Cake featuring school colors, diplomas, or graduation caps.",
    icon: GraduationCap,
    accent: "text-emerald-300",
  },
  {
    id: "engagements",
    title: "Engagements",
    description:
      "Custom cakes for any event, from birthdays to engagements.",
    icon: GlassWater,
    accent: "text-yellow-300",
  },
]

const trustIndicators = [
  { label: "5,000+", sublabel: "Cupcakes Delivered" },
  { label: "4.9\u2605", sublabel: "Average Rating" },
  { label: "100%", sublabel: "Made Fresh" },
  { label: "NYC", sublabel: "Based & Shipped" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunkPairs<T>(arr: T[]): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2))
  }
  return result
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function CategoryCard({
  category,
  className = "",
  index = 0,
}: {
  category: CupcakeCategory
  className?: string
  index?: number
}) {
  const Icon = category.icon

  return (
    <Link
      href={`/cupcakes/${category.id}`}
      className={`cake-card group/card relative flex overflow-hidden rounded-2xl ${className}`}
      style={{ animationDelay: `${400 + index * 80}ms` }}
    >
      <img
        src="https://placehold.co/600x400"
        alt={category.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover/card:scale-105"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 transition-opacity duration-300 group-hover/card:opacity-0">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {category.title}
        </h3>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-black/10 p-5 opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 ${category.accent}`} />
          <h3 className="text-lg font-semibold tracking-tight text-white">
            {category.title}
          </h3>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {category.description}
        </p>

        <span
          className={`pointer-events-auto mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${category.accent}`}
        >
          View Collection
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/card:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Card Row
// ---------------------------------------------------------------------------

function CardRow({
  cards,
  startIndex,
}: {
  cards: CupcakeCategory[]
  startIndex: number
}) {
  return (
    <div className="card-row flex flex-col gap-4 sm:flex-row">
      {cards.map((category, i) => (
        <CategoryCard
          key={category.id}
          category={category}
          className="h-72 sm:h-80"
          index={startIndex + i}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Hero
// ---------------------------------------------------------------------------

export function CupcakesHero() {
  const rows = chunkPairs(cupcakeCategories)

  return (
    <>
      {/* Card-specific styles only — fade-up keyframes live in globals.css */}
      <style>{`
        .cake-card {
          opacity: 0;
          animation: fade-up 0.5s ease-out forwards;
        }

        @media (min-width: 640px) {
          .card-row .cake-card {
            flex: 1 1 0%;
            transition: flex-grow 0.5s cubic-bezier(0.33, 1, 0.68, 1);
          }
          .card-row:has(.cake-card:hover) .cake-card {
            flex-grow: 0.6;
          }
          .card-row .cake-card:hover {
            flex-grow: 1.4 !important;
          }
        }
      `}</style>

      <section className="relative overflow-hidden pb-16 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent dark:from-rose-950/20" />

        <div className="relative mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44 lg:px-8">
          {/* Announcement Badge */}
          <div className="animate-fade-up flex justify-center">
            <Badge
              variant="outline"
              className="gap-2 rounded-full border-foreground/10 bg-background/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Now accepting orders for 2026</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Badge>
          </div>

          {/* Heading */}
          <div
            className="animate-fade-up mt-8 text-center sm:mt-10"
            style={{ animationDelay: "100ms" }}
          >
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Cupcakes
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:mt-6">
              Our cupcakes offer classic and unique flavors, made with premium
              ingredients for an unforgettable taste. We use fresh, high-quality
              buttercream and fillings in every creation.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up mt-10 flex items-center justify-center gap-4"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/sign-in">
              <Button variant="primary" className="gap-2 cursor-pointer">
                Inquire Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" className="cursor-pointer">Learn More</Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div
            className="animate-fade-up mt-12 flex items-center justify-center gap-8 sm:mt-16 sm:gap-12"
            style={{ animationDelay: "300ms" }}
          >
            {trustIndicators.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {item.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {item.sublabel}
                </div>
              </div>
            ))}
          </div>

          {/* Occasion Cards */}
          <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-4 sm:mt-16">
            <CategoryCard
              category={weddingCard}
              className="h-72 sm:h-96"
              index={0}
            />

            {rows.map((row, i) => (
              <CardRow key={i} cards={row} startIndex={1 + i * 2} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}