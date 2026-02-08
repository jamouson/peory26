// =============================================================================
// File: src/components/variations-data-table.tsx
// Description: Data table for variation templates. Direct copy of
//   components/data-table.tsx with schema, columns, and drawer swapped for
//   variation template data. All layout, styling, DnD, pagination, column
//   visibility, and Tabs wrapper are identical to the original.
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
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader2,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
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

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { Separator } from "@/components/ui/separator"
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

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const valueSchema = z.object({
  id: z.string(),
  value: z.string(),
  display_order: z.number(),
  created_at: z.string(),
})

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  display_order: z.number(),
  created_at: z.string(),
  variation_template_values: z.array(valueSchema),
})

type VariationTemplate = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Drag Handle (same as original)
// ---------------------------------------------------------------------------

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

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
// Columns — accepts onEdit callback so both name click + actions menu work
// ---------------------------------------------------------------------------

function getColumns(
  onRefresh: () => Promise<void>,
  onEdit: (item: VariationTemplate) => void
): ColumnDef<VariationTemplate>[] {
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
      header: "Name",
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
            onClick={() => onEdit(row.original)}
          >
            {row.original.name}
          </Button>
        )
      },
      enableHiding: false,
    },
    {
      id: "values",
      header: "Values",
      cell: ({ row }) => {
        const values = row.original.variation_template_values || []
        return (
          <div className="flex flex-wrap gap-1">
            {values.slice(0, 5).map((v) => (
              <Badge
                key={v.id}
                variant="outline"
                className="text-muted-foreground px-1.5"
              >
                {v.value}
              </Badge>
            ))}
            {values.length > 5 && (
              <Badge
                variant="outline"
                className="text-muted-foreground px-1.5"
              >
                +{values.length - 5}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "count",
      header: () => <div className="w-full text-right">Count</div>,
      cell: ({ row }) => (
        <div className="w-12 text-right tabular-nums">
          {row.original.variation_template_values?.length ?? 0}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsMenu
          item={row.original}
          onEdit={() => onEdit(row.original)}
          onRefresh={onRefresh}
        />
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Actions Menu — now accepts onEdit callback
// ---------------------------------------------------------------------------

function ActionsMenu({
  item,
  onEdit,
  onRefresh,
}: {
  item: VariationTemplate
  onEdit: () => void
  onRefresh: () => Promise<void>
}) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/variations/${item.id}`, {
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
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Draggable Row (same as original)
// ---------------------------------------------------------------------------

function DraggableRow({ row }: { row: Row<VariationTemplate> }) {
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
// Main DataTable export — drawer state lifted here
// ---------------------------------------------------------------------------

export function VariationsDataTable({
  data: initialData,
  onRefresh,
}: {
  data: VariationTemplate[]
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
  const [searchExpanded, setSearchExpanded] = React.useState(false)
  const isMobile = useIsMobile()
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Sync when parent re-fetches
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Drawer state – lifted so both name-click and actions-menu can open it
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<VariationTemplate | null>(null)

  // Keep selectedTemplate in sync with latest data after refresh
  React.useEffect(() => {
    if (selectedTemplate) {
      const updated = initialData.find((t) => t.id === selectedTemplate.id)
      if (updated) setSelectedTemplate(updated)
    }
  }, [initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  const columns = React.useMemo(
    () => getColumns(onRefresh, (item) => setSelectedTemplate(item)),
    [onRefresh]
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
      return row.original.name.toLowerCase().includes(search)
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

  // Create template
  const [showCreate, setShowCreate] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/admin/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          display_order: data.length,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to create")
        return
      }
      toast.success(`"${newName.trim()}" created`)
      setNewName("")
      setShowCreate(false)
      await onRefresh()
    } catch {
      toast.error("Failed to create template")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Left: Tab selector */}
        {!(isMobile && searchExpanded) && (
          <>
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
                <SelectItem value="outline">All Variations</SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
              <TabsTrigger value="outline">
                All Variations <Badge variant="secondary">{data.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </>
        )}

        {/* Right: Actions — or expanded search on mobile */}
        {isMobile && searchExpanded ? (
          /* ── Mobile expanded search ────────────────────────── */
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                placeholder="Search variations..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full pl-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchExpanded(false)
                    setGlobalFilter("")
                  }
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchExpanded(false)
                setGlobalFilter("")
              }}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        ) : (
          /* ── Normal toolbar ────────────────────────────────── */
          <div className="flex items-center gap-2">
            {/* Search — icon on mobile, input on desktop */}
            <Button
              variant="outline"
              size="icon"
              className="size-8 lg:hidden"
              onClick={() => setSearchExpanded(true)}
            >
              <IconSearch className="size-3.5" />
              <span className="sr-only">Search</span>
            </Button>
            <div className="relative hidden lg:block">
              <IconSearch className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search variations..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-44 pl-8"
              />
            </div>
            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="hidden sm:inline lg:hidden">Columns</span>
                  <IconChevronDown className="hidden sm:block" />
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
                  .map((column) => {
                    return (
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
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Add variation */}
            {showCreate ? (
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="e.g. Size, Flavor..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate()
                    if (e.key === "Escape") {
                      setShowCreate(false)
                      setNewName("")
                    }
                  }}
                  className="h-8 w-44"
                  disabled={creating}
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                >
                  {creating ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreate(false)
                    setNewName("")
                  }}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreate(true)}
              >
                <IconPlus />
                <span className="hidden lg:inline">Add Variation</span>
              </Button>
            )}
          </div>
        )}
      </div>
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
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
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
                      {globalFilter
                        ? "No variations match your search."
                        : "No results."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
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

      {/* Drawer – controlled by selectedTemplate state */}
      <VariationDrawer
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onRefresh={onRefresh}
      />
    </Tabs>
  )
}

// ---------------------------------------------------------------------------
// VariationDrawer — controlled drawer, replaces old TableCellViewer
// ---------------------------------------------------------------------------

function VariationDrawer({
  template,
  onClose,
  onRefresh,
}: {
  template: VariationTemplate | null
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const isMobile = useIsMobile()
  const [newValue, setNewValue] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const values = template?.variation_template_values || []

  const handleAddValue = async () => {
    if (!template || !newValue.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/admin/variations/${template.id}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to add value")
        return
      }
      toast.success(`Added "${newValue.trim()}"`)
      setNewValue("")
      await onRefresh()
    } catch {
      toast.error("Failed to add value")
    } finally {
      setAdding(false)
    }
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={!!template}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{template?.name}</DrawerTitle>
          <DrawerDescription>
            Manage values for this variation template
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <div className="flex flex-col gap-3">
            <Label htmlFor="new-value">Add Value</Label>
            <div className="flex gap-2">
              <Input
                id="new-value"
                placeholder="e.g. Small, Red, Mango..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddValue()
                }}
                disabled={adding}
              />
              <Button
                size="sm"
                onClick={handleAddValue}
                disabled={!newValue.trim() || adding}
                className="h-9"
              >
                {adding ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconPlus className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-3">
            <Label>Current Values ({values.length})</Label>
            {values.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center italic">
                No values yet — add your first one above.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {template &&
                  values.map((v) => (
                    <ValueRow
                      key={v.id}
                      templateId={template.id}
                      value={v}
                      onRefresh={onRefresh}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ---------------------------------------------------------------------------
// ValueRow — inline edit + delete inside drawer
// ---------------------------------------------------------------------------

function ValueRow({
  templateId,
  value,
  onRefresh,
}: {
  templateId: string
  value: z.infer<typeof valueSchema>
  onRefresh: () => Promise<void>
}) {
  const [editing, setEditing] = React.useState(false)
  const [editText, setEditText] = React.useState(value.value)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const handleUpdate = async () => {
    if (!editText.trim() || editText.trim() === value.value) {
      setEditing(false)
      setEditText(value.value)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/variations/${templateId}/values/${value.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: editText.trim() }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to update")
        setEditText(value.value)
        return
      }
      setEditing(false)
      await onRefresh()
    } catch {
      toast.error("Failed to update")
      setEditText(value.value)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/variations/${templateId}/values/${value.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to delete")
        return
      }
      await onRefresh()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-muted/50">
      {editing ? (
        <div className="flex flex-1 items-center gap-1.5">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdate()
              if (e.key === "Escape") {
                setEditing(false)
                setEditText(value.value)
              }
            }}
            className="h-7 text-sm"
            disabled={saving}
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconCheck className="size-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => {
              setEditing(false)
              setEditText(value.value)
            }}
          >
            <IconX className="size-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1">{value.value}</span>
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => setEditing(true)}
            >
              <IconPencil className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconTrash className="size-3.5" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}