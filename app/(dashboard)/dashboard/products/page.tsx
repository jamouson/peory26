// =============================================================================
// File: src/app/(dashboard)/dashboard/products/page.tsx
// Description: Admin product list page. Always renders the DataTable shell
//   immediately — skeleton rows display while data loads for perceived
//   instant loading (no more full-page spinner).
// =============================================================================

"use client"

import * as React from "react"

import { ProductsDataTable } from "@/components/products-data-table"

export default function ProductsPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ProductsDataTable data={data} onRefresh={fetchData} loading={loading} />
    </div>
  )
}