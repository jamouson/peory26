// =============================================================================
// File: src/components/admin/product-drawer.tsx
// Description: Side drawer (Sheet) for creating AND editing products.
//   - Sticky header with title + status badge (edit mode)
//   - Scrollable form body with logically grouped sections
//   - Unified variant configurator for both create and edit modes:
//     Step 1: pick which variation templates apply (dropdown)
//     Step 2: multi-select values per template (popover checkboxes)
//     Step 3: collapsible variant list with expand-to-edit rows
//   - Edit mode: rebuilds selections from existing variants, syncs via PUT
//   - Sticky footer with context-aware save actions
//   - Auto-generates slug from product name
// =============================================================================

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  IconX,
  IconLoader2,
  IconDeviceFloppy,
  IconRocket,
  IconPhoto,
  IconCurrencyDollar,
  IconSearch,
  IconSettings,
  IconInfoCircle,
  IconPackage,
  IconCheck,
  IconTrash,
  IconSelector,
  IconChevronDown,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ImageUpload } from "./image-upload"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** If provided, opens in edit mode */
  productId?: string | null
}

interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  compare_at_price: number | null
  images: string[]
  status: string
  scheduled_publish_date: string | null
  meta_title: string
  meta_description: string
  requires_shipping: boolean
  is_featured: boolean
  product_variants?: EditVariant[]
}

interface EditVariant {
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
  product_variant_options: {
    variant_id: string
    template_id: string
    value_id: string
    variation_templates: { id: string; name: string }
    variation_template_values: { id: string; value: string }
  }[]
}

interface TemplateValue {
  id: string
  value: string
  display_order: number
}

interface VariationTemplate {
  id: string
  name: string
  display_order: number
  variation_template_values: TemplateValue[]
}

/** A variant row for both create and edit mode */
interface NewVariant {
  key: string
  sku: string
  price: string
  compare_at_price: string
  inventory_count: string
  is_active: boolean
  options: Record<string, string>
  label: string
  /** Set when editing — the DB variant ID */
  existingId?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "archived", label: "Archived" },
]

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
}

/** Build a stable key from option IDs to preserve edits on regenerate */
function optionsKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|")
}

/** Cartesian product of all selected values across templates */
function generateCombinations(
  templates: VariationTemplate[],
  selections: Record<string, string[]>
): { options: Record<string, string>; label: string }[] {
  const active = templates
    .filter((t) => (selections[t.id] || []).length > 0)
    .sort((a, b) => a.display_order - b.display_order)

  if (active.length === 0) return []

  const result: { options: Record<string, string>; label: string }[] = []

  function recurse(
    idx: number,
    opts: Record<string, string>,
    parts: string[]
  ) {
    if (idx === active.length) {
      result.push({ options: { ...opts }, label: parts.join(" / ") })
      return
    }
    const t = active[idx]
    const sorted = t.variation_template_values
      .filter((v) => (selections[t.id] || []).includes(v.id))
      .sort((a, b) => a.display_order - b.display_order)

    for (const val of sorted) {
      recurse(idx + 1, { ...opts, [t.id]: val.id }, [...parts, val.value])
    }
  }

  recurse(0, {}, [])
  return result
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductDrawer({
  open,
  onOpenChange,
  onSuccess,
  productId,
}: ProductDrawerProps) {
  const isEditMode = !!productId

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState("draft")
  const [scheduledDate, setScheduledDate] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [requiresShipping, setRequiresShipping] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  // ── Variant state (both modes) ───────────────────────────────────────────
  const [templates, setTemplates] = useState<VariationTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [newVariants, setNewVariants] = useState<NewVariant[]>([])
  const [initialActiveTemplateIds, setInitialActiveTemplateIds] = useState<
    string[]
  >([])
  const [variantsInitialized, setVariantsInitialized] = useState(false)
  const [loadedEditVariants, setLoadedEditVariants] = useState<EditVariant[]>(
    []
  )

  // ── UI state ────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)

  // ── Reset ───────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setName("")
    setSlug("")
    setSlugManual(false)
    setDescription("")
    setBasePrice("")
    setCompareAtPrice("")
    setImages([])
    setStatus("draft")
    setScheduledDate("")
    setMetaTitle("")
    setMetaDescription("")
    setRequiresShipping(true)
    setIsFeatured(false)
    setSelections({})
    setNewVariants([])
    setInitialActiveTemplateIds([])
    setVariantsInitialized(false)
    setLoadedEditVariants([])
    setError(null)
    setSuccess(null)
  }, [])

  // ── Fetch variation templates (both modes) ──────────────────────────────
  useEffect(() => {
    if (!open) return

    setTemplatesLoading(true)
    fetch("/api/admin/variations")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => console.error("Failed to fetch variation templates"))
      .finally(() => setTemplatesLoading(false))
  }, [open])

  // ── Load product data (edit mode) ───────────────────────────────────────

  useEffect(() => {
    if (!open) {
      resetForm()
      return
    }

    if (isEditMode && productId) {
      setLoadingProduct(true)
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          const p: ProductData = data.product
          setName(p.name || "")
          setSlug(p.slug || "")
          setSlugManual(true)
          setDescription(p.description || "")
          setBasePrice(String(p.base_price ?? ""))
          setCompareAtPrice(
            p.compare_at_price ? String(p.compare_at_price) : ""
          )
          setImages(p.images || [])
          setStatus(p.status || "draft")
          setScheduledDate(p.scheduled_publish_date || "")
          setMetaTitle(p.meta_title || "")
          setMetaDescription(p.meta_description || "")
          setRequiresShipping(p.requires_shipping ?? true)
          setIsFeatured(p.is_featured ?? false)
          // Only load active variants — deactivated ones are hidden from edit UI
          setLoadedEditVariants(
            (p.product_variants || []).filter(
              (v: EditVariant) => v.is_active
            )
          )
        })
        .catch(() => setError("Failed to load product"))
        .finally(() => setLoadingProduct(false))
    }
  }, [open, isEditMode, productId, resetForm])

  // ── Derive variant state from existing variants + templates ─────────────
  useEffect(() => {
    if (
      !isEditMode ||
      variantsInitialized ||
      templates.length === 0 ||
      loadedEditVariants.length === 0
    )
      return

    // Collect active template IDs and selections from existing variant options
    const templateIds = new Set<string>()
    const sels: Record<string, Set<string>> = {}

    for (const v of loadedEditVariants) {
      for (const opt of v.product_variant_options || []) {
        templateIds.add(opt.template_id)
        if (!sels[opt.template_id]) sels[opt.template_id] = new Set()
        sels[opt.template_id].add(opt.value_id)
      }
    }

    const activeIds = Array.from(templateIds)
    const derivedSelections: Record<string, string[]> = {}
    for (const [tid, vals] of Object.entries(sels)) {
      derivedSelections[tid] = Array.from(vals)
    }

    // Convert existing variants to NewVariant format
    const converted: NewVariant[] = loadedEditVariants.map((v) => {
      const opts: Record<string, string> = {}
      const labelParts: string[] = []

      for (const opt of v.product_variant_options || []) {
        opts[opt.template_id] = opt.value_id
        labelParts.push(opt.variation_template_values?.value || "")
      }

      return {
        key: optionsKey(opts),
        sku: v.sku || "",
        price: String(v.price ?? "0"),
        compare_at_price: v.compare_at_price
          ? String(v.compare_at_price)
          : "",
        inventory_count: String(v.inventory_count ?? 0),
        is_active: v.is_active ?? true,
        options: opts,
        label: labelParts.filter(Boolean).join(" / ") || v.sku,
        existingId: v.id,
      }
    })

    setInitialActiveTemplateIds(activeIds)
    setSelections(derivedSelections)
    setNewVariants(converted)
    setVariantsInitialized(true)
  }, [isEditMode, templates, loadedEditVariants, variantsInitialized])

  // ── Auto-slug ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slugManual && name) {
      setSlug(slugify(name))
    }
  }, [name, slugManual])

  // ── Toggle a variation value ─────────────────────────────────────────
  const toggleValue = useCallback((templateId: string, valueId: string) => {
    setSelections((prev) => {
      const current = prev[templateId] || []
      const next = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId]
      return { ...prev, [templateId]: next }
    })
  }, [])

  const toggleAllValues = useCallback(
    (templateId: string, allValueIds: string[]) => {
      setSelections((prev) => {
        const current = prev[templateId] || []
        const allSelected = allValueIds.every((id) => current.includes(id))
        return { ...prev, [templateId]: allSelected ? [] : [...allValueIds] }
      })
    },
    []
  )

  // ── Regenerate variants on selection change ──────────────────────────────
  const combinationCount = useMemo(() => {
    const counts = Object.values(selections)
      .map((a) => a.length)
      .filter((n) => n > 0)
    return counts.length > 0 ? counts.reduce((a, b) => a * b, 1) : 0
  }, [selections])

  useEffect(() => {
    if (templates.length === 0) return

    const combos = generateCombinations(templates, selections)
    const existingByKey = new Map(newVariants.map((v) => [v.key, v]))

    const next: NewVariant[] = combos.map((c) => {
      const key = optionsKey(c.options)
      const existing = existingByKey.get(key)
      // Preserve existing data (price, sku, existingId) when regenerating
      if (existing) return { ...existing, label: c.label }
      return {
        key,
        sku: "",
        price: basePrice || "0",
        compare_at_price: "",
        inventory_count: "0",
        is_active: true,
        options: c.options,
        label: c.label,
      }
    })

    setNewVariants(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections, templates])

  // ── Update a variant field ─────────────────────────────────
  const updateNewVariant = useCallback(
    (key: string, field: keyof NewVariant, value: string | boolean) => {
      setNewVariants((prev) =>
        prev.map((v) => (v.key === key ? { ...v, [field]: value } : v))
      )
    },
    []
  )

  const removeNewVariant = useCallback((key: string) => {
    setNewVariants((prev) => prev.filter((v) => v.key !== key))
  }, [])

  const applyBulkPrice = useCallback(() => {
    setNewVariants((prev) =>
      prev.map((v) => ({ ...v, price: basePrice || "0" }))
    )
  }, [basePrice])

  // ── Save handler ────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (publishStatus?: string) => {
      setError(null)
      setSuccess(null)

      if (!name.trim()) {
        setError("Product name is required")
        return
      }
      if (!basePrice || parseFloat(basePrice) < 0) {
        setError("Base price is required and must be >= 0")
        return
      }

      setSaving(true)

      const payload: Record<string, unknown> = {
        name: name.trim(),
        slug: slug.trim() || slugify(name.trim()),
        description: description.trim() || null,
        base_price: parseFloat(basePrice),
        compare_at_price: compareAtPrice
          ? parseFloat(compareAtPrice)
          : null,
        images,
        status: publishStatus || status,
        scheduled_publish_date:
          (publishStatus || status) === "scheduled" && scheduledDate
            ? scheduledDate
            : null,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        requires_shipping: requiresShipping,
        is_featured: isFeatured,
      }

      // Include variants in create mode
      if (!isEditMode && newVariants.length > 0) {
        payload.variants = newVariants.map((v) => ({
          sku: v.sku.trim() || null,
          price: parseFloat(v.price) || parseFloat(basePrice) || 0,
          compare_at_price: v.compare_at_price
            ? parseFloat(v.compare_at_price)
            : null,
          inventory_count: parseInt(v.inventory_count) || 0,
          is_active: v.is_active,
          options: v.options,
        }))
      }

      try {
        const url = isEditMode
          ? `/api/admin/products/${productId}`
          : "/api/admin/products"
        const method = isEditMode ? "PUT" : "POST"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(
            data.error ||
              `Failed to ${isEditMode ? "update" : "create"} product`
          )
        }

        // Sync variants in edit mode
        if (isEditMode && productId) {
          const variantPayload = newVariants.map((v) => ({
            existingId: v.existingId || null,
            sku: v.sku.trim() || null,
            price: parseFloat(v.price) || parseFloat(basePrice) || 0,
            compare_at_price: v.compare_at_price
              ? parseFloat(v.compare_at_price)
              : null,
            inventory_count: parseInt(v.inventory_count) || 0,
            is_active: v.is_active,
            options: v.options,
          }))

          const variantRes = await fetch(
            `/api/admin/products/${productId}/variants`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ variants: variantPayload }),
            }
          )

          if (!variantRes.ok) {
            const vData = await variantRes.json()
            throw new Error(vData.error || "Failed to sync variants")
          }
        }

        if (isEditMode) {
          setSuccess("Product updated successfully")
          setTimeout(() => setSuccess(null), 3000)
        } else {
          onOpenChange(false)
        }

        onSuccess?.()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        )
      } finally {
        setSaving(false)
      }
    },
    [
      name,
      slug,
      description,
      basePrice,
      compareAtPrice,
      images,
      status,
      scheduledDate,
      metaTitle,
      metaDescription,
      requiresShipping,
      isFeatured,
      newVariants,
      isEditMode,
      productId,
      onOpenChange,
      onSuccess,
    ]
  )

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl [&>button.absolute]:hidden">
        {/* ── Sticky header ─────────────────────────────────────── */}
        <SheetHeader className="flex-none border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-lg font-semibold">
                {isEditMode ? "Edit Product" : "New Product"}
              </SheetTitle>
              {isEditMode && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", STATUS_COLORS[status] || "")}
                >
                  {status}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loadingProduct ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Error / Success */}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* ── Section 1: Product Details ────────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconInfoCircle className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Product Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Classic Chocolate Cake"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug">Slug</Label>
                      {slugManual && (
                        <button
                          type="button"
                          className="text-primary text-xs underline underline-offset-4"
                          onClick={() => {
                            setSlugManual(false)
                            setSlug(slugify(name))
                          }}
                        >
                          Auto-generate
                        </button>
                      )}
                    </div>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlugManual(true)
                        setSlug(e.target.value)
                      }}
                      placeholder="classic-chocolate-cake"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product..."
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <hr />

              {/* ── Section 2: Images ─────────────────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconPhoto className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Images</h3>
                </div>
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={8}
                />
              </section>

              <hr />

              {/* ── Section 3: Pricing ────────────────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconCurrencyDollar className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Pricing</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price ($)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="compare_at_price">
                      Compare at Price ($)
                    </Label>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </section>

              <hr />

              {/* ── Section 4: Variants ───────────────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconPackage className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Variants</h3>
                  {newVariants.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {newVariants.length}
                    </Badge>
                  )}
                </div>

                <CreateModeVariants
                  templates={templates}
                  templatesLoading={templatesLoading}
                  selections={selections}
                  toggleValue={toggleValue}
                  toggleAllValues={toggleAllValues}
                  clearTemplateSelection={(id: string) =>
                    setSelections((prev) => {
                      const next = { ...prev }
                      delete next[id]
                      return next
                    })
                  }
                  initialActiveTemplateIds={initialActiveTemplateIds}
                  combinationCount={combinationCount}
                  variants={newVariants}
                  updateVariant={updateNewVariant}
                  removeVariant={removeNewVariant}
                  applyBulkPrice={applyBulkPrice}
                />
              </section>

              <hr />

              {/* ── Section 5: Status & Options ───────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconSettings className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">Status & Options</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {status === "scheduled" && (
                    <div>
                      <Label htmlFor="scheduled_date">Publish Date</Label>
                      <Input
                        id="scheduled_date"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="featured">Featured</Label>
                        <p className="text-muted-foreground text-xs">
                          Show on the homepage
                        </p>
                      </div>
                      <Switch
                        id="featured"
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shipping">Requires Shipping</Label>
                        <p className="text-muted-foreground text-xs">
                          Physical product that needs delivery
                        </p>
                      </div>
                      <Switch
                        id="shipping"
                        checked={requiresShipping}
                        onCheckedChange={setRequiresShipping}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <hr />

              {/* ── Section 6: SEO ────────────────────────────────── */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <IconSearch className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">SEO</h3>
                </div>

                {/* Google preview */}
                <div className="mb-4 rounded-lg border bg-white p-4">
                  <p className="truncate text-sm text-blue-600">
                    {metaTitle || name || "Product Title"}
                  </p>
                  <p className="truncate text-xs text-green-700">
                    example.com/products/{slug || "product-slug"}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {metaDescription ||
                      description ||
                      "Product description will appear here..."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <span
                        className={cn(
                          "text-xs",
                          metaTitle.length > 60
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {metaTitle.length}/60
                      </span>
                    </div>
                    <Input
                      id="meta_title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={name || "Meta title..."}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta_description">
                        Meta Description
                      </Label>
                      <span
                        className={cn(
                          "text-xs",
                          metaDescription.length > 160
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {metaDescription.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="meta_description"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Describe this product for search engines..."
                      rows={2}
                    />
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>

        {/* ── Sticky footer ─────────────────────────────────────── */}
        <div className="flex-none border-t bg-background px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Close
                </Button>
                <Button onClick={() => handleSave()} disabled={saving}>
                  {saving && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                >
                  {saving && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSave("published")}
                  disabled={saving}
                >
                  {saving && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <IconRocket className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// CreateModeVariants — Step 1: pick templates, Step 2: multi-select values
// ---------------------------------------------------------------------------

function CreateModeVariants({
  templates,
  templatesLoading,
  selections,
  toggleValue,
  toggleAllValues,
  clearTemplateSelection,
  initialActiveTemplateIds,
  combinationCount,
  variants,
  updateVariant,
  removeVariant,
  applyBulkPrice,
}: {
  templates: VariationTemplate[]
  templatesLoading: boolean
  selections: Record<string, string[]>
  toggleValue: (templateId: string, valueId: string) => void
  toggleAllValues: (templateId: string, allValueIds: string[]) => void
  clearTemplateSelection: (templateId: string) => void
  initialActiveTemplateIds: string[]
  combinationCount: number
  variants: NewVariant[]
  updateVariant: (
    key: string,
    field: keyof NewVariant,
    value: string | boolean
  ) => void
  removeVariant: (key: string) => void
  applyBulkPrice: () => void
}) {
  // Which templates the user has added to this product
  const [activeTemplateIds, setActiveTemplateIds] = useState<string[]>([])

  // ── Sync from parent when editing an existing product ───────────────────
  // Uses the React-recommended "adjust state during render" pattern
  // instead of useEffect to avoid cascading renders.
  // See: https://react.dev/learn/you-might-not-need-an-effect
  const [prevInitialIds, setPrevInitialIds] = useState<string[]>([])

  if (
    initialActiveTemplateIds.length > 0 &&
    initialActiveTemplateIds !== prevInitialIds
  ) {
    setPrevInitialIds(initialActiveTemplateIds)
    setActiveTemplateIds(initialActiveTemplateIds)
  }

  const activeTemplates = templates.filter((t) =>
    activeTemplateIds.includes(t.id)
  )
  const availableTemplates = templates.filter(
    (t) => !activeTemplateIds.includes(t.id)
  )

  const addTemplate = (templateId: string) => {
    setActiveTemplateIds((prev) => [...prev, templateId])
  }

  const removeTemplate = (templateId: string) => {
    setActiveTemplateIds((prev) => prev.filter((id) => id !== templateId))
    clearTemplateSelection(templateId)
  }

  const totalSelected = Object.values(selections).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <IconPackage className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          No variation templates found. Create templates (e.g. Size, Color) in
          the{" "}
          <a
            href="/dashboard/variations"
            className="text-primary underline underline-offset-4"
          >
            Variations
          </a>{" "}
          page first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Step 1: Add a variation template ───────────────────────── */}
      {availableTemplates.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-sm">Add variation</Label>
          <Select onValueChange={(val) => addTemplate(val)} value="">
            <SelectTrigger>
              <SelectValue placeholder="Select a variation type..." />
            </SelectTrigger>
            <SelectContent>
              {availableTemplates
                .sort((a, b) => a.display_order - b.display_order)
                .map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Step 2: Value dropdowns for each active template ───────── */}
      {activeTemplates
        .sort((a, b) => a.display_order - b.display_order)
        .map((template) => {
          const values = template.variation_template_values || []
          const selected = selections[template.id] || []
          const allSelected =
            values.length > 0 &&
            values.every((v) => selected.includes(v.id))

          const selectedLabels = values
            .filter((v) => selected.includes(v.id))
            .sort((a, b) => a.display_order - b.display_order)
            .map((v) => v.value)

          return (
            <div key={template.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{template.name}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive h-6 px-2 text-xs"
                  onClick={() => removeTemplate(template.id)}
                >
                  <IconX className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className={cn(
                      "w-full justify-between font-normal",
                      selected.length === 0 && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selected.length === 0
                        ? `Select ${template.name.toLowerCase()} values...`
                        : selected.length === values.length
                          ? `All ${template.name.toLowerCase()} values (${values.length})`
                          : selectedLabels.length <= 3
                            ? selectedLabels.join(", ")
                            : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`}
                    </span>
                    <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <div className="max-h-60 overflow-y-auto p-1">
                    {/* Select all */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleAllValues(
                          template.id,
                          values.map((v) => v.id)
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                          allSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {allSelected && <IconCheck className="h-3 w-3" />}
                      </div>
                      <span className="font-medium">Select all</span>
                    </button>

                    <div className="my-1 h-px bg-border" />

                    {/* Individual values */}
                    {values
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((val) => {
                        const isChecked = selected.includes(val.id)
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() =>
                              toggleValue(template.id, val.id)
                            }
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                                isChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                              )}
                            >
                              {isChecked && (
                                <IconCheck className="h-3 w-3" />
                              )}
                            </div>
                            {val.value}
                          </button>
                        )
                      })}
                  </div>
                </PopoverContent>
              </Popover>
              {/* Selected badges */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedLabels.map((label, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )
        })}

      {/* ── Collapsible variant panel ──────────────────────────────── */}
      {variants.length > 0 && (
        <VariantPanel
          variants={variants}
          updateVariant={updateVariant}
          removeVariant={removeVariant}
          applyBulkPrice={applyBulkPrice}
        />
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {activeTemplateIds.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-muted-foreground text-sm">
            Add a variation above to configure variants. This is optional — you
            can also add variants after creating the product.
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// VariantPanel — collapsible panel with summary, bulk actions, expandable rows
// ---------------------------------------------------------------------------

function VariantPanel({
  variants,
  updateVariant,
  removeVariant,
  applyBulkPrice,
}: {
  variants: NewVariant[]
  updateVariant: (
    key: string,
    field: keyof NewVariant,
    value: string | boolean
  ) => void
  removeVariant: (key: string) => void
  applyBulkPrice: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // Summary stats
  const activeCount = variants.filter((v) => v.is_active).length
  const prices = variants.map((v) => parseFloat(v.price) || 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceLabel =
    minPrice === maxPrice
      ? `$${minPrice.toFixed(2)}`
      : `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`

  return (
    <div className="rounded-lg border">
      {/* ── Collapsed summary header — always visible ──────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <IconChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
          <span className="text-sm font-medium">
            {variants.length} variant{variants.length !== 1 ? "s" : ""}
          </span>
          {activeCount < variants.length && (
            <span className="text-xs text-muted-foreground">
              ({activeCount} active)
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {priceLabel}
        </span>
      </button>

      {/* ── Expanded content ───────────────────────────────────── */}
      {isOpen && (
        <div className="border-t">
          {/* Bulk actions */}
          <div className="border-b bg-muted/30 px-4 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Set all prices ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Bulk price"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    if (e.target.value) {
                      variants.forEach((v) =>
                        updateVariant(v.key, "price", e.target.value)
                      )
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value
                      if (val) {
                        variants.forEach((v) =>
                          updateVariant(v.key, "price", val)
                        )
                      }
                    }
                  }}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Set all inventory
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Bulk inventory"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    if (e.target.value) {
                      variants.forEach((v) =>
                        updateVariant(
                          v.key,
                          "inventory_count",
                          e.target.value
                        )
                      )
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value
                      if (val) {
                        variants.forEach((v) =>
                          updateVariant(v.key, "inventory_count", val)
                        )
                      }
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={applyBulkPrice}
              className="text-xs"
            >
              Reset all to base price
            </Button>
          </div>

          {/* Variant rows — scrollable, max 5 visible */}
          <div className="divide-y max-h-[240px] overflow-y-auto">
            {variants.map((variant) => {
              const isExpanded = expandedKey === variant.key
              const price = parseFloat(variant.price) || 0

              return (
                <div key={variant.key}>
                  {/* Compact row */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedKey(isExpanded ? null : variant.key)
                    }
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                  >
                    <IconChevronDown
                      className={cn(
                        "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                    <span className="flex-1 text-sm truncate">
                      {variant.label}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ${price.toFixed(2)}
                    </span>
                    {!variant.is_active && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground"
                      >
                        Inactive
                      </Badge>
                    )}
                  </button>

                  {/* Expanded edit fields */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 px-4 py-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(
                                variant.key,
                                "sku",
                                e.target.value
                              )
                            }
                            placeholder="Auto-generated"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(
                                variant.key,
                                "price",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Compare at ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.compare_at_price}
                            onChange={(e) =>
                              updateVariant(
                                variant.key,
                                "compare_at_price",
                                e.target.value
                              )
                            }
                            placeholder="Optional"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Inventory</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.inventory_count}
                            onChange={(e) =>
                              updateVariant(
                                variant.key,
                                "inventory_count",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`active-${variant.key}`}
                            checked={variant.is_active}
                            onCheckedChange={(checked) =>
                              updateVariant(
                                variant.key,
                                "is_active",
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`active-${variant.key}`}
                            className="text-xs font-normal"
                          >
                            Active
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-7 text-xs"
                          onClick={() => removeVariant(variant.key)}
                        >
                          <IconTrash className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}