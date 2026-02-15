// =============================================================================
// File: src/app/(landing)/hero.tsx
// Description: Hero section for the main wedding landing page.
//   Refactored to match the cakes-hero pattern with consistent spacing,
//   animation, and layout structure.
//   NOTE: @keyframes fade-up and .animate-fade-up live in globals.css.
// =============================================================================

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ArrowRight, Sparkles, Play, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/Button"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const YOUTUBE_VIDEO_ID = "JEtgoMqahjo"

const trustIndicators = [
  { label: "5,000+", sublabel: "Cakes Delivered" },
  { label: "4.9★", sublabel: "Average Rating" },
  { label: "100%", sublabel: "Made Fresh" },
  { label: "NYC", sublabel: "Based & Shipped" },
]

// ---------------------------------------------------------------------------
// Video Theater Hook
// ---------------------------------------------------------------------------

function useVideoTheater() {
  const [phase, setPhase] = useState<"idle" | "morphing" | "theater">("idle")
  const imageRef = useRef<HTMLDivElement>(null)
  const [imageRect, setImageRect] = useState<DOMRect | null>(null)

  const open = useCallback(() => {
    if (!imageRef.current) return
    setImageRect(imageRef.current.getBoundingClientRect())
    setPhase("morphing")

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("theater")
      })
    })

    document.body.style.overflow = "hidden"
  }, [])

  const close = useCallback(() => {
    setPhase("morphing")
    setTimeout(() => {
      setPhase("idle")
      document.body.style.overflow = ""
    }, 500)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "theater") close()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, close])

  useEffect(() => {
    if (phase !== "idle") return
    const handleResize = () => {
      if (imageRef.current) {
        setImageRect(imageRef.current.getBoundingClientRect())
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [phase])

  return { phase, imageRef, imageRect, open, close, isOpen: phase !== "idle" }
}

// ---------------------------------------------------------------------------
// Theater Overlay
// ---------------------------------------------------------------------------

function TheaterOverlay({
  phase,
  imageRect,
  onClose,
}: {
  phase: "morphing" | "theater"
  imageRect: DOMRect | null
  onClose: () => void
}) {
  const getMorphStyle = (): React.CSSProperties => {
    if (!imageRect) return {}

    const base: React.CSSProperties = {
      position: "fixed",
      borderRadius: phase === "theater" ? "0.75rem" : "0.5rem",
      transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
      zIndex: 2147483647,
    }

    if (phase === "morphing") {
      return {
        ...base,
        top: imageRect.top,
        left: imageRect.left,
        width: imageRect.width,
        height: imageRect.height,
      }
    }

    const maxWidth = Math.min(window.innerWidth * 0.95, 1400)
    const theaterHeight = maxWidth * 0.5625
    return {
      ...base,
      top: (window.innerHeight - theaterHeight) / 2,
      left: (window.innerWidth - maxWidth) / 2,
      width: maxWidth,
      height: theaterHeight,
    }
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-600 ease-out ${
          phase === "theater" ? "opacity-95" : "opacity-0"
        }`}
        style={{ zIndex: 2147483646 }}
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className={`fixed right-4 top-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/20 ${
          phase === "theater"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
        style={{ zIndex: 2147483647 }}
        aria-label="Close video"
      >
        <X className="size-5" />
      </button>

      {/* Morphing video container */}
      <div
        style={getMorphStyle()}
        className="overflow-hidden shadow-2xl shadow-black/60"
      >
        <img
          src="https://placehold.co/1200x600"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            phase === "theater" ? "opacity-0" : "opacity-100"
          }`}
        />
        <iframe
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 delay-200 ${
            phase === "theater" ? "opacity-100" : "opacity-0"
          }`}
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
          title="PEORY Cakes Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* ESC hint */}
      <p
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/40 transition-all duration-500 delay-300 ${
          phase === "theater"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
        style={{ zIndex: 2147483647 }}
      >
        Press{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium text-white/60">
          ESC
        </kbd>{" "}
        to close
      </p>
    </>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Main Hero
// ---------------------------------------------------------------------------

export default function Hero() {
  const theater = useVideoTheater()

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden pb-16 sm:pb-20"
      >
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-transparent to-transparent dark:from-rose-950/20" />

        <div className="relative mx-auto max-w-6xl px-4 pt-36 sm:px-6 sm:pt-44 lg:px-8">
          {/* Announcement Badge */}
          <div className="animate-fade-up flex justify-center">
            <Badge
              variant="outline"
              className="gap-2 rounded-full border-foreground/10 bg-background/80 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Now accepting orders for 2026</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Badge>
          </div>

          {/* Heading */}
          <div
            className="animate-fade-up mt-8 text-center sm:mt-10"
            style={{ animationDelay: "100ms" }}
          >
            <h1
              id="hero-title"
              className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Floral Wedding Cakes in
              <br />
              <span className="text-brand-600 dark:text-brand-400">
                New York & New Jersey
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:mt-6">
              Our organic, buttercream floral cakes blend exquisite taste and
              stunning artistry, creating unforgettable centerpieces that bring
              your wedding dreams to life.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up mt-10 flex items-center justify-center gap-4"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/sign-in">
              <Button variant="primary" className="cursor-pointer gap-2">
                Inquiry Form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={theater.open}
              className="cursor-pointer gap-2"
            >
              <Play className="h-4 w-4" />
              Watch Video
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className="animate-fade-up mt-12 flex items-center justify-center gap-8 sm:mt-16 sm:gap-12"
            style={{ animationDelay: "300ms" }}
          >
            {trustIndicators.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {item.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {item.sublabel}
                </div>
              </div>
            ))}
          </div>

          {/* Hero Image with Play Overlay */}
          <div
            className="animate-fade-up mx-auto mt-12 max-w-6xl sm:mt-16"
            style={{ animationDelay: "400ms" }}
          >
            <div
              ref={theater.imageRef}
              className="group relative cursor-pointer overflow-hidden rounded-2xl"
              onClick={theater.open}
            >
              <img
                src="https://placehold.co/1200x600"
                alt="Wedding cake showcase"
                className="w-full rounded-2xl shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                <div className="flex size-16 scale-90 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-100 sm:size-20">
                  <Play className="size-8 fill-gray-900 text-gray-900 sm:size-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theater overlay — portaled to document.body */}
      {theater.isOpen && (
        <TheaterOverlay
          phase={theater.phase as "morphing" | "theater"}
          imageRect={theater.imageRect}
          onClose={theater.close}
        />
      )}
    </>
  )
}