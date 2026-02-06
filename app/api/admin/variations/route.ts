// =============================================================================
// File: src/app/api/admin/variations/route.ts
// Description: Variation templates API.
//   GET — List all templates (Size, Color, Material) with their values.
//         Used by the variant manager to populate option dropdowns.
// =============================================================================

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/variations
export async function GET() {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { data, error } = await supabaseAdmin
    .from("variation_templates")
    .select(
      `
      id, name, display_order,
      variation_template_values ( id, value, display_order )
    `
    )
    .order("display_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sort values within each template by display_order
  const sorted = data?.map((t) => ({
    ...t,
    variation_template_values: t.variation_template_values?.sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  }))

  return NextResponse.json({ templates: sorted })
}
