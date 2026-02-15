// =============================================================================
// File: src/app/(landing)/classes/classes-hero.tsx
// =============================================================================

"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/Button"
import { motion, AnimatePresence } from "framer-motion"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const INTERVAL_MS = 6000

const slides = [
  {
    id: "intro",
    headline: "Learn the Art of Buttercream Floral Piping",
    subheadline:
      "From beautiful roses to intricate blooms, techniques that turn cakes into edible works of art.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T153939.778.webp",
  },
  {
    id: "foundations",
    headline: "Floral Foundations",
    subheadline:
      "From beginners to intermediates, master essential buttercream floral piping techniques.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T154338.501.webp",
  },
  {
    id: "artistry",
    headline: "Floral Artistry",
    subheadline:
      "An intensive, lab-style course designed for experienced pipers looking to elevate their skills.",
    image:
      "https://peorycake.com/wp-content/uploads/2024/11/Untitled-design-2024-10-15T184737.270.webp",
  },
]

// ---------------------------------------------------------------------------
// Main Hero
// ---------------------------------------------------------------------------

export function ClassesHero() {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [isPaused, next])

  return (
    // UPDATED: Increased padding slightly to pt-32 sm:pt-36
    <section className="pt-32 sm:pt-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        
        {/* ── Full-bleed Hero Slider ────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-[2rem] bg-neutral-900 shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Aspect Ratio Container */}
          <div className="relative aspect-[16/12] sm:aspect-[16/8] md:aspect-[16/7]">
            
            {/* Background Images */}
            <AnimatePresence initial={false}>
              <motion.img
                key={slides[active].image}
                src={slides[active].image}
                alt=""
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12">
              <div className="relative z-10 w-full">
                
                {/* Text Content */}
                <div className="relative h-[160px] sm:h-[140px] lg:h-[120px] mb-6 sm:mb-8 pointer-events-none">
                    <AnimatePresence mode="wait">
                    <motion.div
                        key={slides[active].id}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute bottom-0 left-0 w-full"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300 sm:text-sm mb-2">
                        PEORY Design Labs
                        </p>
                        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {slides[active].headline}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-white/80 leading-relaxed sm:text-base">
                        {slides[active].subheadline}
                        </p>
                    </motion.div>
                    </AnimatePresence>
                </div>

                {/* Buttons & Controls Row */}
                <div className="relative z-20 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                  
                  {/* CTA Buttons */}
                  <div className="flex items-center gap-4">
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLScM232094RDD22T-zipPpq7C7gImSVIA1zRkoVM-ZN107Zclw/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <Button variant="primary" className="gap-2 cursor-pointer">
                        Inquire Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="#course-details" className="cursor-pointer">
                      <Button
                        variant="ghost"
                        className="text-white/90 hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        Learn More
                      </Button>
                    </a>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex gap-2 sm:gap-3 pb-1">
                    {slides.map((slide, i) => (
                      <button
                        key={slide.id}
                        onClick={() => setActive(i)}
                        className="group relative h-1 w-10 sm:w-14 overflow-hidden rounded-full bg-white/20 transition-all hover:bg-white/30 hover:h-1.5 cursor-pointer"
                        aria-label={`Go to slide ${i + 1}`}
                      >
                        {i === active && (
                          <motion.div
                            className="absolute inset-0 bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                                duration: INTERVAL_MS / 1000, 
                                ease: "linear",
                                repeat: 0 
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}