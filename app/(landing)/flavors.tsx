// =============================================================================
// File: src/app/(landing)/cakes/cake-flavors.tsx
// Description: RTL-scrolling horizontal carousel of cake flavors.
//              Refactored for consistent sizing and grid alignment.
// =============================================================================

"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const flavors = [
  {
    id: "chocolate",
    title: "Chocolate",
    description: "Valrhona chocolate cake with Valrhona chocolate ganache buttercream",
    image: "https://media.peorycake.com/chocolate.webp",
  },
  {
    id: "blueberry",
    title: "Blueberry Mascarpone",
    description: "Genoise (sponge cake) with organic blueberry compote and mascarpone cream cheese frosting",
    image: "https://media.peorycake.com/blueberry.webp",
  },
  {
    id: "lemon",
    title: "Lemon",
    description: "Organic lemon cake with organic lemon curd and lemon curd buttercream",
    image: "https://media.peorycake.com/lemon.webp",
  },
  {
    id: "caramel",
    title: "Caramel",
    description: "Madagascar Vanilla bean Cake, Homemade Caramel Sauce buttercream",
    image: "https://media.peorycake.com/caramel.webp",
  },
  {
    id: "matcha",
    title: "Matcha",
    description: "Organic matcha cake with Organic matcha crème anglaise buttercream",
    image: "https://media.peorycake.com/greentea.webp",
  },
  {
    id: "vanilla",
    title: "Vanilla",
    description: "Madagascar Vanilla bean Cake with Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/vanilla.webp",
  },
  {
    id: "strawberry",
    title: "Strawberry",
    description: "Madagascar Vanilla bean Cake with organic strawberry compote and Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/strawberry.webp",
  },
  {
    id: "raspberry",
    title: "Raspberry",
    description: "Madagascar Vanilla bean Cake with organic raspberry compote and organic raspberry crème anglaise buttercream",
    image: "https://media.peorycake.com/raspberry.webp",
  },
  {
    id: "earlgrey",
    title: "Earl Grey",
    description: "Taylors of Harrogate Earl Grey Cake with Earl Grey jam and Earl Grey pâte à bombe buttercream",
    image: "https://media.peorycake.com/earlgrey.webp",
  },
]

// ---------------------------------------------------------------------------
// Flavor Card
// ---------------------------------------------------------------------------

function FlavorCard({
  flavor,
  index,
}: {
  flavor: (typeof flavors)[0]
  index: number
}) {
  return (
    <div
      className="group/card relative flex h-[350px] w-[260px] flex-none overflow-hidden rounded-3xl bg-gray-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary sm:h-[480px] sm:w-[360px]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Background Image */}
      <img
        src={flavor.image}
        alt={flavor.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover/card:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover/card:opacity-80" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 z-10 w-full p-6 sm:p-8 text-left">
        <div className="transform transition-transform duration-300 group-hover/card:-translate-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {flavor.title}
          </h3>

          {/* Description reveals on hover */}
          <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100 group-hover/card:mt-2">
            <p className="line-clamp-3 overflow-hidden text-sm leading-relaxed text-white/90">
              {flavor.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CakeFlavors() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    direction: "rtl",
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

  // Set initial state outside of effect
  useEffect(() => {
    if (emblaApi) onSelect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi])

  const scrollLeft = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollRight = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="bg-transparent py-24 sm:py-32 overflow-hidden">
      <style>{`
        .group\\/card {
          opacity: 0;
          animation: slide-from-left 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }
        @keyframes slide-from-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Flavors & Fillings
          </h2>
          <p className="ml-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Our cakes offer classic and unique flavors, made with premium ingredients.
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full">
        <div className="w-full cursor-grab active:cursor-grabbing" ref={emblaRef} dir="rtl">
          <div
            className="flex gap-4 sm:gap-6"
            style={{
              paddingRight: 'max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))',
              paddingLeft: 'max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))',
            }}
          >
            {flavors.map((flavor, i) => (
              <div key={flavor.id} dir="ltr" className="flex-none">
                <FlavorCard flavor={flavor} index={i} />
              </div>
            ))}

            {/* Spacer */}
            <div className="w-4 flex-none sm:w-12" />
          </div>
        </div>

        {/* Navigation Arrows — just outside the cards with slight spacing */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 flex w-full max-w-[82rem] items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Left arrow — fades in once user has scrolled */}
          <button
            onClick={scrollLeft}
            className={`pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105 ${
              canScrollPrev ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70" />
          </button>

          {/* Right arrow — visible first */}
          <button
            onClick={scrollRight}
            className={`pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105 ${
              canScrollNext ? "opacity-100" : "pointer-events-none opacity-0"
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