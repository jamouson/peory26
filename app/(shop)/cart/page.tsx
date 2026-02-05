// =============================================================================
// app/(shop)/cart/page.tsx — Cart page
// =============================================================================

"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItemRow } from "@/components/cart/cart-item-row"
import { CartSummary } from "@/components/cart/cart-summary"

export default function CartPage() {
  const { items, isLoading, isHydrated, error, clearCart, getItemCount } =
    useCartStore()
  const itemCount = getItemCount()

  // Loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 py-4 animate-pulse"
            >
              <div className="h-24 w-24 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-8 w-32 rounded bg-muted" />
              </div>
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href="/products">
            <Button className="mt-6" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Cart with items
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => clearCart()}
        >
          Clear cart
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="divide-y">
            {items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}
          </div>

          <Separator className="mt-4" />

          <Link href="/products">
            <Button variant="link" className="mt-4 px-0">
              ← Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}