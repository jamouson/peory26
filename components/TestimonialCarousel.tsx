"use client"

import { useState, useEffect } from "react"

interface Testimonial {
  quote: string
  author: string
  role?: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.",
    author: "Sofia Davis",
    role: "Product Designer",
  },
  {
    quote:
      "The component quality is outstanding. Everything just works out of the box and looks professional.",
    author: "Michael Chen",
    role: "Frontend Developer",
  },
  {
    quote:
      "I've tried many UI libraries, but this one stands out for its attention to detail and developer experience.",
    author: "Emma Wilson",
    role: "Tech Lead",
  },
  {
    quote:
      "Our team's productivity has increased significantly since adopting this. The documentation is excellent.",
    author: "James Rodriguez",
    role: "Engineering Manager",
  },
  {
    quote:
      "Beautiful design system that scales perfectly from small projects to enterprise applications.",
    author: "Aisha Patel",
    role: "CTO",
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)

      // Wait for fade out, then change testimonial
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
        // Fade in
        setIsVisible(true)
      }, 500) // Half second for fade out
    }, 6000) // Change every 6 seconds

    return () => clearInterval(interval)
  }, [])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative">
      <blockquote
        className={`space-y-2 transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-lg">
          &ldquo;{currentTestimonial.quote}&rdquo;
        </p>
        <footer className="text-sm">
          <span className="font-medium">{currentTestimonial.author}</span>
          {currentTestimonial.role && (
            <span className="text-white/70"> · {currentTestimonial.role}</span>
          )}
        </footer>
      </blockquote>

      {/* Indicator Dots */}
      <div className="mt-8 flex gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => {
                setCurrentIndex(index)
                setIsVisible(true)
              }, 500)
            }}
            className={`h-1.5 rounded-full transition-all ${
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