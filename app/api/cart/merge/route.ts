// =============================================================================
// app/api/cart/merge/route.ts — Merge guest cart into authenticated cart
// =============================================================================
// Called once after user logs in.
// Merge strategy: MIN(guest_qty + db_qty, inventory_count)

import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { type GuestCartItem, clampQuantity } from "@/lib/cart"

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { guestItems } = (await req.json()) as {
      guestItems: GuestCartItem[]
    }

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return NextResponse.json({ error: "No items to merge" }, { status: 400 })
    }

    // Get all variant IDs we need to process
    const variantIds = guestItems.map((i) => i.variantId)

    // Fetch inventory info for all variants in one query
    const { data: variants, error: variantsErr } = await supabaseAdmin
      .from("product_variants")
      .select("id, inventory_count, track_inventory")
      .in("id", variantIds)

    if (variantsErr) throw variantsErr

    const variantMap = new Map(
      (variants ?? []).map((v) => [v.id, v]),
    )

    // Fetch existing cart items for this user
    const { data: existingItems, error: existingErr } = await supabaseAdmin
      .from("cart_items")
      .select("id, variant_id, quantity")
      .eq("user_id", userId)
      .in("variant_id", variantIds)

    if (existingErr) throw existingErr

    const existingMap = new Map(
      (existingItems ?? []).map((e) => [e.variant_id, e]),
    )

    // Process each guest item
    const upserts: { user_id: string; variant_id: string; quantity: number }[] =
      []
    const updates: { id: string; quantity: number }[] = []

    for (const guestItem of guestItems) {
      const variant = variantMap.get(guestItem.variantId)
      if (!variant) continue // Skip if variant no longer exists

      const existing = existingMap.get(guestItem.variantId)
      const maxInventory = variant.track_inventory
        ? variant.inventory_count
        : undefined

      if (existing) {
        // Merge: combine quantities, cap at inventory
        const merged = clampQuantity(
          existing.quantity + guestItem.quantity,
          maxInventory,
        )
        updates.push({ id: existing.id, quantity: merged })
      } else {
        // New item: clamp at inventory
        const clamped = clampQuantity(guestItem.quantity, maxInventory)
        upserts.push({
          user_id: userId,
          variant_id: guestItem.variantId,
          quantity: clamped,
        })
      }
    }

    // Execute updates
    for (const update of updates) {
      await supabaseAdmin
        .from("cart_items")
        .update({ quantity: update.quantity })
        .eq("id", update.id)
    }

    // Execute inserts
    if (upserts.length > 0) {
      const { error: insertErr } = await supabaseAdmin
        .from("cart_items")
        .insert(upserts)

      if (insertErr) throw insertErr
    }

    // Return full enriched cart
    const { data: fullCart, error: cartErr } = await supabaseAdmin
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

    if (cartErr) throw cartErr

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (fullCart ?? []).map((row: any) => {
      const v = Array.isArray(row.product_variants)
        ? row.product_variants[0]
        : row.product_variants
      const p = Array.isArray(v?.products) ? v.products[0] : v?.products
      return {
        id: row.id,
        variantId: row.variant_id,
        quantity: row.quantity,
        productName: p?.name ?? "Unknown Product",
        variantName: v?.sku ?? "",
        price: Number(v?.price ?? 0),
        imageUrl: v?.image_url ?? p?.images?.[0] ?? null,
        sku: v?.sku ?? "",
        inventoryCount: v?.inventory_count ?? 0,
        productSlug: p?.slug ?? "",
      }
    })

    return NextResponse.json({ items, merged: updates.length + upserts.length })
  } catch (err) {
    console.error("[CART MERGE]", err)
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 },
    )
  }
}