// =============================================================================
// File: src/app/(dashboard)/dashboard/products/[id]/edit/page.tsx
// Description: Edit product page. Fetches product by ID from the API,
//              then renders ProductForm in "edit" mode with variant management.
// =============================================================================

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { IconLoader2 } from "@tabler/icons-react"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<null | Record<string, unknown>>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`)
        if (!res.ok) { setError("Product not found"); return }
        const data = await res.json()
        setProduct(data.product)
      } catch { setError("Failed to load product") } finally { setLoading(false) }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Product not found"}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/products")}>Back to Products</Button>
      </div>
    )
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <div className="flex flex-1 flex-col px-4 py-6 lg:px-6">
      <ProductForm product={product as any} mode="edit" />
    </div>
  )
}
