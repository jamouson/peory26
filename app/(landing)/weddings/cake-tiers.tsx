// =============================================================================
// File: src/app/(landing)/collections/collections.tsx
// Description: Refactored carousel with optimized card sizing and improved UX.
// =============================================================================

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const cakeTiers = [
  { tier: "One Tier", label: "Intimate", slug: "one-tier", image: "https://placehold.co/600x800/f5e6d3/8b6914?text=One+Tier" },
  { tier: "Two Tier", label: "Classic", slug: "two-tier", image: "https://placehold.co/600x800/f5e6d3/8b6914?text=Two+Tier" },
  { tier: "Three Tier", label: "Grand", slug: "three-tier", image: "https://placehold.co/600x800/f5e6d3/8b6914?text=Three+Tier" },
  { tier: "Four Tier", label: "Luxe", slug: "four-tier", image: "https://placehold.co/600x800/f5e6d3/8b6914?text=Four+Tier" },
]

// ---------------------------------------------------------------------------
// Collection Card
// ---------------------------------------------------------------------------

function CollectionCard({
  tier,
  label,
  slug,
  image,
  index,
}: {
  tier: string
  label: string
  slug: string
  image: string
  index: number
}) {
  return (
    <Link
      href={`/cakes/${slug}`}
      className="group/card relative flex h-[350px] w-[260px] flex-none overflow-hidden rounded-3xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary sm:h-[480px] sm:w-[360px]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background Image with Zoom Effect */}
      <img
        src={image}
        alt={`${tier} Cake`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover/card:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover/card:opacity-80" />

      {/* Badge (Top Right) */}
      {label && (
        <div className="absolute right-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-colors group-hover/card:bg-white/30">
            {label}
          </span>
        </div>
      )}

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 z-10 w-full p-6 sm:p-8">
        <div className="transform transition-transform duration-300 group-hover/card:-translate-y-2">
          <span className="block text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {tier}
          </span>

          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/90 opacity-0 transition-all duration-300 group-hover/card:opacity-100 sm:opacity-100">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function Collections() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi) onSelect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="bg-transparent py-24 sm:py-32 overflow-hidden">
      <style>{`
        .group\\/card {
          opacity: 0;
          animation: slide-in 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Cakes for Every Celebration
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          Whether you&apos;re planning an intimate ceremony or a lavish
          reception, we have the perfect cake size for your celebration.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        <div className="w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div
            className="flex gap-4 sm:gap-6"
            style={{
              paddingLeft: 'max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))',
              paddingRight: 'max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))',
            }}
          >
            {cakeTiers.map((item, i) => (
              <CollectionCard
                key={item.slug}
                tier={item.tier}
                label={item.label}
                slug={item.slug}
                image={item.image}
                index={i}
              />
            ))}

            {/* End Spacer */}
            <div className="w-4 flex-none sm:w-12" />
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 flex w-full max-w-[82rem] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={scrollNext}
            className={`pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105 ${
              canScrollNext ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70" />
          </button>

          <button
            onClick={scrollPrev}
            className={`pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105 ${
              canScrollPrev ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-foreground/70" />
          </button>
        </div>
      </div>
    </section>
  )
}