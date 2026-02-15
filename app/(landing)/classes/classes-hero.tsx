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
    // UPDATED: Reduced mobile padding to pt-24 (was pt-32)
    <section className="pt-24 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ── Full-bleed Hero Slider ────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-[2rem] bg-neutral-900 shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Aspect Ratio: Taller on mobile (4/5) to fix text overlap issues */}
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]">
            
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

            {/* Gradient Overlay - Deep bottom fade for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-10 lg:p-12">
              <div className="relative z-10 w-full">
                
                {/* Text Content Area */}
                <div className="relative h-[150px] sm:h-[140px] lg:h-[160px] mb-4 sm:mb-8 pointer-events-none">
                    <AnimatePresence mode="wait">
                    <motion.div
                        key={slides[active].id}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute bottom-0 left-0 w-full"
                    >
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-300 mb-2">
                        PEORY Design Labs
                        </p>
                        <h1 className="max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                        {slides[active].headline}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-white/80 leading-snug sm:leading-relaxed sm:text-base line-clamp-2 sm:line-clamp-none">
                        {slides[active].subheadline}
                        </p>
                    </motion.div>
                    </AnimatePresence>
                </div>

                {/* Buttons & Controls Row */}
                <div className="relative z-20 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                  
                  {/* CTA Buttons */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLScM232094RDD22T-zipPpq7C7gImSVIA1zRkoVM-ZN107Zclw/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer flex-1 sm:flex-none"
                    >
                      <Button variant="primary" className="gap-2 cursor-pointer w-full sm:w-auto justify-center">
                        Inquire Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="#course-details" className="cursor-pointer flex-1 sm:flex-none">
                      <Button
                        variant="ghost"
                        className="text-white/90 hover:bg-white/10 hover:text-white cursor-pointer w-full sm:w-auto justify-center"
                      >
                        Learn More
                      </Button>
                    </a>
                  </div>

                  {/* Progress Indicators (Hidden on mobile to save vertical space) */}
                  <div className="flex gap-2 pb-1 hidden sm:flex">
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