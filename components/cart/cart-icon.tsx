// =============================================================================
// components/cart/cart-icon.tsx — Cart icon with badge + drawer
// =============================================================================

"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartDrawer } from "./cart-drawer"

export function CartIcon() {
  const { getItemCount, isHydrated } = useCartStore()
  const [open, setOpen] = useState(false)
  const count = getItemCount()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Open cart"
        onClick={() => setOpen(true)}
      >
        <ShoppingBag className="h-5 w-5" />
        {isHydrated && count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}