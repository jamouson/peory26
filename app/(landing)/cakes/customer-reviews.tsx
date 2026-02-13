"use client"

import { useCallback, useEffect, useState } from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

// ---------------------------------------------------------------------------
// Data & Types
// ---------------------------------------------------------------------------

interface Review {
  id: string
  quote: string
  author_name: string
  source: string
  rating: number
}

const reviews: Review[] = [
  { id: "f1", quote: "Cakes were so beautiful that my guests couldn't believe the flowers were edible. Not only did it look great, it tasted great too.", author_name: "Allison S.", source: "Google", rating: 5 },
  { id: "f2", quote: "Erika created two cakes for our engagement party and both were absolutely beautiful and delicious! We couldn't be happier.", author_name: "Ashok G.", source: "The Knot", rating: 5 },
  { id: "f3", quote: "The attention to detail on the sugar flowers was mind-blowing. It was truly the centerpiece of our wedding.", author_name: "Sarah M.", source: "WeddingWire", rating: 5 },
  { id: "f4", quote: "The best wedding cake experience! The flavors were unique and the design was exactly what we dreamed of.", author_name: "James K.", source: "Google", rating: 5 },
  { id: "f5", quote: "Absolute perfection. The cakes were beautiful and everyone was in awe. They were almost too pretty to eat!", author_name: "Lilian", source: "Yelp", rating: 5 },
  { id: "f6", quote: "The most delicious and elegant cake we've ever had. Our guests are still talking about the blueberry mascarpone filling!", author_name: "Michael R.", source: "Google", rating: 5 },
  { id: "f7", quote: "Beyond our expectations. The sugar work is true artistry. It felt almost criminal to cut into something so stunning.", author_name: "Jessica P.", source: "The Knot", rating: 5 },
  { id: "f8", quote: "Incredible service and even better cake. Erika is a true professional and made the whole process so easy for our big day.", author_name: "David L.", source: "WeddingWire", rating: 5 },
]

// ---------------------------------------------------------------------------
// Slide gap in pixels — single source of truth for Embla + Tailwind
// ---------------------------------------------------------------------------
const SLIDE_GAP = 24 // matches gap-6 (1.5rem)

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CustomerReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      // Let Embla handle the gap natively so it calculates widths correctly
      slidesToScroll: 1,
      containScroll: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  // Track selected index for optional dot indicators or future use
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="pt-24 sm:pt-32 overflow-hidden bg-transparent">
      {/* Centered Header */}
      <div className="mx-auto max-w-3xl px-6 text-center mb-12 sm:mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Customer Reviews
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          The sweetest proof of our dedication to every celebration.
        </p>
      </div>

      <div className="relative">
        {/* Viewport — overflow-hidden is the only critical style */}
        <div className="overflow-hidden" ref={emblaRef}>
          {/*
            Container: Embla needs display:flex + backface-visibility:hidden.
            The negative margin + slide padding trick gives us consistent gaps
            that Embla can measure correctly on first paint.
          */}
          <div
            className="flex touch-pan-y backface-hidden"
            style={{ marginLeft: `-${SLIDE_GAP}px` }}
          >
            {reviews.map((r) => (
              <div
                key={r.id}
                className="min-w-0 shrink-0 grow-0"
                style={{ paddingLeft: `${SLIDE_GAP}px` }}
              >
                {/* Card */}
                <div className="flex h-[400px] w-[320px] sm:h-[450px] sm:w-[500px] flex-col justify-between rounded-[2.5rem] border border-foreground/[0.08] bg-card p-8 sm:p-10 transition-colors">
                  <div>
                    <Quote className="mb-6 h-8 w-8 text-rose-300/40" />
                    <blockquote className="text-lg font-medium leading-relaxed text-foreground/80 sm:text-xl italic">
                      &ldquo;{r.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-foreground/[0.08] pt-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {r.author_name}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {r.source}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8">
          <button
            onClick={scrollPrev}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-foreground/[0.08] bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70" />
          </button>
          <button
            onClick={scrollNext}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-foreground/[0.08] bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6 text-foreground/70" />
          </button>
        </div>
      </div>
    </section>
  )
}