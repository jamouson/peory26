"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

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
      className="collection-card group/col relative flex h-[450px] w-[320px] flex-none overflow-hidden rounded-[2.5rem] sm:h-[550px] sm:w-[450px]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <img
        src="https://placehold.co/600x800"
        alt={`${year} Collection`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out pointer-events-none group-hover/col:scale-105"
      />

      <div className="absolute inset-0 bg-black/10 transition-colors duration-300 pointer-events-none group-hover/col:bg-black/30" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-1 pointer-events-none">
        {label && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {label}
          </span>
        )}
        <span className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {year}
        </span>
        <span className="mt-4 flex items-center gap-2 text-sm font-medium text-white/90">
          Browse Gallery
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/col:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CakeCollections() {
  const [emblaRef] = useEmblaCarousel({ 
    align: "start", 
    containScroll: "trimSnaps",
    dragFree: true 
  })

  return (
    <>
      <style>{`
        .collection-card {
          opacity: 0;
          animation: slide-from-right 1s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }

        @keyframes slide-from-right {
          from { opacity: 0; transform: translateX(120px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .embla {
          overflow: hidden;
          cursor: grab;
        }
        .embla:active {
          cursor: grabbing;
        }
        .embla__container {
          display: flex;
          gap: 1.5rem;
          padding-left: max(1.5rem, calc((100vw - 1152px) / 2 + 1.5rem));
          padding-right: max(1.5rem, calc((100vw - 1152px) / 2 + 1.5rem));
        }
      `}</style>

      {/* Changed bg-background to bg-transparent */}
      <section className="py-24 sm:py-32 overflow-hidden bg-transparent">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 mb-12 sm:mb-16">
           <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Cake Collections
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A closer look at the artistry and creativity of our cakes, year by year.
          </p>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container pb-12">
            {collectionYears.map((item, i) => (
              <CollectionCard
                key={item.year}
                year={item.year}
                label={item.label}
                index={i}
              />
            ))}
            {/* Added a small spacer at the end to maintain the bleed effect */}
            <div className="w-10 flex-none sm:w-20" />
          </div>
        </div>
      </section>
    </>
  )
}