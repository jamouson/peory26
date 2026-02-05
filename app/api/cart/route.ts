// =============================================================================
// app/api/cart/route.ts — Cart CRUD operations
// =============================================================================
// All routes require Clerk authentication.
// Uses service role Supabase client for writes.

import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { clampQuantity } from "@/lib/cart"

// ---------------------------------------------------------------------------
// Types for Supabase join results
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Helper: Fetch enriched cart items for a user
// ---------------------------------------------------------------------------
async function getEnrichedCart(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("cart_items")
    .select(
      `
      id,
      variant_id,
      quantity,
      product_variants (
        id,
        sku,
        price,
        inventory_count,
        image_url,
        product_id,
        products (
          name,
          slug,
          images
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const variant = Array.isArray(row.product_variants)
      ? row.product_variants[0]
      : row.product_variants
    const product = Array.isArray(variant?.products)
      ? variant.products[0]
      : variant?.products

    return {
      id: row.id,
      variantId: row.variant_id,
      quantity: row.quantity,
      productName: product?.name ?? "Unknown Product",
      variantName: variant?.sku ?? "",
      price: Number(variant?.price ?? 0),
      imageUrl: variant?.image_url ?? product?.images?.[0] ?? null,
      sku: variant?.sku ?? "",
      inventoryCount: variant?.inventory_count ?? 0,
      productSlug: product?.slug ?? "",
    }
  })
}

// ---------------------------------------------------------------------------
// GET /api/cart — Fetch user's cart
// ---------------------------------------------------------------------------
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const items = await getEnrichedCart(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[CART GET]", err)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/cart — Add item to cart
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { variantId, quantity = 1 } = await req.json()

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 },
      )
    }

    // Check variant exists and has inventory
    const { data: variant, error: variantErr } = await supabaseAdmin
      .from("product_variants")
      .select("id, inventory_count, track_inventory")
      .eq("id", variantId)
      .single()

    if (variantErr || !variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 },
      )
    }

    if (variant.track_inventory && variant.inventory_count <= 0) {
      return NextResponse.json(
        { error: "Item is out of stock" },
        { status: 409 },
      )
    }

    // Upsert: if item already in cart, increment quantity
    const { data: existing } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("variant_id", variantId)
      .maybeSingle()

    if (existing) {
      const newQty = clampQuantity(
        existing.quantity + quantity,
        variant.track_inventory ? variant.inventory_count : undefined,
      )

      const { error } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existing.id)

      if (error) throw error
    } else {
      const clamped = clampQuantity(
        quantity,
        variant.track_inventory ? variant.inventory_count : undefined,
      )

      const { error } = await supabaseAdmin.from("cart_items").insert({
        user_id: userId,
        variant_id: variantId,
        quantity: clamped,
      })

      if (error) throw error
    }

    const items = await getEnrichedCart(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[CART POST]", err)
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/cart — Update item quantity
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { variantId, quantity } = await req.json()

    if (!variantId || typeof quantity !== "number") {
      return NextResponse.json(
        { error: "variantId and quantity are required" },
        { status: 400 },
      )
    }

    // Get variant for inventory check
    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("inventory_count, track_inventory")
      .eq("id", variantId)
      .single()

    const clamped = clampQuantity(
      quantity,
      variant?.track_inventory ? variant.inventory_count : undefined,
    )

    const { error } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity: clamped })
      .eq("user_id", userId)
      .eq("variant_id", variantId)

    if (error) throw error

    const items = await getEnrichedCart(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[CART PATCH]", err)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/cart — Remove item or clear cart
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { variantId, all } = await req.json()

    if (all) {
      // Clear entire cart
      const { error } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("user_id", userId)

      if (error) throw error
      return NextResponse.json({ items: [] })
    }

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 },
      )
    }

    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("variant_id", variantId)

    if (error) throw error

    const items = await getEnrichedCart(userId)
    return NextResponse.json({ items })
  } catch (err) {
    console.error("[CART DELETE]", err)
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 },
    )
  }
}