"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Review {
  id: string
  quote: string
  author_name: string
  author_role: string | null
  author_company: string | null
  author_avatar_url: string | null
  rating: number
  source: string
}

// Fallback data in case Supabase is unreachable (e.g. during auth page load)
const fallbackReviews: Review[] = [
  {
    id: "fallback-1",
    quote:
      "Beautiful design system that scales perfectly from small projects to enterprise applications.",
    author_name: "Aisha Patel",
    author_role: "CTO",
    author_company: null,
    author_avatar_url: null,
    rating: 5,
    source: "manual",
  },
]

export function TestimonialCarousel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch featured reviews from Supabase
  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select(
            "id, quote, author_name, author_role, author_company, author_avatar_url, rating, source"
          )
          .eq("is_featured", true)
          .eq("is_approved", true)
          .order("display_order", { ascending: true })

        if (error) throw error

        setReviews(data && data.length > 0 ? data : fallbackReviews)
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setReviews(fallbackReviews)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    if (reviews.length <= 1) return

    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
        setIsVisible(true)
      }, 500)
    }, 6000)

    return () => clearInterval(interval)
  }, [reviews.length])

  // Don't render anything while loading
  if (isLoading || reviews.length === 0) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="mt-4 h-3 w-1/3 rounded bg-white/10" />
      </div>
    )
  }

  const currentReview = reviews[currentIndex]

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400" : "text-white/20"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  // Source badge
  const renderSourceBadge = (source: string) => {
    if (source === "manual") return null
    const label = source.charAt(0).toUpperCase() + source.slice(1)
    return (
      <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
        via {label}
      </span>
    )
  }

  return (
    <div className="flex flex-col justify-between">
      <blockquote
        className={`min-h-[140px] transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {renderStars(currentReview.rating)}
        <p className="mt-3 text-lg font-medium leading-relaxed">
          &ldquo;{currentReview.quote}&rdquo;
        </p>
        <footer className="mt-4 text-sm font-medium">
          {currentReview.author_name}
          {(currentReview.author_role || currentReview.author_company) && (
            <span className="text-white/60">
              {" · "}
              {[currentReview.author_role, currentReview.author_company]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
          {renderSourceBadge(currentReview.source)}
        </footer>
      </blockquote>

      {/* Dot indicators */}
      {reviews.length > 1 && (
        <div className="mt-8 flex gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsVisible(true)
                }, 500)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}