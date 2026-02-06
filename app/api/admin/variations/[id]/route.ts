// =============================================================================
// File: src/app/api/admin/variations/[id]/route.ts
// Description: Single variation template operations.
//   PUT    — Update template name or display_order
//   DELETE — Delete template (blocked if in use by product variants)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/variations/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params
  const body = await request.json()
  const { name, display_order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Check for duplicate name (excluding current)
  const { data: existing } = await supabaseAdmin
    .from("variation_templates")
    .select("id")
    .ilike("name", name.trim())
    .neq("id", id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "A variation template with this name already exists" },
      { status: 409 }
    )
  }

  const { data: template, error } = await supabaseAdmin
    .from("variation_templates")
    .update({
      name: name.trim(),
      ...(display_order !== undefined && { display_order }),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ template })
}

// DELETE /api/admin/variations/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  // Block deletion if in use by product variants
  const { count } = await supabaseAdmin
    .from("product_variant_options")
    .select("*", { count: "exact", head: true })
    .eq("template_id", id)

  if (count && count > 0) {
    return NextResponse.json(
      {
        error: `This variation is assigned to ${count} product variant(s). Remove it from all products before deleting.`,
      },
      { status: 409 }
    )
  }

  const { error } = await supabaseAdmin
    .from("variation_templates")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
