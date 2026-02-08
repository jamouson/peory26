// =============================================================================
// File: src/app/api/admin/products/[id]/variants/route.ts
// Description: Product variants collection API.
//   GET  — List all variants for a product (with joined options)
//   POST — Create a new variant with optional Size/Color/Material options
//   PUT  — Diff-based sync: keeps matching, adds new, deactivates removed
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

type RouteParams = { params: Promise<{ id: string }> }

// ---------------------------------------------------------------------------
// Helper: build a stable key from a variant's option map
// ---------------------------------------------------------------------------
function variantKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|")
}

// GET /api/admin/products/[id]/variants
export async function GET(_request: NextRequest, { params }: RouteParams) {
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
export async function POST(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: productId } = await params

  try {
    const body = await request.json()
    const {
      sku,
      price,
      compare_at_price,
      inventory_count,
      track_inventory,
      allow_backorder,
      is_active,
      image_url,
      weight_grams,
      options,
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
        compare_at_price: compare_at_price
          ? parseFloat(compare_at_price)
          : null,
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
      return NextResponse.json(
        { error: variantError.message },
        { status: 500 }
      )
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
        // Rollback variant on failure
        await supabaseAdmin
          .from("product_variants")
          .delete()
          .eq("id", variant.id)
        return NextResponse.json(
          { error: optionsError.message },
          { status: 500 }
        )
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
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/products/[id]/variants — Diff-based variant sync
//
// Accepts: { variants: [{ existingId?, sku, price, ..., options: {tid: vid} }] }
//
// Logic:
//   1. Fetch all current variants for the product
//   2. Build a key (sorted template_id:value_id pairs) for each
//   3. For each incoming variant:
//      - If key matches an existing variant → update it
//      - If no match → create it
//   4. Existing variants not in incoming set → deactivate (never delete)
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id: productId } = await params

  try {
    const body = await request.json()
    const incomingVariants: {
      existingId?: string | null
      sku?: string | null
      price: number
      compare_at_price?: number | null
      inventory_count?: number
      is_active?: boolean
      options: Record<string, string>
    }[] = body.variants || []

    // ── Fetch existing variants with their options ──────────────────────
    const { data: existingVariants, error: fetchError } = await supabaseAdmin
      .from("product_variants")
      .select(
        `
        id, sku, price, compare_at_price, inventory_count, is_active,
        product_variant_options ( template_id, value_id )
      `
      )
      .eq("product_id", productId)

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // Build key → existing variant map
    const existingByKey = new Map<
      string,
      (typeof existingVariants)[number]
    >()
    const existingById = new Map<
      string,
      (typeof existingVariants)[number]
    >()

    for (const ev of existingVariants || []) {
      const opts: Record<string, string> = {}
      for (const opt of ev.product_variant_options || []) {
        opts[opt.template_id] = opt.value_id
      }
      existingByKey.set(variantKey(opts), ev)
      existingById.set(ev.id, ev)
    }

    // Track which existing variant IDs are still present
    const matchedExistingIds = new Set<string>()
    const warnings: string[] = []
    let created = 0
    let updated = 0
    let deactivated = 0

    // ── Process incoming variants ──────────────────────────────────────
    for (let i = 0; i < incomingVariants.length; i++) {
      const incoming = incomingVariants[i]
      const key = variantKey(incoming.options)
      const existing = existingByKey.get(key)

      if (existing) {
        // ── Update existing variant ────────────────────────────────────
        matchedExistingIds.add(existing.id)

        const sku =
          incoming.sku?.trim() || existing.sku

        const { error: updateError } = await supabaseAdmin
          .from("product_variants")
          .update({
            sku,
            price: incoming.price,
            compare_at_price: incoming.compare_at_price ?? null,
            inventory_count: incoming.inventory_count ?? 0,
            is_active: incoming.is_active ?? true,
          })
          .eq("id", existing.id)

        if (updateError) {
          warnings.push(`Variant ${i + 1} update: ${updateError.message}`)
        } else {
          updated++
        }
      } else {
        // ── Create new variant ─────────────────────────────────────────
        const slug = `${productId.slice(0, 8)}-v${i + 1}-${Date.now()
          .toString(36)
          .slice(-4)}`
        const sku = incoming.sku?.trim() || slug

        const { data: newVariant, error: createError } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: productId,
            sku,
            price: incoming.price,
            compare_at_price: incoming.compare_at_price ?? null,
            inventory_count: incoming.inventory_count ?? 0,
            is_active: incoming.is_active ?? true,
          })
          .select()
          .single()

        if (createError) {
          warnings.push(`Variant ${i + 1} create: ${createError.message}`)
          continue
        }

        created++

        // Insert options
        const optionRows = Object.entries(incoming.options).map(
          ([templateId, valueId]) => ({
            variant_id: newVariant.id,
            template_id: templateId,
            value_id: valueId,
          })
        )

        if (optionRows.length > 0) {
          const { error: optError } = await supabaseAdmin
            .from("product_variant_options")
            .insert(optionRows)

          if (optError) {
            warnings.push(
              `Variant ${i + 1} options: ${optError.message}`
            )
          }
        }
      }
    }

    // ── Deactivate variants no longer in the set ───────────────────────
    for (const ev of existingVariants || []) {
      if (!matchedExistingIds.has(ev.id) && ev.is_active) {
        const { error: deactivateError } = await supabaseAdmin
          .from("product_variants")
          .update({ is_active: false })
          .eq("id", ev.id)

        if (deactivateError) {
          warnings.push(
            `Deactivate ${ev.sku}: ${deactivateError.message}`
          )
        } else {
          deactivated++
        }
      }
    }

    return NextResponse.json({
      created,
      updated,
      deactivated,
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}