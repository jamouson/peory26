// =============================================================================
// File: src/app/(landing)/cakes/cake-collections.tsx
// =============================================================================

"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const collectionYears = [
  { year: "2026", label: "Latest" },
  { year: "2025", label: "" },
  { year: "2024", label: "" },
  { year: "2023", label: "" },
]

// ---------------------------------------------------------------------------
// Collection Card
// ---------------------------------------------------------------------------

function CollectionCard({
  year,
  label,
  index,
}: {
  year: string
  label: string
  index: number
}) {
  return (
    <Link
      href={`/cakes/collections/${year}`}
      className="collection-card group/col relative flex h-64 sm:h-72 overflow-hidden rounded-2xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <img
        src="https://placehold.co/600x400"
        alt={`${year} Collection`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover/col:scale-105"
      />

      <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover/col:bg-black/50" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-1">
        {label && (
          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {label}
          </span>
        )}
        <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {year}
        </span>
        <span className="mt-2 flex items-center gap-1 text-sm font-medium text-white/70 transition-colors duration-300 group-hover/col:text-white">
          Browse Gallery
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/col:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CakeCollections() {
  return (
    <>
      <style>{`
        .collection-card {
          opacity: 0;
          animation: fade-up 0.5s ease-out forwards;
        }
      `}</style>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {/* Section header */}
        <div className="animate-fade-up text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cake Collections
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            Explore our curated galleries showcasing the artistry and creativity
            of our cakes, year by year. Browse through our collections for
            inspiration and a closer look at the cakes that made these years
            truly special.
          </p>
        </div>

        {/* Year cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-4">
          {collectionYears.map((item, i) => (
            <CollectionCard
              key={item.year}
              year={item.year}
              label={item.label}
              index={i}
            />
          ))}
        </div>
      </section>
    </>
  )
}