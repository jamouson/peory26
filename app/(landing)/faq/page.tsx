// =============================================================================
// File: src/app/(landing)/faq/page.tsx
// =============================================================================

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import Cta from "@/components/ui/Cta"
import { FAQSection } from "./faq-section"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Quick answers to common questions about our products and services.",
}

export const revalidate = 3600

export interface FaqItem {
  id: string
  category: string
  question: string
  answer: string
}

async function getFaqs(): Promise<Record<string, FaqItem[]>> {
  const { data, error } = await supabase
    .from("faq")
    .select("id, category, question, answer")
    .eq("is_published", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Failed to fetch FAQs:", error)
    return {}
  }

  const grouped: Record<string, FaqItem[]> = {}
  for (const row of data) {
    ;(grouped[row.category] ??= []).push(row)
  }
  return grouped
}

export default async function FAQPage() {
  const faqByCategory = await getFaqs()

  return (
    <main className="flex flex-col overflow-hidden">
      <FAQSection faqByCategory={faqByCategory} />
      <Cta />
    </main>
  )
}