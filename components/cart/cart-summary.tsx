// =============================================================================
// components/cart/cart-summary.tsx — Order summary sidebar
// =============================================================================

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cart-store"
import { Separator } from "@/components/ui/separator"

export function CartSummary() {
  const { getSubtotal, getItemCount, items } = useCartStore()
  const router = useRouter()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  // Don't render if cart has no priced items
  const hasPricedItems = items.some((i) => i.price != null)
  if (!hasPricedItems) return null

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      <Button
        className="mt-4 w-full"
        size="lg"
        onClick={() => router.push("/checkout")}
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  )
}