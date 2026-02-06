// =============================================================================
// File: src/components/products-data-table.tsx
// Description: Data table for products. Follows the same pattern as
//   components/variations-data-table.tsx — DnD rows, TanStack React Table,
//   Tabs wrapper, pagination, column visibility. Product-specific columns,
//   actions menu, and drawer (reuses ProductDrawer + ProductStatusBadge).
// =============================================================================

"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconArchive,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconEye,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader2,
  IconPlus,
  IconRocket,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProductDrawer } from "@/components/admin/product-drawer"
import { ProductStatusBadge } from "@/components/admin/product-status-badge"

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const variantSchema = z.object({
  id: z.string(),
  sku: z.string().optional(),
  price: z.number(),
  compare_at_price: z.number().nullable().optional(),
  inventory_count: z.number(),
  track_inventory: z.boolean().optional(),
  allow_backorder: z.boolean().optional(),
  is_active: z.boolean(),
  image_url: z.string().nullable().optional(),
})

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  base_price: z.number(),
  compare_at_price: z.number().nullable().optional(),
  images: z.array(z.string()).optional(),
  status: z.string(),
  is_featured: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  product_variants: z.array(variantSchema),
})

type Product = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPriceRange(product: Product): string {
  if (product.product_variants.length === 0) {
    return `$${Number(product.base_price).toFixed(2)}`
  }
  const prices = product.product_variants.map((v) => Number(v.price))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max
    ? `$${min.toFixed(2)}`
    : `$${min.toFixed(2)} – $${max.toFixed(2)}`
}

function getInventory(product: Product): number {
  return product.product_variants.reduce(
    (sum, v) => sum + (v.is_active ? v.inventory_count : 0),
    0
  )
}

// ---------------------------------------------------------------------------
// Drag Handle (same as variations-data-table)
// ---------------------------------------------------------------------------

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function getColumns(
  onEditProduct: (id: string | null) => void,
  onRefresh: () => Promise<void>
): ColumnDef<Product>[] {
  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original
        const image = product.images?.[0]

        return (
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => onEditProduct(product.id)}
          >
            {image ? (
              <img
                src={image}
                alt=""
                className="size-9 rounded-md object-cover"
              />
            ) : (
              <div className="bg-muted size-9 rounded-md" />
            )}
            <div className="min-w-0">
              <p className="text-foreground truncate font-medium hover:underline">
                {product.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                /{product.slug}
              </p>
            </div>
          </button>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <ProductStatusBadge
            status={
              row.original.status as
                | "draft"
                | "published"
                | "scheduled"
                | "archived"
            }
          />
          {row.original.is_featured && (
            <span className="text-xs text-amber-500">★</span>
          )}
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true
        return row.original.status === filterValue
      },
    },
    {
      id: "price",
      header: () => <div className="w-full text-right">Price</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-sm tabular-nums">
          {getPriceRange(row.original)}
        </div>
      ),
    },
    {
      id: "inventory",
      header: () => <div className="w-full text-right">Inventory</div>,
      cell: ({ row }) => {
        const product = row.original
        if (product.product_variants.length === 0) {
          return (
            <div className="text-muted-foreground text-right text-xs">—</div>
          )
        }
        const inventory = getInventory(product)
        return (
          <div
            className={cn(
              "text-right font-mono text-sm tabular-nums",
              inventory <= 0
                ? "text-red-500"
                : inventory <= 10
                  ? "text-amber-500"
                  : ""
            )}
          >
            {inventory}
          </div>
        )
      },
    },
    {
      id: "variants",
      header: () => <div className="w-full text-right">Variants</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm tabular-nums">
          {row.original.product_variants.length}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsMenu
          item={row.original}
          onEdit={() => onEditProduct(row.original.id)}
          onRefresh={onRefresh}
        />
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Actions Menu
// ---------------------------------------------------------------------------

function ActionsMenu({
  item,
  onEdit,
  onRefresh,
}: {
  item: Product
  onEdit: () => void
  onRefresh: () => Promise<void>
}) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/products/${item.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to delete")
        return
      }
      toast.success(`"${item.name}" deleted`)
      await onRefresh()
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        {item.status === "published" && (
          <DropdownMenuItem asChild>
            <a href={`/products/${item.slug}`} target="_blank">
              View Live
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Draggable Row (same as variations-data-table)
// ---------------------------------------------------------------------------

function DraggableRow({ row }: { row: Row<Product> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Bulk Actions Bar
// ---------------------------------------------------------------------------

function BulkActionsBar({
  selectedCount,
  onAction,
  disabled,
}: {
  selectedCount: number
  onAction: (action: "publish" | "archive" | "delete") => void
  disabled: boolean
}) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAction("publish")}
        disabled={disabled}
      >
        <IconRocket className="mr-1 size-3.5" />
        Publish
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAction("archive")}
        disabled={disabled}
      >
        <IconArchive className="mr-1 size-3.5" />
        Archive
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => onAction("delete")}
        disabled={disabled}
      >
        <IconTrash className="mr-1 size-3.5" />
        Delete
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ProductsDataTable export
// ---------------------------------------------------------------------------

export function ProductsDataTable({
  data: initialData,
  onRefresh,
}: {
  data: Product[]
  onRefresh: () => Promise<void>
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [bulkLoading, setBulkLoading] = React.useState(false)
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editingProductId, setEditingProductId] = React.useState<string | null>(
    null
  )

  const openDrawer = React.useCallback((id: string | null) => {
    setEditingProductId(id)
    setDrawerOpen(true)
  }, [])

  // Sync when parent re-fetches
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Apply status filter as column filter
  React.useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "status"))
    } else {
      setColumnFilters((prev) => {
        const without = prev.filter((f) => f.id !== "status")
        return [...without, { id: "status", value: statusFilter }]
      })
    }
  }, [statusFilter])

  const columns = React.useMemo(
    () => getColumns(openDrawer, onRefresh),
    [openDrawer, onRefresh]
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      return (
        row.original.name.toLowerCase().includes(search) ||
        row.original.slug.toLowerCase().includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  // Bulk actions
  const selectedIds = Object.keys(rowSelection).filter(
    (key) => rowSelection[key as keyof typeof rowSelection]
  )

  const handleBulkAction = async (action: "publish" | "archive" | "delete") => {
    if (selectedIds.length === 0) return

    const confirmMsg =
      action === "delete"
        ? `Delete ${selectedIds.length} product(s)? This cannot be undone.`
        : `${action === "publish" ? "Publish" : "Archive"} ${selectedIds.length} product(s)?`

    if (!confirm(confirmMsg)) return

    setBulkLoading(true)
    try {
      if (action === "delete") {
        await fetch("/api/admin/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        })
        toast.success(`${selectedIds.length} product(s) deleted`)
      } else {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            updates: {
              status: action === "publish" ? "published" : "archived",
            },
          }),
        })
        toast.success(
          `${selectedIds.length} product(s) ${action === "publish" ? "published" : "archived"}`
        )
      }
      setRowSelection({})
      await onRefresh()
    } catch {
      toast.error("Bulk action failed")
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">All Products</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">
            All Products <Badge variant="secondary">{data.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <IconSearch className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search products..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-8 w-44 pl-8"
            />
          </div>
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Add product */}
          <Button variant="outline" size="sm" onClick={() => openDrawer(null)}>
            <IconPlus />
            <span className="hidden lg:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {/* ── Bulk Actions ───────────────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="px-4 lg:px-6">
          <BulkActionsBar
            selectedCount={selectedIds.length}
            onAction={handleBulkAction}
            disabled={bulkLoading}
          />
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────── */}
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {globalFilter || statusFilter !== "all"
                        ? "No products match your filters."
                        : "No products yet. Create your first product."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* ── Pagination ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ── Product Drawer (reused) ────────────────────────────── */}
      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        productId={editingProductId}
        onSuccess={async () => {
          await onRefresh()
        }}
      />
    </Tabs>
  )
}
