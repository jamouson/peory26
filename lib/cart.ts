// =============================================================================
// lib/cart.ts — Shared cart types and utilities
// =============================================================================

export interface CartItem {
  id?: string // UUID from DB (absent for guest items)
  variantId: string
  quantity: number
  // Enriched fields (joined from product_variants + products)
  productName?: string
  variantName?: string
  price?: number
  imageUrl?: string
  sku?: string
  inventoryCount?: number
  productSlug?: string
}

export interface GuestCartItem {
  variantId: string
  quantity: number
  addedAt: string // ISO date
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  itemCount: number
}

// localStorage key
export const GUEST_CART_KEY = "guest-cart"

// Max quantity per item
export const MAX_ITEM_QUANTITY = 10

// Validate quantity
export function clampQuantity(
  quantity: number,
  inventoryCount?: number,
): number {
  const max = inventoryCount
    ? Math.min(MAX_ITEM_QUANTITY, inventoryCount)
    : MAX_ITEM_QUANTITY
  return Math.max(1, Math.min(quantity, max))
}