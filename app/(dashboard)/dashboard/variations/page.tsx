// =============================================================================
// File: src/app/(dashboard)/dashboard/variations/page.tsx
// Description: Variations management page. Always renders the DataTable shell
//   immediately — skeleton rows display while data loads for perceived
//   instant loading (no more full-page spinner).
// =============================================================================

"use client"

import * as React from "react"

import { VariationsDataTable } from "@/components/variations-data-table"

export default function VariationsPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <VariationsDataTable data={data} onRefresh={fetchData} loading={loading} />
    </div>
  )
}