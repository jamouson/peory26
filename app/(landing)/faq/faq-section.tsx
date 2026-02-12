// =============================================================================
// File: src/app/(landing)/faq/faq-section.tsx
// =============================================================================

"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { PlusIcon, SearchIcon, XIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { FaqItem } from "./page"

interface FAQSectionProps {
  faqByCategory: Record<string, FaqItem[]>
}

export function FAQSection({ faqByCategory }: FAQSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  // Drag-to-scroll refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const categories = useMemo(() => Object.keys(faqByCategory), [faqByCategory])
  const allFaqs = useMemo(() => Object.values(faqByCategory).flat(), [faqByCategory])

  const filtered = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const grouped: Record<string, FaqItem[]> = {}
      for (const item of allFaqs) {
        if (item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)) {
          ;(grouped[item.category] ??= []).push(item)
        }
      }
      return grouped
    }
    if (activeCategory) {
      return { [activeCategory]: faqByCategory[activeCategory] || [] }
    }
    return faqByCategory
  }, [searchQuery, activeCategory, faqByCategory, allFaqs])

  const totalResults = useMemo(() => Object.values(filtered).flat().length, [filtered])

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      if (!value.trim()) return setOpenItem(undefined)
      const q = value.toLowerCase()
      const match = allFaqs.find(
        (i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)
      )
      setOpenItem(match?.id)
    },
    [allFaqs]
  )

  // Drag-to-scroll handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    dragState.current = {
      active: true,
      moved: false,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    }
  }, [])

  const onDragMove = useCallback((e: React.MouseEvent) => {
    const { active, startX, scrollLeft: sl } = dragState.current
    const el = scrollRef.current
    if (!active || !el) return
    e.preventDefault()
    const walk = e.pageX - el.offsetLeft - startX
    if (Math.abs(walk) > 3) dragState.current.moved = true
    el.scrollLeft = sl - walk
  }, [])

  const onDragEnd = useCallback(() => {
    dragState.current.active = false
  }, [])

  const handleCategoryClick = useCallback(
    (category: string | null) => {
      if (dragState.current.moved) return
      setActiveCategory((prev) => (prev === category ? null : category))
    },
    []
  )

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="flex items-center justify-center px-6 pb-12 pt-40 sm:pt-48">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-semibold !leading-[1.15] tracking-[-0.03em]">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Quick answers to common questions about our products and services.
        </p>

        {/* Search */}
        <div className="relative mt-8">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearch}
            className="h-11 w-full rounded-xl border bg-accent pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setOpenItem(undefined) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        {!isSearching && categories.length > 1 && (
          <div
            ref={scrollRef}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            className="mt-4 flex select-none gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {[null, ...categories].map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat ?? "all"}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat ?? "All"}
                </button>
              )
            })}
          </div>
        )}

        {/* Search results count */}
        {isSearching && (
          <p className="mt-3 text-sm text-muted-foreground">
            {totalResults === 0
              ? "No matching questions found. Try a different search."
              : `${totalResults} result${totalResults !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Accordion */}
        {totalResults > 0 && (
          <Accordion
            className="mt-6"
            collapsible
            value={openItem}
            onValueChange={setOpenItem}
            type="single"
          >
            <div className="space-y-8">
              {Object.entries(filtered).map(([category, items]) => (
                <div key={category}>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="rounded-xl border-none bg-accent px-4 py-1"
                      >
                        <AccordionTrigger className="py-4 text-start text-lg font-semibold tracking-tight hover:underline [&[data-state=open]>svg.lucide-plus]:rotate-45 [&>svg.lucide-chevron-down]:hidden [&>svg]:shrink-0 [&>svg]:text-muted-foreground [&>svg]:transition-transform [&>svg]:duration-200">
                          {item.question}
                          <PlusIcon className="h-5 w-5" />
                        </AccordionTrigger>
                        <AccordionContent className="whitespace-pre-line text-base text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Accordion>
        )}
      </div>
    </div>
  )
}