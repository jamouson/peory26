// =============================================================================
// File: src/app/api/admin/variations/[id]/values/route.ts
// Description: Variation template values.
//   POST — Add a new value to a template (e.g. add "XL" to "Size")
//   Auto-increments display_order if not provided.
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/variations/[id]/values
export async function POST(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: template_id } = await params
  const body = await request.json()
  const { value, display_order } = body

  if (!value?.trim()) {
    return NextResponse.json({ error: "Value is required" }, { status: 400 })
  }

  // Check template exists
  const { data: template } = await supabaseAdmin
    .from("variation_templates")
    .select("id")
    .eq("id", template_id)
    .maybeSingle()

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  // Check for duplicate value within this template (case-insensitive)
  const { data: existing } = await supabaseAdmin
    .from("variation_template_values")
    .select("id")
    .eq("template_id", template_id)
    .ilike("value", value.trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: `"${value.trim()}" already exists in this template` },
      { status: 409 }
    )
  }

  // Auto-set display_order to next available
  let order = display_order
  if (order === undefined) {
    const { data: maxOrder } = await supabaseAdmin
      .from("variation_template_values")
      .select("display_order")
      .eq("template_id", template_id)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    order = (maxOrder?.display_order ?? -1) + 1
  }

  const { data: newValue, error } = await supabaseAdmin
    .from("variation_template_values")
    .insert({
      template_id,
      value: value.trim(),
      display_order: order,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ value: newValue }, { status: 201 })
}
