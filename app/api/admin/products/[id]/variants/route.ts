// =============================================================================
// File: src/app/api/admin/products/[id]/variants/route.ts
// Description: Product variants collection API.
//   GET  — List all variants for a product (with joined options)
//   POST — Create a new variant with optional Size/Color/Material options
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/products/[id]/variants
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select(
      `
      *,
      product_variant_options (
        variant_id, template_id, value_id,
        variation_templates ( id, name ),
        variation_template_values ( id, value )
      )
    `
    )
    .eq("product_id", id)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ variants: data })
}

// POST /api/admin/products/[id]/variants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: productId } = await params

  try {
    const body = await request.json()
    const {
      sku, price, compare_at_price, inventory_count, track_inventory,
      allow_backorder, is_active, image_url, weight_grams,
      options, // Array of { template_id, value_id }
    } = body

    if (!sku || price === undefined) {
      return NextResponse.json(
        { error: "sku and price are required" },
        { status: 400 }
      )
    }

    // Check SKU uniqueness
    const { data: existingSku } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("sku", sku)
      .single()

    if (existingSku) {
      return NextResponse.json(
        { error: "A variant with this SKU already exists" },
        { status: 409 }
      )
    }

    // Insert variant
    const { data: variant, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: productId,
        sku,
        price: parseFloat(price),
        compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
        inventory_count: inventory_count ?? 0,
        track_inventory: track_inventory ?? true,
        allow_backorder: allow_backorder ?? false,
        is_active: is_active ?? true,
        image_url: image_url ?? null,
        weight_grams: weight_grams ?? null,
      })
      .select()
      .single()

    if (variantError) {
      console.error("Error creating variant:", variantError)
      return NextResponse.json({ error: variantError.message }, { status: 500 })
    }

    // Insert variant options if provided
    if (options && Array.isArray(options) && options.length > 0) {
      const optionRows = options.map(
        (opt: { template_id: string; value_id: string }) => ({
          variant_id: variant.id,
          template_id: opt.template_id,
          value_id: opt.value_id,
        })
      )

      const { error: optionsError } = await supabaseAdmin
        .from("product_variant_options")
        .insert(optionRows)

      if (optionsError) {
        console.error("Error creating variant options:", optionsError)
        // Rollback variant on failure
        await supabaseAdmin.from("product_variants").delete().eq("id", variant.id)
        return NextResponse.json({ error: optionsError.message }, { status: 500 })
      }
    }

    // Re-fetch with joined options
    const { data: fullVariant } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        *,
        product_variant_options (
          variant_id, template_id, value_id,
          variation_templates ( id, name ),
          variation_template_values ( id, value )
        )
      `
      )
      .eq("id", variant.id)
      .single()

    return NextResponse.json({ variant: fullVariant }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
