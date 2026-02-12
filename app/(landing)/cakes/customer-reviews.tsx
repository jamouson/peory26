// =============================================================================
// File: src/app/(landing)/cakes/customer-reviews.tsx
// Description: Customer Reviews carousel using Embla Carousel.
// =============================================================================

"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Review {
  id: string
  quote: string
  author_name: string
  source: string
  rating: number
  reviewed_at: string | null
}

// ---------------------------------------------------------------------------
// Google inline SVG
// ---------------------------------------------------------------------------

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Source config
// ---------------------------------------------------------------------------

type SourceInfo = {
  label: string
  logo: string | null
  rounded?: boolean
}

const sourceConfig: Record<string, SourceInfo> = {
  google:      { label: "Google",          logo: null, rounded: true },
  theknot:     { label: "theknot.com",     logo: "/logos/theknot.png" },
  weddingwire: { label: "weddingwire.com", logo: "/logos/weddingwire.png" },
  yelp:        { label: "Yelp",            logo: "/logos/yelp.png", rounded: true },
  zola:        { label: "Zola",            logo: "/logos/zola.png" },
  facebook:    { label: "Facebook",        logo: "/logos/facebook.png", rounded: true },
  instagram:   { label: "Instagram",       logo: "/logos/instagram.png", rounded: true },
}

// ---------------------------------------------------------------------------
// Fallback reviews
// ---------------------------------------------------------------------------

const fallbackReviews: Review[] = [
  {
    id: "fallback-1",
    quote: "Cakes were beautiful that my guests couldn't believe the flowers were edible. Not only did the cake look great it tasted great too.",
    author_name: "Allison S.",
    source: "google",
    rating: 5,
    reviewed_at: "2024-06-01",
  },
  {
    id: "fallback-2",
    quote: "Erika created two cakes for our engagement party and both were absolutely beautiful and delicious!",
    author_name: "Ashok G.",
    source: "theknot",
    rating: 5,
    reviewed_at: "2024-05-01",
  },
  {
    id: "fallback-3",
    quote: "The cakes were beautiful and everyone was in awe of them. They were too pretty to eat. But eat them we did and they were delicious!",
    author_name: "Lilian",
    source: "weddingwire",
    rating: 5,
    reviewed_at: "2024-04-01",
  },
  {
    id: "fallback-4",
    quote: "Absolute perfection. The attention to detail on the sugar flowers was mind-blowing.",
    author_name: "Sarah M.",
    source: "theknot",
    rating: 5,
    reviewed_at: "2024-03-15",
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateQuote(text: string, max = 180): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…"
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}

function PlatformLogo({ source }: { source: string }) {
  const config = sourceConfig[source?.toLowerCase()]
  if (!config) return null

  if (source.toLowerCase() === "google") {
    return <GoogleLogo className="h-9 w-9" />
  }

  if (config.logo) {
    return (
      <Image
        src={config.logo}
        alt={config.label}
        width={36}
        height={36}
        className={`h-9 w-auto object-contain ${config.rounded ? "rounded-full" : ""}`}
      />
    )
  }

  return null
}

function ReviewCard({ review }: { review: Review }) {
  const source = sourceConfig[review.source?.toLowerCase()]

  return (
    <div className="flex h-full select-none flex-col justify-between rounded-2xl border border-foreground/[0.06] bg-card p-6 shadow-sm transition-all duration-300 hover:border-foreground/10 hover:shadow-md sm:p-8">
      <div className="mb-4">
        <Quote className="h-7 w-7 text-rose-200 dark:text-rose-900/60" />
      </div>
      <blockquote className="mb-6 flex-1 text-[15px] leading-relaxed text-foreground/80">
        &ldquo;{truncateQuote(review.quote)}&rdquo;
      </blockquote>

      {/* Footer: [logo + author] left — [stars] right */}
      <div className="flex items-center justify-between border-t border-foreground/[0.06] pt-5">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <PlatformLogo source={review.source} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {review.author_name}
            </span>
            {source && (
              <span className="text-xs text-muted-foreground">
                {source.label}
              </span>
            )}
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const MAX_DOTS = 3

export function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  // ── Silently upgrade with live data when available ──
  useEffect(() => {
    let cancelled = false
    fetch("/api/reviews/testimonials")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Review[]) => {
        if (!cancelled && data.length > 0) setReviews(data)
      })
      .catch(() => {/* keep fallback reviews */})
    return () => { cancelled = true }
  }, [])

  // ── Embla Events ──
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const onInit = useCallback(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    onInit()
  }, [onInit])

  // Reinit carousel when reviews swap from fallback → live data
  useEffect(() => {
    if (emblaApi) emblaApi.reInit()
  }, [emblaApi, reviews])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/30 to-transparent dark:via-rose-950/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Customer Reviews
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Our cakes are crafted with love, and our customers&apos; reviews are
            the sweetest proof of that. Discover how we&apos;ve made their
            celebrations deliciously memorable.
          </p>
        </div>

        {/* Carousel */}
        <div className="group relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-4 flex touch-pan-y">
              {reviews.map((r) => (
                <div key={r.id} className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                  <div className="h-full">
                    <ReviewCard review={r} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/10 bg-background/90 shadow-sm backdrop-blur transition-all hover:bg-background hover:shadow-md sm:-left-8 sm:h-12 sm:w-12"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-foreground/70" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/10 bg-background/90 shadow-sm backdrop-blur transition-all hover:bg-background hover:shadow-md sm:-right-8 sm:h-12 sm:w-12"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-foreground/70" />
              </button>
            </>
          )}
        </div>

        {/* Dots — capped at MAX_DOTS */}
        {scrollSnaps.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {scrollSnaps.slice(0, MAX_DOTS).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex || (index === MAX_DOTS - 1 && selectedIndex >= MAX_DOTS - 1)
                    ? "w-6 bg-rose-500"
                    : "w-2 bg-foreground/15 hover:bg-foreground/25"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}