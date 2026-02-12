// =============================================================================
// File: components/TestimonialCarousel.tsx
// Description: Rotating testimonial carousel for auth pages (sign-in, waitlist).
//   Fetches real customer reviews from /api/reviews/testimonials, shuffles them
//   with a bias toward newer reviews, and rotates with smooth fade transitions.
// =============================================================================

"use client"

import { useState, useEffect, useCallback } from "react"

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
// Source label mapping
// ---------------------------------------------------------------------------

const sourceLabels: Record<string, string> = {
  google: "Google",
  theknot: "The Knot",
  weddingwire: "WeddingWire",
  yelp: "Yelp",
  zola: "Zola",
  facebook: "Facebook",
  instagram: "Instagram",
  manual: "",
  other: "",
}

// ---------------------------------------------------------------------------
// Shuffle with newer-first bias
// Newer reviews get higher weight so they appear earlier in rotation,
// but there's still randomness so it doesn't feel repetitive.
// ---------------------------------------------------------------------------

function weightedShuffle(reviews: Review[]): Review[] {
  // Already sorted newest-first from API
  const weighted = reviews.map((review, index) => ({
    review,
    // Newer items (lower index) get higher weight
    weight: Math.random() * Math.pow(0.85, index),
  }))

  weighted.sort((a, b) => b.weight - a.weight)
  return weighted.map((w) => w.review)
}

// ---------------------------------------------------------------------------
// Fallback reviews in case API fails
// ---------------------------------------------------------------------------

const fallbackReviews: Review[] = [
  {
    id: "fallback-1",
    quote:
      "My jaw dropped when I saw the cake, I can't emphasize enough how gorgeous it was, just perfection. Everyone was so impressed and loved the cake as well. She truly is a talented artist and baker.",
    author_name: "Jacqueline K.",
    source: "theknot",
    rating: 5,
    reviewed_at: "2022-10-04",
  },
  {
    id: "fallback-2",
    quote:
      "We cannot thank Erika enough for the absolutely stunning cake she created for our special day. She is truly both an artist and an incredibly talented pastry chef. The design was beyond what we imagined, and the cake itself was delicious, people are still raving about it!",
    author_name: "Amanda & Kim",
    source: "google",
    rating: 5,
    reviewed_at: "2025-09-12",
  },
  {
    id: "fallback-3",
    quote:
      "You know how some cakes are beautiful but only taste so-so? Well, this is NOT the case here. These cakes are stunning, elegant and yet taste amazing with high quality ingredients.",
    author_name: "Julie",
    source: "weddingwire",
    rating: 5,
    reviewed_at: "2022-09-22",
  },
]

// ---------------------------------------------------------------------------
// Star rating
// ---------------------------------------------------------------------------

function Stars({ count }: { count: number }) {
  return (
    <div className="mb-4 flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 fill-current text-yellow-400"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_WORDS = 45

/** Truncate to MAX_WORDS and add "..." if needed */
function truncateQuote(quote: string): string {
  const words = quote.split(/\s+/)
  if (words.length <= MAX_WORDS) return quote
  return words.slice(0, MAX_WORDS).join(" ") + "..."
}

/** Longer quotes get more display time: 4s base + 80ms per word, capped at 10s */
function getDisplayDuration(quote: string): number {
  const wordCount = quote.split(/\s+/).length
  return Math.min(4000 + wordCount * 80, 10000)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TestimonialCarousel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [loaded, setLoaded] = useState(false)

  // Fetch reviews on mount
  useEffect(() => {
    let cancelled = false

    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews/testimonials")
        if (!res.ok) throw new Error("Failed to fetch")

        const data: Review[] = await res.json()

        if (!cancelled && data.length > 0) {
          setReviews(weightedShuffle(data))
          setLoaded(true)
        }
      } catch {
        // Use fallback reviews
        if (!cancelled) {
          setReviews(weightedShuffle(fallbackReviews))
          setLoaded(true)
        }
      }
    }

    fetchReviews()
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-rotate with dynamic timing based on quote length
  useEffect(() => {
    if (reviews.length <= 1) return

    const current = reviews[currentIndex]
    const displayQuote = truncateQuote(current.quote)
    const duration = getDisplayDuration(displayQuote)

    const timeout = setTimeout(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
        setIsVisible(true)
      }, 500)
    }, duration)

    return () => clearTimeout(timeout)
  }, [reviews, currentIndex])

  // Manual dot navigation
  const goTo = useCallback(
    (index: number) => {
      if (index === currentIndex) return
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsVisible(true)
      }, 500)
    },
    [currentIndex]
  )

  // Don't render until loaded
  if (!loaded || reviews.length === 0) {
    return null
  }

  const current = reviews[currentIndex]
  const sourceLabel = sourceLabels[current.source] || ""
  const displayQuote = truncateQuote(current.quote)

  return (
    <div className="relative flex h-full flex-col justify-between">
      {/* Quote */}
      <div className="flex flex-1 items-center">
        <blockquote
          className={`space-y-4 transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <Stars count={current.rating} />

          <p className="text-lg leading-relaxed font-medium text-white/95">
            &ldquo;{displayQuote}&rdquo;
          </p>

          <footer className="pt-2">
            <p className="text-sm font-semibold text-white">
              {current.author_name}
            </p>
            {sourceLabel && (
              <p className="text-xs text-white/50">via {sourceLabel}</p>
            )}
          </footer>
        </blockquote>
      </div>

      {/* Dot indicators — show max 8 */}
      <div className="mt-8 flex gap-2">
        {reviews.slice(0, 8).map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}