// =============================================================================
// File: src/app/(dashboard)/dashboard/customers/page.tsx
// Description: Admin customers list page. Same pattern as products/page.tsx —
//   fetches data, passes it to the CustomersDataTable component which handles
//   all table logic (TanStack React Table, pagination, filtering, etc).
// =============================================================================

"use client"

import * as React from "react"
import { IconLoader2 } from "@tabler/icons-react"

import { CustomersDataTable } from "@/components/customers-data-table"

export default function CustomersPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <IconLoader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <CustomersDataTable data={data} onRefresh={fetchData} />
    </div>
  )
}
