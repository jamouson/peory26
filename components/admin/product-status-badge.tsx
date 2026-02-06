// =============================================================================
// File: src/components/admin/product-status-badge.tsx
// Description: Colored badge for product status display.
//              Draft (gray), Scheduled (amber), Published (green), Archived (red).
//              Used in the product list table and edit page header.
// =============================================================================

"use client"

import { cn } from "@/lib/utils"

type ProductStatus = "draft" | "scheduled" | "published" | "archived"

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  published: {
    label: "Published",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  archived: {
    label: "Archived",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
