// =============================================================================
// File: src/app/(landing)/cakes/customer-reviews.tsx
// Description: Infinite looping carousel centered on screen.
// =============================================================================

"use client"

import { useCallback } from "react"
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
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
          alt="Google"
          className={className}
        />
      )
    case "The Knot":
      return (
        <img
          src="/logos/the-knot.webp"
          alt="The Knot"
          className={className}
        />
      )
    case "WeddingWire":
      return (
        <img
          src="/logos/weddingwire.webp"
          alt="WeddingWire"
          className={className}
        />
      )
    case "Yelp":
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Yelp_Logo.svg"
          alt="Yelp"
          className={className}
        />
      )
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Review Card
// ---------------------------------------------------------------------------

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <div
      className="review-card group/review relative flex h-[350px] w-[290px] flex-none flex-col justify-between overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:border-border/80 hover:shadow-md sm:h-[420px] sm:w-[400px] sm:p-8"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Quote className="absolute right-6 top-6 h-12 w-12 text-muted-foreground/10 rotate-180" />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <div className="mb-4 flex gap-1">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <blockquote className="text-lg font-medium leading-relaxed text-foreground/90 italic sm:text-xl">
          &ldquo;{review.quote}&rdquo;
        </blockquote>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-border/40 pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-foreground">
            {review.author_name}
          </span>
          <span className="text-xs text-muted-foreground">
            Verified Review
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 backdrop-blur-sm">
          <SourceLogo
            source={review.source}
            className="h-5 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function CustomerReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      containScroll: false,
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="bg-transparent py-24 sm:py-32 overflow-hidden relative">
      <style>{`
        .review-card {
          opacity: 0;
          animation: slide-up-fade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Customer Reviews
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          The sweetest proof of our dedication to every celebration.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative w-full">
        <div className="w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="min-w-0 flex-[0_0_auto] px-2 sm:px-3"
              >
                <ReviewCard review={review} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="pointer-events-none absolute inset-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 sm:px-12">
          <button
            onClick={scrollPrev}
            className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6 text-foreground/70" />
          </button>
          <button
            onClick={scrollNext}
            className="pointer-events-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-foreground/[0.08] bg-background/90 backdrop-blur-sm shadow-sm transition-all hover:bg-background hover:scale-105"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6 text-foreground/70" />
          </button>
        </div>
      </div>
    </section>
  )
}