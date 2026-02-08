// =============================================================================
// File: src/app/api/admin/products/route.ts
// Description: Product list and creation API.
//   GET  — List products with pagination, search, status filter
//   POST — Create a new product with optional variants
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/products
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status") || ""
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from("products")
    .select(
      `
      *,
      product_variants (
        id, sku, price, compare_at_price, inventory_count,
        track_inventory, allow_backorder, is_active, image_url
      )
    `,
      { count: "exact" }
    )
    .eq("product_variants.is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
  }
  if (status) {
    query = query.eq("status", status)
  }

  const { data: products, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: products || [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const body = await request.json()

    const {
      name,
      slug,
      description,
      base_price,
      compare_at_price,
      images,
      status,
      scheduled_publish_date,
      meta_title,
      meta_description,
      requires_shipping,
      is_featured,
      variants,
    } = body

    if (!name || !slug || base_price === undefined) {
      return NextResponse.json(
        { error: "Name, slug, and base_price are required" },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      )
    }

    const productData: Record<string, unknown> = {
      name,
      slug,
      description: description ?? null,
      base_price: parseFloat(base_price),
      compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
      images: images ?? [],
      status: status ?? "draft",
      meta_title: meta_title ?? null,
      meta_description: meta_description ?? null,
      requires_shipping: requires_shipping ?? true,
      is_featured: is_featured ?? false,
      created_by: admin.userId ?? null,
      updated_by: admin.userId ?? null,
    }

    if (status === "scheduled" && scheduled_publish_date) {
      productData.scheduled_publish_date = scheduled_publish_date
    }

    if (status === "published") {
      productData.published_at = new Date().toISOString()
    }

    // ── Create the product ────────────────────────────────────────────────
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      )
    }

    // ── Create variants if provided ───────────────────────────────────────
    const variantWarnings: string[] = []

    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i]

        // Auto-generate SKU if not provided
        const sku = v.sku || `${slug}-v${i + 1}`

        const { data: variant, error: variantError } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: product.id,
            sku,
            price: v.price ?? parseFloat(base_price),
            compare_at_price: v.compare_at_price ?? null,
            inventory_count: v.inventory_count ?? 0,
            track_inventory: true,
            allow_backorder: false,
            is_active: v.is_active ?? true,
          })
          .select()
          .single()

        if (variantError) {
          variantWarnings.push(`Variant ${i + 1}: ${variantError.message}`)
          continue
        }

        // Link variant to its variation template values
        if (v.options && typeof v.options === "object") {
          const optionRows = Object.entries(v.options).map(
            ([templateId, valueId]) => ({
              variant_id: variant.id,
              template_id: templateId,
              value_id: valueId as string,
            })
          )

          if (optionRows.length > 0) {
            const { error: optionError } = await supabaseAdmin
              .from("product_variant_options")
              .insert(optionRows)

            if (optionError) {
              variantWarnings.push(
                `Variant ${i + 1} options: ${optionError.message}`
              )
            }
          }
        }
      }
    }

    // Return with warnings if some variants failed (product still created)
    if (variantWarnings.length > 0) {
      return NextResponse.json(
        {
          product,
          warnings: variantWarnings,
          message: "Product created but some variants had issues",
        },
        { status: 207 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error("Product creation error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}