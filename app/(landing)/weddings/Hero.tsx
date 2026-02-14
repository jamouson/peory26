"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { RiPlayCircleFill } from "@remixicon/react"
import { X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/Button"

const YOUTUBE_VIDEO_ID = "JEtgoMqahjo"

export default function Hero() {
  const [phase, setPhase] = useState<"idle" | "morphing" | "theater">("idle")
  const imageRef = useRef<HTMLDivElement>(null)
  const [imageRect, setImageRect] = useState<DOMRect | null>(null)

  const openTheater = useCallback(() => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    setImageRect(rect)
    setPhase("morphing")

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("theater")
      })
    })

    document.body.style.overflow = "hidden"
  }, [])

  const closeTheater = useCallback(() => {
    setPhase("morphing")

    setTimeout(() => {
      setPhase("idle")
      document.body.style.overflow = ""
    }, 500)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "theater") closeTheater()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [phase, closeTheater])

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

  const isOpen = phase !== "idle"

  const getMorphStyle = (): React.CSSProperties => {
    if (!imageRect) return {}

    if (phase === "morphing") {
      return {
        position: "fixed",
        top: imageRect.top,
        left: imageRect.left,
        width: imageRect.width,
        height: imageRect.height,
        borderRadius: "0.5rem",
        transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
        zIndex: 60,
      }
    }

    if (phase === "theater") {
      const maxWidth = Math.min(window.innerWidth * 0.95, 1400)
      const theaterHeight = maxWidth * 0.5625
      const top = (window.innerHeight - theaterHeight) / 2
      const left = (window.innerWidth - maxWidth) / 2

      return {
        position: "fixed",
        top,
        left,
        width: maxWidth,
        height: theaterHeight,
        borderRadius: "0.75rem",
        transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
        zIndex: 60,
      }
    }

    return {}
  }

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="mt-32 flex flex-col items-center justify-center text-center sm:mt-40"
      >
        <h1
          id="hero-title"
          className="inline-block animate-slide-up-fade bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl dark:from-gray-50 dark:to-gray-300"
          style={{ animationDuration: "700ms" }}
        >
          Floral Wedding Cakes in <br /> New York & New Jersey
        </h1>
        <p
          className="mt-6 max-w-lg animate-slide-up-fade text-lg text-gray-700 dark:text-gray-400"
          style={{ animationDuration: "900ms" }}
        >
          Our organic, buttercream floral cakes blend exquisite taste and
          stunning artistry, creating unforgettable centerpieces that bring your
          wedding dreams to life.
        </p>
        <div
          className="mt-8 flex w-full animate-slide-up-fade flex-col justify-center gap-3 px-3 sm:flex-row"
          style={{ animationDuration: "1100ms" }}
        >
          <Button className="h-10 cursor-pointer font-semibold">
            <Link href="#">Inquiry Form</Link>
          </Button>
          <Button
            variant="light"
            onClick={openTheater}
            className="group cursor-pointer gap-x-2 bg-transparent font-semibold hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent ring-1 ring-gray-200 sm:ring-0 dark:ring-gray-900"
          >
            <span className="mr-1 flex size-6 items-center justify-center rounded-full bg-gray-50 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <RiPlayCircleFill
                aria-hidden="true"
                className="size-5 shrink-0 text-gray-900 dark:text-gray-50"
              />
            </span>
            Watch video
          </Button>
        </div>

        {/* Hero Image with play overlay */}
        <div
          className="relative mx-auto ml-3 mt-20 h-fit w-[40rem] max-w-6xl animate-slide-up-fade sm:ml-auto sm:w-full sm:px-2"
          style={{
            animationDuration: "1400ms",
            maskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 50%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 10%, black 50%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskComposite: "destination-in",
          }}
        >
          <div
            ref={imageRef}
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            onClick={openTheater}
          >
            <img
              src="https://placehold.co/1200x600"
              alt="Wedding cake showcase"
              className="w-full rounded-lg shadow-2xl"
            />
            {/* Play button overlay — hidden by default, visible on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
              <div className="flex size-16 scale-90 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-100 sm:size-20">
                <RiPlayCircleFill className="size-10 text-gray-900 sm:size-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theater Mode */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-50 bg-black transition-opacity duration-600 ease-out ${
              phase === "theater" ? "opacity-95" : "opacity-0"
            }`}
            onClick={closeTheater}
          />

          {/* Close button */}
          <button
            onClick={closeTheater}
            className={`fixed right-4 top-4 z-[70] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/20 ${
              phase === "theater"
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
            aria-label="Close video"
          >
            <X className="size-5" />
          </button>

          {/* Morphing video container */}
          <div
            style={getMorphStyle()}
            className="overflow-hidden shadow-2xl shadow-black/60"
          >
            {/* Placeholder image that fades out */}
            <img
              src="https://placehold.co/1200x600"
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                phase === "theater" ? "opacity-0" : "opacity-100"
              }`}
            />

            {/* YouTube iframe that fades in */}
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
            className={`fixed bottom-8 left-1/2 z-[70] -translate-x-1/2 text-sm text-white/40 transition-all duration-500 delay-300 ${
              phase === "theater"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Press{" "}
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium text-white/60">
              ESC
            </kbd>{" "}
            to close
          </p>
        </>
      )}
    </>
  )
}