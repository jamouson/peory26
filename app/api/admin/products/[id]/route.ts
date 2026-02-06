// =============================================================================
// File: src/app/api/admin/products/[id]/route.ts
// Description: Single product API.
//   GET    — Fetch product with all variants and their options
//   PUT    — Update product fields
//   DELETE — Delete product (archives instead if it has existing orders)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/products/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      *,
      product_variants (
        id, sku, price, compare_at_price, inventory_count,
        track_inventory, allow_backorder, is_active, image_url,
        weight_grams, created_at, updated_at,
        product_variant_options (
          variant_id, template_id, value_id,
          variation_templates ( id, name ),
          variation_template_values ( id, value )
        )
      )
    `
    )
    .eq("id", id)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({ product })
}

// PUT /api/admin/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  try {
    const body = await request.json()

    const allowedFields = [
      "name", "slug", "description", "base_price", "compare_at_price",
      "images", "status", "scheduled_publish_date", "meta_title",
      "meta_description", "requires_shipping", "is_featured",
    ]

    const updates: Record<string, unknown> = { updated_by: admin.userId }

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "base_price" || key === "compare_at_price") {
          updates[key] =
            body[key] !== null && body[key] !== ""
              ? parseFloat(body[key])
              : null
        } else {
          updates[key] = body[key]
        }
      }
    }

    if (updates.status === "published") {
      updates.published_at = new Date().toISOString()
    }

    // Check slug uniqueness if changing
    if (updates.slug) {
      const { data: existing } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", updates.slug)
        .neq("id", id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  // Check if product has orders — archive instead of hard delete
  const { count } = await supabaseAdmin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id)

  if (count && count > 0) {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status: "archived", updated_by: admin.userId })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      action: "archived",
      message: "Product has existing orders and was archived instead of deleted",
    })
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
