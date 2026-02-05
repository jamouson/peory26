// =============================================================================
// components/cart/cart-provider.tsx — Cart initialization & merge-on-login
// =============================================================================
// Wrap your app (or shop layout) with this provider.
// It handles:
//   1. Hydrating cart on mount
//   2. Merging guest cart when user logs in
//   3. Re-fetching cart when auth state changes

"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { useCartStore } from "@/lib/stores/cart-store"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { fetchCart, mergeGuestCart, isHydrated } = useCartStore()
  const prevSignedIn = useRef<boolean | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    // Detect login transition (was signed out, now signed in)
    const justSignedIn = prevSignedIn.current === false && isSignedIn === true

    if (justSignedIn) {
      // Merge guest cart first, then fetch full cart
      mergeGuestCart().then(() => fetchCart())
    } else if (!isHydrated) {
      // Initial hydration
      fetchCart()
    }

    prevSignedIn.current = isSignedIn ?? false
  }, [isSignedIn, isLoaded, fetchCart, mergeGuestCart, isHydrated])

  return <>{children}</>
}