// =============================================================================
// File: src/components/admin/product-drawer.tsx
// Description: Side drawer (Sheet) for creating AND editing products.
//   CREATE mode: Opens empty form, saves via POST, then refreshes list.
//   EDIT mode:   Fetches product by ID, populates form, saves via PUT,
//                includes VariantManager for managing product variants.
//   - Sticky header with title, status badge (edit), close button
//   - Scrollable form body with logically grouped sections
//   - Sticky footer with context-aware save actions
//   - Auto-generates slug from product name (create only)
// =============================================================================

"use client"

import { useCallback, useEffect, useState } from "react"
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
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { ImageUpload } from "./image-upload"
import { VariantManager } from "./variant-manager"
import { ProductStatusBadge } from "./product-status-badge"

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
  product_variant_options: {
    variant_id: string
    template_id: string
    value_id: string
    variation_templates: { id: string; name: string }
    variation_template_values: { id: string; value: string }
  }[]
}

interface ProductDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string | null
  onSuccess?: () => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const initialForm = {
  name: "",
  slug: "",
  description: "",
  base_price: "",
  compare_at_price: "",
  images: [] as string[],
  status: "draft",
  scheduled_publish_date: "",
  meta_title: "",
  meta_description: "",
  requires_shipping: true,
  is_featured: false,
}

export function ProductDrawer({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: ProductDrawerProps) {
  const isEdit = !!productId
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [autoSlug, setAutoSlug] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [variants, setVariants] = useState<Variant[]>([])

  // Fetch product data in edit mode, reset in create mode
  useEffect(() => {
    if (!open) return

    setError("")
    setSuccess("")

    if (isEdit) {
      setAutoSlug(false)
      setLoading(true)
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            const p = data.product
            setForm({
              name: p.name ?? "",
              slug: p.slug ?? "",
              description: p.description ?? "",
              base_price: p.base_price != null ? String(p.base_price) : "",
              compare_at_price:
                p.compare_at_price != null ? String(p.compare_at_price) : "",
              images: p.images ?? [],
              status: p.status ?? "draft",
              scheduled_publish_date: p.scheduled_publish_date
                ? p.scheduled_publish_date.slice(0, 16)
                : "",
              meta_title: p.meta_title ?? "",
              meta_description: p.meta_description ?? "",
              requires_shipping: p.requires_shipping ?? true,
              is_featured: p.is_featured ?? false,
            })
            setVariants(p.product_variants ?? [])
          } else {
            setError("Product not found")
          }
        })
        .catch(() => setError("Failed to load product"))
        .finally(() => setLoading(false))
    } else {
      setForm(initialForm)
      setAutoSlug(true)
      setVariants([])
    }
  }, [open, productId, isEdit])

  // Auto-generate slug from name (create mode only)
  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [form.name, autoSlug])

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "slug") setAutoSlug(false)
  }, [])

  const handleSave = async (overrideStatus?: string) => {
    if (!form.name || !form.slug || !form.base_price) {
      setError("Name, slug, and base price are required")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    const payload = {
      ...form,
      base_price: parseFloat(form.base_price),
      compare_at_price: form.compare_at_price
        ? parseFloat(form.compare_at_price)
        : null,
      status: overrideStatus ?? form.status,
      scheduled_publish_date:
        form.status === "scheduled" && form.scheduled_publish_date
          ? new Date(form.scheduled_publish_date).toISOString()
          : null,
    }

    try {
      const url = isEdit
        ? `/api/admin/products/${productId}`
        : "/api/admin/products"
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save product")
        setSaving(false)
        return
      }

      onSuccess?.()

      if (isEdit) {
        setSuccess("Product saved successfully")
        // Update form status in case it changed
        if (overrideStatus) {
          setForm((prev) => ({ ...prev, status: overrideStatus }))
        }
        setTimeout(() => setSuccess(""), 3000)
      } else {
        // After create, close and reopen as edit so variants are available
        onOpenChange(false)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const seoTitleLength = (form.meta_title || form.name).length
  const seoDescLength = (form.meta_description || form.description).length

  const totalInventory = variants.reduce(
    (sum, v) => sum + (v.is_active ? v.inventory_count : 0),
    0
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg [&>button[data-slot=sheet-close]]:hidden [&>button.absolute]:hidden">
        {/* ── Sticky header ─────────────────────────────────────── */}
        <SheetHeader className="flex-none border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SheetTitle className="text-lg font-semibold">
                {isEdit ? "Edit Product" : "New Product"}
              </SheetTitle>
              {isEdit && form.status && (
                <ProductStatusBadge
                  status={
                    form.status as
                      | "draft"
                      | "published"
                      | "scheduled"
                      | "archived"
                  }
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <IconX className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update product details and manage variants."
              : "Fill in product details. You can add variants after saving."}
          </p>
        </SheetHeader>

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6 px-6 py-5">
              {/* Messages */}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {success}
                </div>
              )}

              {/* ─── Section: Product Details ──────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                  Product Details
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-name">
                      Product Name{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="drawer-name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Classic Cotton Tee"
                      autoFocus={!isEdit}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="drawer-slug">
                        URL Slug{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoSlug(true)
                          setForm((prev) => ({
                            ...prev,
                            slug: slugify(prev.name),
                          }))
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <Input
                      id="drawer-slug"
                      value={form.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="classic-cotton-tee"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      /products/{form.slug || "..."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-desc">Description</Label>
                    <Textarea
                      id="drawer-desc"
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Describe your product..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* ─── Section: Images ───────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconPhoto className="h-4 w-4 text-muted-foreground" />
                  Images
                </div>

                <ImageUpload
                  images={form.images}
                  onChange={(images) => updateField("images", images)}
                  maxImages={8}
                />
              </section>

              <hr className="border-border" />

              {/* ─── Section: Pricing ──────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
                  Pricing
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-price">
                      Base Price (USD){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="drawer-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.base_price}
                        onChange={(e) =>
                          updateField("base_price", e.target.value)
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-compare">Compare at Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="drawer-compare"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.compare_at_price}
                        onChange={(e) =>
                          updateField("compare_at_price", e.target.value)
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shown as strikethrough original price
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* ─── Section: Variants (edit mode only) ───────────── */}
              {isEdit && productId ? (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <IconPackage className="h-4 w-4 text-muted-foreground" />
                      Variants
                    </div>
                    <VariantManager
                      productId={productId}
                      variants={variants}
                      onVariantsChange={setVariants}
                    />
                  </section>
                  <hr className="border-border" />
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3.5 text-center">
                    <p className="text-sm text-muted-foreground">
                      Save the product first, then add variants with sizes,
                      colors, and inventory.
                    </p>
                  </div>
                  <hr className="border-border" />
                </>
              )}

              {/* ─── Section: Status & Options ─────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconSettings className="h-4 w-4 text-muted-foreground" />
                  Status & Options
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer-status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(val) => updateField("status", val)}
                    >
                      <SelectTrigger id="drawer-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.status === "scheduled" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="drawer-publish-date">
                        Publish Date & Time
                      </Label>
                      <Input
                        id="drawer-publish-date"
                        type="datetime-local"
                        value={form.scheduled_publish_date}
                        onChange={(e) =>
                          updateField("scheduled_publish_date", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="drawer-featured"
                          className="text-sm font-normal"
                        >
                          Featured product
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Highlight on homepage and collections
                        </p>
                      </div>
                      <Switch
                        id="drawer-featured"
                        checked={form.is_featured}
                        onCheckedChange={(checked) =>
                          updateField("is_featured", checked)
                        }
                      />
                    </div>

                    <hr className="border-border" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="drawer-shipping"
                          className="text-sm font-normal"
                        >
                          Requires shipping
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Physical product that needs to be shipped
                        </p>
                      </div>
                      <Switch
                        id="drawer-shipping"
                        checked={form.requires_shipping}
                        onCheckedChange={(checked) =>
                          updateField("requires_shipping", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* ─── Section: SEO ──────────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconSearch className="h-4 w-4 text-muted-foreground" />
                  Search Engine Optimization
                </div>

                {/* Google preview */}
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="truncate text-sm font-medium text-blue-600 dark:text-blue-400">
                    {form.meta_title || form.name || "Product Title"}
                  </p>
                  <p className="truncate text-xs text-emerald-700 dark:text-emerald-500">
                    yourstore.com/products/{form.slug || "..."}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {form.meta_description ||
                      form.description ||
                      "Product description will appear here..."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="drawer-seo-title">Meta Title</Label>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          seoTitleLength > 60
                            ? "text-red-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {seoTitleLength}/60
                      </span>
                    </div>
                    <Input
                      id="drawer-seo-title"
                      value={form.meta_title}
                      onChange={(e) =>
                        updateField("meta_title", e.target.value)
                      }
                      placeholder={
                        form.name || "Page title for search engines"
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="drawer-seo-desc">
                        Meta Description
                      </Label>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          seoDescLength > 160
                            ? "text-red-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {seoDescLength}/160
                      </span>
                    </div>
                    <Textarea
                      id="drawer-seo-desc"
                      value={form.meta_description}
                      onChange={(e) =>
                        updateField("meta_description", e.target.value)
                      }
                      placeholder={
                        form.description ||
                        "Description for search engine results"
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* ─── Summary (edit mode) ──────────────────────────── */}
              {isEdit && (
                <section className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="mb-2.5 text-sm font-medium">Summary</h4>
                  <dl className="grid gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Variants</dt>
                      <dd className="font-medium">{variants.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        Total inventory
                      </dt>
                      <dd className="font-medium">{totalInventory}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Price range</dt>
                      <dd className="font-medium">
                        {variants.length > 0
                          ? `$${Math.min(...variants.map((v) => Number(v.price))).toFixed(2)} – $${Math.max(...variants.map((v) => Number(v.price))).toFixed(2)}`
                          : `$${Number(form.base_price || 0).toFixed(2)}`}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Images</dt>
                      <dd className="font-medium">{form.images.length}</dd>
                    </div>
                  </dl>
                </section>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky footer ─────────────────────────────────────── */}
        {!loading && (
          <div className="flex-none border-t bg-background px-6 py-4">
            <div className="flex items-center gap-3">
              {isEdit ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleSave()}
                    disabled={saving}
                  >
                    {saving ? (
                      <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-1.5 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSave("draft")}
                    disabled={saving}
                  >
                    {saving ? (
                      <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-1.5 h-4 w-4" />
                    )}
                    Save as Draft
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleSave("published")}
                    disabled={saving}
                  >
                    {saving ? (
                      <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <IconRocket className="mr-1.5 h-4 w-4" />
                    )}
                    Publish Now
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}