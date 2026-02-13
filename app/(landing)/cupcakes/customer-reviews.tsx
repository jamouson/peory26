// =============================================================================
// File: src/app/(landing)/cupcakes/customer-reviews.tsx
// Description: Looping review carousel with autoplay using Embla.
//   Spacing optimized for consistent vertical rhythm across all breakpoints.
// =============================================================================

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
// Platform Logos
// ---------------------------------------------------------------------------

function SourceLogo({ source, className = "" }: { source: string; className?: string }) {
  switch (source) {
    case "Google":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )

    case "The Knot":
      return (
        <svg
          className={className}
          viewBox="0 0 100 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <text
            x="0"
            y="18"
            fontFamily="Georgia, serif"
            fontSize="16"
            fontWeight="bold"
            fontStyle="italic"
            fill="#00B2A9"
          >
            the knot
          </text>
        </svg>
      )

    case "WeddingWire":
      return (
        <svg
          className={className}
          viewBox="0 0 120 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <text
            x="0"
            y="17"
            fontFamily="Arial, sans-serif"
            fontSize="14"
            fontWeight="bold"
            fill="#EE5F4A"
          >
            WeddingWire
          </text>
        </svg>
      )

    case "Yelp":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.81 2.08c-.23-.08-.49.02-.6.23L7.97 10.3c-.12.22-.05.5.16.64l2.07 1.35c.1.07.22.1.34.1.13 0 .25-.05.35-.14l4.6-4.6c.16-.16.19-.41.07-.6L13.4 2.3a.48.48 0 0 0-.59-.22z"
            fill="#FF1A1A"
          />
          <path
            d="M7.59 13.44c-.24-.08-.5.04-.6.27l-1.8 4.17c-.1.23-.01.5.2.63l2.2 1.32c.22.13.5.07.64-.14l2.1-3.24c.14-.22.1-.5-.1-.66l-2.3-2.2a.48.48 0 0 0-.34-.15z"
            fill="#FF1A1A"
          />
          <path
            d="M14.68 13.3a.48.48 0 0 0-.36.12l-2.4 2.1c-.2.17-.24.46-.1.68l2 3.3c.14.22.42.3.65.17l2.26-1.24c.23-.12.33-.4.24-.64l-1.86-4.17a.48.48 0 0 0-.43-.32z"
            fill="#FF1A1A"
          />
          <path
            d="M17.69 10.74l-3.7.8c-.26.06-.43.3-.4.57l.38 3.82c.03.27.25.47.52.47h2.6c.26 0 .48-.18.52-.44l.52-4.62c.03-.27-.17-.52-.44-.6z"
            fill="#FF1A1A"
          />
          <path
            d="M6.94 10.98l-3.74-.64c-.27-.05-.53.12-.6.39l-.52 2.56c-.06.26.1.52.36.6l3.76 1.14c.26.08.54-.06.64-.31l.5-3.06c.06-.27-.13-.6-.4-.68z"
            fill="#FF1A1A"
          />
        </svg>
      )

    default:
      return null
  }
}

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
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  // Track selected index for optional dot indicators or future use
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    // ✅ pt-24 sm:pt-32 → pt-20 sm:pt-24, added pb-16 sm:pb-20 (was missing entirely!)
    <section className="pt-20 sm:pt-24 pb-16 sm:pb-20 overflow-hidden bg-transparent">
      {/* ✅ Centered Header — px-6 → px-4 sm:px-6, mb-12 sm:mb-16 → mb-10 sm:mb-14 */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center mb-10 sm:mb-14">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Customer Reviews
        </h2>
        {/* ✅ mt-6 → mt-4 (tighter heading grouping) */}
        <p className="mt-4 text-lg text-muted-foreground">
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
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {r.author_name}
                      </span>
                      {/* Platform logo + source name */}
                      <div className="flex items-center gap-1.5">
                        <SourceLogo
                          source={r.source}
                          className={
                            r.source === "Google" || r.source === "Yelp"
                              ? "h-4 w-4"
                              : "h-4 w-auto"
                          }
                        />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {r.source}
                        </span>
                      </div>
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
            className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70" />
          </button>
          <button
            onClick={scrollNext}
            className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/80 backdrop-blur-sm hover:bg-background transition-all"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6 text-foreground/70" />
          </button>
        </div>
      </div>
    </section>
  )
}