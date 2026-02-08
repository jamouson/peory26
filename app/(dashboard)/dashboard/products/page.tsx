// =============================================================================
// File: src/app/(dashboard)/dashboard/products/page.tsx
// Description: Admin product list page. Same pattern as variations/page.tsx —
//   fetches data, passes it to the ProductsDataTable component which handles
//   all table logic (TanStack React Table, DnD, pagination, filtering, etc).
// =============================================================================

"use client"

import * as React from "react"
import { IconLoader2 } from "@tabler/icons-react"

import { ProductsDataTable } from "@/components/products-data-table"

export default function ProductsPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      // Fetch all products (high limit) — TanStack handles client-side 
      const res = await fetch("/api/admin/products?limit=500&sort=created_at&order=desc")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setData(json.products || [])
    } catch {
      console.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <IconLoader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ProductsDataTable data={data} onRefresh={fetchData} />
    </div>
  )
}