// =============================================================================
// File: src/app/api/admin/products/[id]/variants/[variantId]/route.ts
// Description: Single variant API.
//   PUT    — Update variant fields and replace options
//   DELETE — Delete variant (deactivates if it has existing orders)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// PUT /api/admin/products/[id]/variants/[variantId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { variantId } = await params

  try {
    const body = await request.json()
    const {
      sku, price, compare_at_price, inventory_count, track_inventory,
      allow_backorder, is_active, image_url, weight_grams, options,
    } = body

    const updates: Record<string, unknown> = {}

    if (sku !== undefined) {
      const { data: existing } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .eq("sku", sku)
        .neq("id", variantId)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: "A variant with this SKU already exists" },
          { status: 409 }
        )
      }
      updates.sku = sku
    }

    if (price !== undefined) updates.price = parseFloat(price)
    if (compare_at_price !== undefined)
      updates.compare_at_price = compare_at_price ? parseFloat(compare_at_price) : null
    if (inventory_count !== undefined) updates.inventory_count = inventory_count
    if (track_inventory !== undefined) updates.track_inventory = track_inventory
    if (allow_backorder !== undefined) updates.allow_backorder = allow_backorder
    if (is_active !== undefined) updates.is_active = is_active
    if (image_url !== undefined) updates.image_url = image_url || null
    if (weight_grams !== undefined) updates.weight_grams = weight_grams || null

    const { error: updateError } = await supabaseAdmin
      .from("product_variants")
      .update(updates)
      .eq("id", variantId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Replace options if provided (delete all, re-insert)
    if (options && Array.isArray(options)) {
      await supabaseAdmin
        .from("product_variant_options")
        .delete()
        .eq("variant_id", variantId)

      if (options.length > 0) {
        const optionRows = options.map(
          (opt: { template_id: string; value_id: string }) => ({
            variant_id: variantId,
            template_id: opt.template_id,
            value_id: opt.value_id,
          })
        )
        await supabaseAdmin.from("product_variant_options").insert(optionRows)
      }
    }

    // Re-fetch with joined options
    const { data: fullVariant } = await supabaseAdmin
      .from("product_variants")
      .select(
        `*, product_variant_options (
          variant_id, template_id, value_id,
          variation_templates ( id, name ),
          variation_template_values ( id, value )
        )`
      )
      .eq("id", variantId)
      .single()

    return NextResponse.json({ variant: fullVariant })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/admin/products/[id]/variants/[variantId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { variantId } = await params

  // Check if variant has order_items — deactivate instead of delete
  const { count } = await supabaseAdmin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("variant_id", variantId)

  if (count && count > 0) {
    const { error } = await supabaseAdmin
      .from("product_variants")
      .update({ is_active: false })
      .eq("id", variantId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      action: "deactivated",
      message: "Variant has existing orders and was deactivated",
    })
  }

  const { error } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("id", variantId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
