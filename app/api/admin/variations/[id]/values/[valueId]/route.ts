// =============================================================================
// File: src/app/api/admin/variations/[id]/values/[valueId]/route.ts
// Description: Single variation value operations.
//   PUT    — Update value text or display_order
//   DELETE — Delete value (blocked if in use by product variants)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

interface RouteParams {
  params: Promise<{ id: string; valueId: string }>
}

// PUT /api/admin/variations/[id]/values/[valueId]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: template_id, valueId } = await params
  const body = await request.json()
  const { value, display_order } = body

  if (value !== undefined && !value?.trim()) {
    return NextResponse.json({ error: "Value cannot be empty" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (value !== undefined) updates.value = value.trim()
  if (display_order !== undefined) updates.display_order = display_order

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  // Check for duplicate value if updating text
  if (value) {
    const { data: existing } = await supabaseAdmin
      .from("variation_template_values")
      .select("id")
      .eq("template_id", template_id)
      .ilike("value", value.trim())
      .neq("id", valueId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: `"${value.trim()}" already exists in this template` },
        { status: 409 }
      )
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from("variation_template_values")
    .update(updates)
    .eq("id", valueId)
    .eq("template_id", template_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ value: updated })
}

// DELETE /api/admin/variations/[id]/values/[valueId]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: template_id, valueId } = await params

  // Block deletion if in use by product variants
  const { count } = await supabaseAdmin
    .from("product_variant_options")
    .select("*", { count: "exact", head: true })
    .eq("value_id", valueId)

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `This value is assigned to ${count} product variant(s). Remove it from all products before deleting.`,
      },
      { status: 409 }
    )
  }

  const { error } = await supabaseAdmin
    .from("variation_template_values")
    .delete()
    .eq("id", valueId)
    .eq("template_id", template_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
