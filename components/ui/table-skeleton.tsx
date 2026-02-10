// =============================================================================
// File: src/components/ui/table-skeleton.tsx
// Description: Reusable skeleton rows for data tables. Renders shimmer
//   placeholders that match column layouts for perceived instant loading.
//   Used by products, customers, variations, and any future data tables.
//   Each table defines its own SKELETON_MAP for dynamic column visibility.
// =============================================================================

import { cn } from "@/lib/utils"
import { TableCell, TableRow } from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Skeleton primitive — a single shimmer bar
// ---------------------------------------------------------------------------

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Column shape config — describes how each cell skeleton looks
// ---------------------------------------------------------------------------

export interface SkeletonColumn {
  /** Width class for the skeleton bar, e.g. "w-32", "w-20" */
  width: string
  /** Optional: render variant for different cell types */
  variant?: "text" | "image-text" | "stacked-text" | "badge" | "checkbox"
  /** Alignment — matches your column alignment */
  align?: "left" | "right" | "center"
  /** Optional second line (e.g. slug under product name, email under customer name) */
  secondLine?: string
}

// ---------------------------------------------------------------------------
// Single skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow({
  columns,
  index,
}: {
  columns: SkeletonColumn[]
  index: number
}) {
  return (
    <TableRow
      className="hover:bg-transparent"
      style={{
        // Stagger the animation for a nice cascade effect
        animationDelay: `${index * 50}ms`,
      }}
    >
      {columns.map((col, i) => (
        <TableCell
          key={i}
          className={cn(
            col.align === "right" && "text-right",
            col.align === "center" && "text-center"
          )}
        >
          {col.variant === "checkbox" ? (
            <div className="flex items-center justify-center">
              <Skeleton className="size-4 rounded-sm" />
            </div>
          ) : col.variant === "image-text" ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-md" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className={cn("h-3.5", col.width)} />
                {col.secondLine && (
                  <Skeleton className={cn("h-2.5", col.secondLine)} />
                )}
              </div>
            </div>
          ) : col.variant === "stacked-text" ? (
            /* Two lines of text without an image (e.g. customer name + email) */
            <div className="flex flex-col gap-1.5">
              <Skeleton className={cn("h-3.5", col.width)} />
              {col.secondLine && (
                <Skeleton className={cn("h-2.5", col.secondLine)} />
              )}
            </div>
          ) : col.variant === "badge" ? (
            <Skeleton className={cn("h-5 rounded-full", col.width)} />
          ) : (
            <div
              className={cn(
                "flex",
                col.align === "right" && "justify-end",
                col.align === "center" && "justify-center"
              )}
            >
              <Skeleton className={cn("h-3.5", col.width)} />
            </div>
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// TableSkeleton — renders N skeleton rows
// ---------------------------------------------------------------------------

export function TableSkeleton({
  columns,
  rows = 10,
}: {
  columns: SkeletonColumn[]
  rows?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} index={i} />
      ))}
    </>
  )
}