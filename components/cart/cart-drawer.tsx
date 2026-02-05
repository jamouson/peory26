// =============================================================================
// components/cart/cart-drawer.tsx — Slide-out cart drawer
// =============================================================================

"use client"

import Link from "next/link"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItemRow } from "./cart-item-row"

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, isLoading, isHydrated, error, clearCart, getItemCount, getSubtotal } =
    useCartStore()
  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md [&>button:last-child]:hidden"
      >
        {/* Custom header — replaces default close button */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <SheetHeader className="p-0">
            <SheetTitle className="text-lg font-semibold">
              Cart{itemCount > 0 ? ` (${itemCount})` : ""}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Your shopping cart
            </SheetDescription>
          </SheetHeader>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onOpenChange(false)}
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {(!isHydrated || isLoading) && (
          <div className="flex-1 space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-20 w-20 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-8 w-28 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isHydrated && !isLoading && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add some items to get started.
            </p>
            <Link href="/products" onClick={() => onOpenChange(false)}>
              <Button className="mt-4">Browse Products</Button>
            </Link>
          </div>
        )}

        {/* Cart items */}
        {isHydrated && !isLoading && items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItemRow key={item.variantId} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="text-base font-semibold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  onOpenChange(false)
                  window.location.href = "/checkout"
                }}
              >
                Checkout — ${subtotal.toFixed(2)}
              </Button>

              <button
                className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => clearCart()}
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}