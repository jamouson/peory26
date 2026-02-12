// =============================================================================
// File: app/api/reviews/testimonials/route.ts
// Description: Public endpoint — returns approved reviews for the testimonial
//   carousel on auth pages. Sorted newest-first. No auth required since
//   the RLS policy already allows public SELECT on approved reviews.
// =============================================================================

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, quote, author_name, source, rating, reviewed_at")
      .eq("is_approved", true)
      .order("reviewed_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[reviews/testimonials] Supabase error:", error.message)
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [], {
      headers: {
        // Cache for 1 hour — reviews don't change often
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    })
  } catch (err) {
    console.error("[reviews/testimonials] Unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}