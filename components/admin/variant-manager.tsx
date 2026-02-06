// =============================================================================
// File: src/components/admin/variant-manager.tsx
// Description: Variant management UI for the product edit page.
//   - Table view of existing variants (SKU, price, inventory, status)
//   - Add/Edit dialog with Size, Color, Material option pickers
//   - Delete with order-safety (deactivates instead of deleting if orders exist)
//   - Fetches variation templates from /api/admin/variations on mount
// =============================================================================

"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { IconPlus, IconTrash, IconPencil, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VariationTemplate {
  id: string
  name: string
  display_order: number
  variation_template_values: { id: string; value: string; display_order: number }[]
}

interface VariantOption {
  variant_id: string
  template_id: string
  value_id: string
  variation_templates: { id: string; name: string }
  variation_template_values: { id: string; value: string }
}

interface Variant {
  id: string
  sku: string
  price: number
  compare_at_price: number | null
  inventory_count: number
  track_inventory: boolean
  allow_backorder: boolean
  is_active: boolean
  image_url: string | null
  weight_grams: number | null
  product_variant_options: VariantOption[]
}

interface VariantManagerProps {
  productId: string
  variants: Variant[]
  onVariantsChange: (variants: Variant[]) => void
}

const emptyForm = {
  sku: "",
  price: "",
  compare_at_price: "",
  inventory_count: "0",
  track_inventory: true,
  allow_backorder: false,
  is_active: true,
  image_url: "",
  weight_grams: "",
  options: {} as Record<string, string>,
}

export function VariantManager({ productId, variants, onVariantsChange }: VariantManagerProps) {
  const [templates, setTemplates] = useState<VariationTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/admin/variations")
        if (res.ok) { const data = await res.json(); setTemplates(data.templates) }
      } catch (err) { console.error("Failed to fetch templates:", err) }
    }
    fetchTemplates()
  }, [])

  const openCreateDialog = () => { setEditingId(null); setForm(emptyForm); setError(""); setDialogOpen(true) }

  const openEditDialog = (variant: Variant) => {
    setEditingId(variant.id)
    const options: Record<string, string> = {}
    variant.product_variant_options?.forEach((opt) => { options[opt.template_id] = opt.value_id })
    setForm({
      sku: variant.sku,
      price: String(variant.price),
      compare_at_price: variant.compare_at_price ? String(variant.compare_at_price) : "",
      inventory_count: String(variant.inventory_count),
      track_inventory: variant.track_inventory,
      allow_backorder: variant.allow_backorder,
      is_active: variant.is_active,
      image_url: variant.image_url ?? "",
      weight_grams: variant.weight_grams ? String(variant.weight_grams) : "",
      options,
    })
    setError("")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.sku || !form.price) { setError("SKU and price are required"); return }
    setSaving(true); setError("")

    const options = Object.entries(form.options)
      .filter(([, valueId]) => valueId)
      .map(([templateId, valueId]) => ({ template_id: templateId, value_id: valueId }))

    const payload = {
      sku: form.sku, price: form.price,
      compare_at_price: form.compare_at_price || null,
      inventory_count: parseInt(form.inventory_count) || 0,
      track_inventory: form.track_inventory, allow_backorder: form.allow_backorder,
      is_active: form.is_active, image_url: form.image_url || null,
      weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
      options,
    }

    try {
      const res = editingId
        ? await fetch(`/api/admin/products/${productId}/variants/${editingId}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/products/${productId}/variants`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
          })

      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to save variant"); setSaving(false); return }

      if (editingId) {
        onVariantsChange(variants.map((v) => (v.id === editingId ? data.variant : v)))
      } else {
        onVariantsChange([...variants, data.variant])
      }
      setDialogOpen(false)
    } catch { setError("Network error") } finally { setSaving(false) }
  }

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.action === "deactivated") {
        onVariantsChange(variants.map((v) => v.id === variantId ? { ...v, is_active: false } : v))
      } else {
        onVariantsChange(variants.filter((v) => v.id !== variantId))
      }
    } catch { console.error("Failed to delete variant") } finally { setLoading(false) }
  }

  const getVariantLabel = (variant: Variant): string => {
    if (!variant.product_variant_options?.length) return variant.sku
    return variant.product_variant_options.map((o) => o.variation_template_values?.value).filter(Boolean).join(" / ")
  }

  const totalInventory = variants.reduce((sum, v) => sum + (v.is_active ? v.inventory_count : 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Variants <span className="text-muted-foreground">({variants.length})</span></h3>
          <p className="text-xs text-muted-foreground">Total inventory: {totalInventory} units</p>
        </div>
        <Button type="button" size="sm" onClick={openCreateDialog} disabled={loading}>
          <IconPlus className="mr-1.5 h-4 w-4" />Add Variant
        </Button>
      </div>

      {variants.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id} className={cn(!variant.is_active && "opacity-50")}>
                  <TableCell className="font-medium">{getVariantLabel(variant)}</TableCell>
                  <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                  <TableCell className="text-right">
                    ${Number(variant.price).toFixed(2)}
                    {variant.compare_at_price && (
                      <span className="ml-1.5 text-xs text-muted-foreground line-through">
                        ${Number(variant.compare_at_price).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {variant.track_inventory ? (
                      <span className={cn(
                        variant.inventory_count <= 0 ? "text-red-500" : variant.inventory_count <= 10 ? "text-amber-500" : ""
                      )}>{variant.inventory_count}</span>
                    ) : (<span className="text-muted-foreground">∞</span>)}
                  </TableCell>
                  <TableCell>
                    {variant.is_active
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><IconCheck className="h-3 w-3" /> Active</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-500"><IconX className="h-3 w-3" /> Inactive</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(variant)}>
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(variant.id)}>
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">No variants yet. Add variants with sizes, colors, or materials.</p>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Variant" : "Add Variant"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update variant details and inventory." : "Create a new product variant with pricing and inventory."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

            {/* Variation option selectors */}
            {templates.length > 0 && (
              <div className="grid gap-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Options</Label>
                {templates.map((template) => (
                  <div key={template.id} className="grid gap-1.5">
                    <Label className="text-sm">{template.name}</Label>
                    <Select
                      value={form.options[template.id] ?? ""}
                      onValueChange={(val) => setForm({ ...form, options: { ...form.options, [template.id]: val === "_none" ? "" : val } })}
                    >
                      <SelectTrigger><SelectValue placeholder={`Select ${template.name}`} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">None</SelectItem>
                        {template.variation_template_values.map((val) => (
                          <SelectItem key={val.id} value={val.id}>{val.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="var-sku">SKU *</Label>
                <Input id="var-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} placeholder="TEE-BLK-M" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="var-price">Price *</Label>
                <Input id="var-price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="29.99" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="var-compare">Compare at Price</Label>
                <Input id="var-compare" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} placeholder="39.99" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="var-weight">Weight (grams)</Label>
                <Input id="var-weight" type="number" min="0" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} placeholder="200" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="var-inv">Inventory Count</Label>
                <Input id="var-inv" type="number" min="0" value={form.inventory_count} onChange={(e) => setForm({ ...form, inventory_count: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="var-track" className="text-sm">Track inventory</Label>
                <Switch id="var-track" checked={form.track_inventory} onCheckedChange={(checked) => setForm({ ...form, track_inventory: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="var-backorder" className="text-sm">Allow backorders</Label>
                <Switch id="var-backorder" checked={form.allow_backorder} onCheckedChange={(checked) => setForm({ ...form, allow_backorder: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="var-active" className="text-sm">Active</Label>
                <Switch id="var-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="var-img">Variant Image URL</Label>
              <Input id="var-img" type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving && <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"} Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
