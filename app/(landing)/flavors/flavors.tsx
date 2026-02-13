// =============================================================================
// File: src/app/(landing)/flavors/flavors.tsx
// Description: Centered horizontal carousel of flavors using Embla.
//   FIX 1: Container layout uses Tailwind classes (flex, gap) instead of a
//          <style> tag — prevents FOUT where items flash vertically before
//          the style tag is parsed.
//   FIX 2: Carousel starts invisible (opacity-0) and fades in only after
//          Embla has initialized and snapped to startIndex — prevents the
//          visible jump from left-aligned to centered.
// =============================================================================

"use client"

import { useState, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const flavors = [
  {
    id: "chocolate",
    title: "Chocolate",
    description:
      "Valrhona chocolate cake with Valrhona chocolate ganache buttercream",
    image: "https://media.peorycake.com/chocolate.webp",
  },
  {
    id: "blueberry",
    title: "Blueberry Mascarpone",
    description:
      "Genoise (sponge cake) with organic blueberry compote and mascarpone cream cheese frosting",
    image: "https://media.peorycake.com/blueberry.webp",
  },
  {
    id: "lemon",
    title: "Lemon",
    description:
      "Organic lemon cake with organic lemon curd and lemon curd buttercream",
    image: "https://media.peorycake.com/lemon.webp",
  },
  {
    id: "caramel",
    title: "Caramel",
    description:
      "Madagascar Vanilla bean Cake, Homemade Caramel Sauce buttercream",
    image: "https://media.peorycake.com/caramel.webp",
  },
  {
    id: "matcha",
    title: "Matcha",
    description:
      "Organic matcha cake with Organic matcha crème anglaise buttercream",
    image: "https://media.peorycake.com/greentea.webp",
  },
  {
    id: "vanilla",
    title: "Vanilla",
    description:
      "Madagascar Vanilla bean Cake with Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/vanilla.webp",
  },
  {
    id: "strawberry",
    title: "Strawberry",
    description:
      "Madagascar Vanilla bean Cake with organic strawberry compote and Madagascar vanilla bean pâte à bombe buttercream",
    image: "https://media.peorycake.com/strawberry.webp",
  },
  {
    id: "raspberry",
    title: "Raspberry",
    description:
      "Madagascar Vanilla bean Cake with organic raspberry compote and organic raspberry crème anglaise buttercream",
    image: "https://media.peorycake.com/raspberry.webp",
  },
  {
    id: "earlgrey",
    title: "Earl Grey",
    description:
      "Taylors of Harrogate Earl Grey Cake with Earl Grey jam and Earl Grey pâte à bombe buttercream",
    image: "https://media.peorycake.com/earlgrey.webp",
  },
]

// ---------------------------------------------------------------------------
// Flavor Card
// ---------------------------------------------------------------------------

function FlavorCard({
  flavor,
}: {
  flavor: (typeof flavors)[0]
}) {
  return (
    <div className="group/flavor relative h-[400px] w-[280px] flex-none overflow-hidden rounded-[2.5rem] border border-white/10 sm:h-[500px] sm:w-[380px]">
      <img
        src={flavor.image}
        alt={flavor.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out pointer-events-none group-hover/flavor:scale-105"
      />

      <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-none group-hover/flavor:bg-black/50" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end p-6 sm:p-8">
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {flavor.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80 opacity-0 transition-opacity duration-300 group-hover/flavor:opacity-100">
          {flavor.description}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function Flavors() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    dragFree: true,
    startIndex: Math.floor(flavors.length / 2),
  })

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    // Embla has initialized and snapped to startIndex — safe to show
    const onInit = () => setReady(true)
    emblaApi.on("init", onInit)
    // In case init already fired
    if (emblaApi.internalEngine()) setReady(true)
    return () => {
      emblaApi.off("init", onInit)
    }
  }, [emblaApi])

  return (
    <section className="pt-36 sm:pt-44 pb-8 sm:pb-12 overflow-hidden bg-transparent">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Flavors & Fillings
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Our cakes offer classic and unique flavors, made with premium
            ingredients for an unforgettable taste. We use fresh, high-quality
            buttercream and fillings in every creation.
          </p>
        </div>
      </div>

      <div
        ref={emblaRef}
        className={`overflow-hidden cursor-grab active:cursor-grabbing transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-6 pb-12">
          {flavors.map((flavor) => (
            <FlavorCard key={flavor.id} flavor={flavor} />
          ))}
        </div>
      </div>
    </section>
  )
}
