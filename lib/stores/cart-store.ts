// =============================================================================
// lib/stores/cart-store.ts — Zustand cart store
// =============================================================================
// Guest users: localStorage persistence
// Authenticated users: API routes → Supabase
// On login: merge guest cart into DB cart

import { create } from "zustand"
import {
  type CartItem,
  type GuestCartItem,
  GUEST_CART_KEY,
  clampQuantity,
} from "@/lib/cart"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isHydrated: boolean
  error: string | null

  // Actions
  fetchCart: () => Promise<void>
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (variantId: string, quantity: number) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  clearCart: () => Promise<void>
  mergeGuestCart: () => Promise<void>
  hydrateGuestCart: () => void

  // Computed helpers
  getItemCount: () => number
  getSubtotal: () => number
  getItemByVariant: (variantId: string) => CartItem | undefined
}

// ---------------------------------------------------------------------------
// localStorage helpers (guest cart)
// ---------------------------------------------------------------------------

function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function clearGuestCart() {
  if (typeof window === "undefined") return
  localStorage.removeItem(GUEST_CART_KEY)
}

// ---------------------------------------------------------------------------
// Auth state helper — checks if user is authenticated
// We read from Clerk's cookie presence as a simple check.
// The actual auth verification happens server-side in API routes.
// ---------------------------------------------------------------------------

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  // Clerk sets __session cookie when user is signed in
  return document.cookie.includes("__session")
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  isHydrated: false,
  error: null,

  // -------------------------------------------------------------------------
  // Fetch cart (authenticated → API, guest → localStorage)
  // -------------------------------------------------------------------------
  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      if (isAuthenticated()) {
        const data = await apiRequest<{ items: CartItem[] }>("/api/cart")
        set({ items: data.items })
      } else {
        get().hydrateGuestCart()
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load cart" })
    } finally {
      set({ isLoading: false, isHydrated: true })
    }
  },

  // -------------------------------------------------------------------------
  // Add item
  // -------------------------------------------------------------------------
  addItem: async (variantId: string, quantity = 1) => {
    set({ error: null })
    const existing = get().getItemByVariant(variantId)

    if (isAuthenticated()) {
      try {
        const data = await apiRequest<{ items: CartItem[] }>("/api/cart", {
          method: "POST",
          body: JSON.stringify({ variantId, quantity }),
        })
        set({ items: data.items })
      } catch (err) {
        set({ error: err instanceof Error ? err.message : "Failed to add item" })
        throw err
      }
    } else {
      const guestCart = getGuestCart()
      const idx = guestCart.findIndex((i) => i.variantId === variantId)

      if (idx >= 0) {
        guestCart[idx].quantity = clampQuantity(
          guestCart[idx].quantity + quantity,
        )
      } else {
        guestCart.push({
          variantId,
          quantity: clampQuantity(quantity),
          addedAt: new Date().toISOString(),
        })
      }

      setGuestCart(guestCart)
      get().hydrateGuestCart()
    }
  },

  // -------------------------------------------------------------------------
  // Update quantity
  // -------------------------------------------------------------------------
  updateQuantity: async (variantId: string, quantity: number) => {
    set({ error: null })
    const clamped = clampQuantity(quantity)

    if (isAuthenticated()) {
      try {
        const data = await apiRequest<{ items: CartItem[] }>("/api/cart", {
          method: "PATCH",
          body: JSON.stringify({ variantId, quantity: clamped }),
        })
        set({ items: data.items })
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Failed to update item",
        })
        throw err
      }
    } else {
      const guestCart = getGuestCart()
      const idx = guestCart.findIndex((i) => i.variantId === variantId)
      if (idx >= 0) {
        guestCart[idx].quantity = clamped
        setGuestCart(guestCart)
        get().hydrateGuestCart()
      }
    }
  },

  // -------------------------------------------------------------------------
  // Remove item
  // -------------------------------------------------------------------------
  removeItem: async (variantId: string) => {
    set({ error: null })

    if (isAuthenticated()) {
      try {
        const data = await apiRequest<{ items: CartItem[] }>("/api/cart", {
          method: "DELETE",
          body: JSON.stringify({ variantId }),
        })
        set({ items: data.items })
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Failed to remove item",
        })
        throw err
      }
    } else {
      const guestCart = getGuestCart().filter(
        (i) => i.variantId !== variantId,
      )
      setGuestCart(guestCart)
      get().hydrateGuestCart()
    }
  },

  // -------------------------------------------------------------------------
  // Clear cart
  // -------------------------------------------------------------------------
  clearCart: async () => {
    if (isAuthenticated()) {
      try {
        await apiRequest("/api/cart", { method: "DELETE", body: JSON.stringify({ all: true }) })
      } catch {
        // silent fail on clear
      }
    }
    clearGuestCart()
    set({ items: [], error: null })
  },

  // -------------------------------------------------------------------------
  // Merge guest cart into authenticated cart (called on login)
  // -------------------------------------------------------------------------
  mergeGuestCart: async () => {
    const guestCart = getGuestCart()
    if (guestCart.length === 0) return

    try {
      const data = await apiRequest<{ items: CartItem[] }>("/api/cart/merge", {
        method: "POST",
        body: JSON.stringify({ guestItems: guestCart }),
      })
      clearGuestCart()
      set({ items: data.items })
    } catch (err) {
      console.error("Cart merge failed:", err)
      // Don't clear guest cart if merge failed — user can retry
    }
  },

  // -------------------------------------------------------------------------
  // Hydrate guest cart from localStorage (maps to CartItem shape)
  // -------------------------------------------------------------------------
  hydrateGuestCart: () => {
    const guestCart = getGuestCart()
    const items: CartItem[] = guestCart.map((g) => ({
      variantId: g.variantId,
      quantity: g.quantity,
      // Product details will be enriched by the cart page via a separate fetch
    }))
    set({ items, isHydrated: true })
  },

  // -------------------------------------------------------------------------
  // Computed helpers
  // -------------------------------------------------------------------------
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    )
  },

  getItemByVariant: (variantId: string) => {
    return get().items.find((item) => item.variantId === variantId)
  },
}))