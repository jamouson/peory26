// =============================================================================
// File: src/app/api/admin/products/route.ts
// Description: Products collection API.
//   GET    — List products (paginated, search, status filter, sorting)
//   POST   — Create a new product
//   PATCH  — Bulk update (status changes, featured toggle)
//   DELETE — Bulk delete products by IDs
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/products
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const sort = searchParams.get("sort") ?? "created_at"
  const order = searchParams.get("order") ?? "desc"

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

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.order(sort, { ascending: order === "asc" }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: data,
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
    }

    if (status === "published") {
      productData.published_at = new Date().toISOString()
    }

    if (status === "scheduled" && scheduled_publish_date) {
      productData.scheduled_publish_date = scheduled_publish_date
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// PATCH /api/admin/products — bulk status update
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const { ids, updates } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0 || !updates) {
      return NextResponse.json(
        { error: "ids array and updates object are required" },
        { status: 400 }
      )
    }

    const allowedFields = ["status", "is_featured"]
    const safeUpdates: Record<string, unknown> = {}

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key]
      }
    }

    if (safeUpdates.status === "published") {
      safeUpdates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(safeUpdates)
      .in("id", ids)
      .select()

    if (error) {
      console.error("Error updating products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updated: data?.length ?? 0 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// DELETE /api/admin/products — bulk delete
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Error deleting products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: ids.length })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}