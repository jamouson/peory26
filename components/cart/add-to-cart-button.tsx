// =============================================================================
// components/cart/add-to-cart-button.tsx — Reusable Add to Cart button
// =============================================================================

"use client"

import React, { useState } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cart-store"

interface AddToCartButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  variantId: string
  quantity?: number
  showIcon?: boolean
}

export function AddToCartButton({
  variantId,
  quantity = 1,
  showIcon = true,
  children,
  ...props
}: AddToCartButtonProps) {
  const { addItem } = useCartStore()
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  async function handleClick() {
    if (status !== "idle") return
    setStatus("loading")

    try {
      await addItem(variantId, quantity)
      setStatus("success")
      setTimeout(() => setStatus("idle"), 1500)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <Button onClick={handleClick} disabled={status === "loading"} {...props}>
      {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {status === "success" && <Check className="mr-2 h-4 w-4" />}
      {status === "idle" && showIcon && (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {status === "success"
        ? "Added!"
        : children ?? "Add to Cart"}
    </Button>
  )
}