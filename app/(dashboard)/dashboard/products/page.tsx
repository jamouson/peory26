// =============================================================================
// File: src/app/(dashboard)/dashboard/products/page.tsx
// Description: Admin product list page.
//   - Table view with thumbnail, name, status, price range, inventory, variants
//   - Search input with debounce
//   - Status filter dropdown (All, Draft, Published, Scheduled, Archived)
//   - Column sorting (name, created_at)
//   - Checkbox selection + bulk actions (Publish, Archive, Delete)
//   - Pagination controls
//   - Row click navigates to edit page
//   - "Add Product" opens a side drawer (ProductDrawer) instead of a page
// =============================================================================

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  IconPlus, IconSearch, IconFilter, IconTrash, IconArchive, IconEye,
  IconPencil, IconLoader2, IconDots, IconArrowUp, IconArrowDown,
  IconChevronLeft, IconChevronRight,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductStatusBadge } from "@/components/admin/product-status-badge"
import { ProductDrawer } from "@/components/admin/product-drawer"

interface Product {
  id: string; name: string; slug: string; base_price: number; compare_at_price: number | null
  images: string[]; status: string; is_featured: boolean; created_at: string; updated_at: string
  product_variants: { id: string; inventory_count: number; is_active: boolean; price: number }[]
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit), sort: sortField, order: sortOrder })
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (search) params.set("search", search)

    try {
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (res.ok) { setProducts(data.products); setPagination(data.pagination) }
    } catch (err) { console.error("Failed to fetch products:", err) } finally { setLoading(false) }
  }, [pagination.page, pagination.limit, sortField, sortOrder, statusFilter, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setPagination((prev) => ({ ...prev, page: 1 })), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSort = (field: string) => {
    if (sortField === field) { setSortOrder(sortOrder === "asc" ? "desc" : "asc") }
    else { setSortField(field); setSortOrder("asc") }
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const toggleSelectAll = () => {
    if (selected.size === products.length) setSelected(new Set())
    else setSelected(new Set(products.map((p) => p.id)))
  }

  const handleBulkAction = async (action: "publish" | "archive" | "delete") => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    const confirmMsg = action === "delete"
      ? `Delete ${ids.length} product(s)? This cannot be undone.`
      : `${action === "publish" ? "Publish" : "Archive"} ${ids.length} product(s)?`
    if (!confirm(confirmMsg)) return

    setBulkLoading(true)
    try {
      if (action === "delete") {
        await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) })
      } else {
        await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, updates: { status: action === "publish" ? "published" : "archived" } }) })
      }
      setSelected(new Set()); fetchProducts()
    } catch { console.error("Bulk action failed") } finally { setBulkLoading(false) }
  }

  const getInventory = (p: Product) => p.product_variants.reduce((sum, v) => sum + (v.is_active ? v.inventory_count : 0), 0)

  const getPriceRange = (p: Product) => {
    if (p.product_variants.length === 0) return `$${Number(p.base_price).toFixed(2)}`
    const prices = p.product_variants.map((v) => Number(v.price))
    const min = Math.min(...prices); const max = Math.max(...prices)
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <IconArrowUp className="ml-1 inline h-3 w-3" /> : <IconArrowDown className="ml-1 inline h-3 w-3" />
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 lg:px-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">{pagination.total} product{pagination.total !== 1 ? "s" : ""} total</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <IconPlus className="mr-1.5 h-4 w-4" />Add Product
        </Button>
      </div>

      {/* Filters bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPagination((prev) => ({ ...prev, page: 1 })) }}>
          <SelectTrigger className="w-[140px]"><IconFilter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <Button variant="ghost" size="sm" onClick={() => handleBulkAction("publish")} disabled={bulkLoading}><IconEye className="mr-1 h-3.5 w-3.5" />Publish</Button>
            <Button variant="ghost" size="sm" onClick={() => handleBulkAction("archive")} disabled={bulkLoading}><IconArchive className="mr-1 h-3.5 w-3.5" />Archive</Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleBulkAction("delete")} disabled={bulkLoading}><IconTrash className="mr-1 h-3.5 w-3.5" />Delete</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><Checkbox checked={products.length > 0 && selected.size === products.length} onCheckedChange={toggleSelectAll} /></TableHead>
              <TableHead className="w-[60px]" />
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>Product<SortIcon field="name" /></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Inventory</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("created_at")}>Created<SortIcon field="created_at" /></TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="h-40 text-center"><IconLoader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                {search || statusFilter !== "all" ? "No products match your filters." : "No products yet. Create your first product."}
              </TableCell></TableRow>
            ) : (
              products.map((product) => {
                const inventory = getInventory(product)
                return (
                  <TableRow key={product.id} className={cn("cursor-pointer", selected.has(product.id) && "bg-muted/50")} onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                    <TableCell onClick={(e) => e.stopPropagation()}><Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} /></TableCell>
                    <TableCell>
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" /> /* eslint-disable-line @next/next/no-img-element */
                        : <div className="h-10 w-10 rounded-md bg-muted" />}
                    </TableCell>
                    <TableCell><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">/{product.slug}</p></TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status as "draft" | "published" | "scheduled" | "archived"} />
                      {product.is_featured && <span className="ml-1.5 text-xs text-amber-500">★</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{getPriceRange(product)}</TableCell>
                    <TableCell className="text-right">
                      {product.product_variants.length > 0
                        ? <span className={cn("font-mono text-sm", inventory <= 0 ? "text-red-500" : inventory <= 10 ? "text-amber-500" : "")}>{inventory}</span>
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><span className="text-sm">{product.product_variants.length}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><IconDots className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}><IconPencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          {product.status === "published" && <DropdownMenuItem asChild><a href={`/products/${product.slug}`} target="_blank"><IconEye className="mr-2 h-4 w-4" />View Live</a></DropdownMenuItem>}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async () => {
                            if (!confirm(`Delete "${product.name}"?`)) return
                            await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" })
                            fetchProducts()
                          }}><IconTrash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}><IconChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">Page {pagination.page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}><IconChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* New Product Drawer */}
      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={() => fetchProducts()}
      />
    </div>
  )
}