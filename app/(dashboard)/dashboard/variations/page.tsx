// =============================================================================
// File: src/app/(dashboard)/dashboard/variations/page.tsx
// Description: Variations management page. Same pattern as dashboard/page.tsx —
//   fetches data, passes it to the VariationsDataTable component.
// =============================================================================

"use client"

import * as React from "react"
import { IconLoader2 } from "@tabler/icons-react"

import { VariationsDataTable } from "@/components/variations-data-table"

export default function VariationsPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/variations")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setData(json.templates || [])
    } catch {
      console.error("Failed to load variations")
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
      <VariationsDataTable data={data} onRefresh={fetchData} />
    </div>
  )
}
