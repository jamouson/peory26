// =============================================================================
// File: src/app/(dashboard)/dashboard/customers/page.tsx
// Description: Admin customers list page. Always renders the DataTable shell
//   immediately — skeleton rows display while data loads for perceived
//   instant loading (no more full-page spinner).
// =============================================================================

"use client"

import * as React from "react"

import { CustomersDataTable } from "@/components/customers-data-table"

export default function CustomersPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/customers")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setData(json.customers || [])
    } catch {
      console.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomersDataTable data={data} onRefresh={fetchData} loading={loading} />
    </div>
  )
}