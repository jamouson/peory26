// =============================================================================
// File: src/app/api/admin/variations/route.ts
// Description: Variation templates API.
//   GET  — List all templates (Size, Color, Material) with their values.
//          Used by the variant manager to populate option dropdowns.
//   POST — Create a new template (for the variations management page).
//   UPDATED: Added POST method for template creation.
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
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
      id, name, display_order, created_at,
      variation_template_values ( id, value, display_order, created_at )
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

// POST /api/admin/variations — Create a new template
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const body = await request.json()
  const { name, display_order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Check for duplicate name (case-insensitive)
  const { data: existing } = await supabaseAdmin
    .from("variation_templates")
    .select("id")
    .ilike("name", name.trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "A variation template with this name already exists" },
      { status: 409 }
    )
  }

  const { data: template, error } = await supabaseAdmin
    .from("variation_templates")
    .insert({
      name: name.trim(),
      display_order: display_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template }, { status: 201 })
}
