// =============================================================================
// components/cart/cart-item-row.tsx — Individual cart item row
// =============================================================================

"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/stores/cart-store"
import type { CartItem } from "@/lib/cart"
import { MAX_ITEM_QUANTITY } from "@/lib/cart"

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const maxQty = item.inventoryCount
    ? Math.min(MAX_ITEM_QUANTITY, item.inventoryCount)
    : MAX_ITEM_QUANTITY

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName ?? "Product"}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {item.productSlug ? (
            <Link
              href={`/products/${item.productSlug}`}
              className="font-medium hover:underline"
            >
              {item.productName}
            </Link>
          ) : (
            <span className="font-medium">{item.productName ?? "Product"}</span>
          )}
          {item.variantName && (
            <p className="text-sm text-muted-foreground">{item.variantName}</p>
          )}
        </div>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-8 text-center text-sm tabular-nums">
            {item.quantity}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            disabled={item.quantity >= maxQty}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.variantId)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right">
        {item.price != null && (
          <>
            <p className="font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p className="text-sm text-muted-foreground">
                ${item.price.toFixed(2)} each
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}