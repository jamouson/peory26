// =============================================================================
// File: src/components/admin/product-form.tsx
// Description: Product create/edit form. Used on the /products/[id]/edit page.
//   - Left column: name, slug, description, images, pricing, variants, SEO
//   - Right sidebar: status, scheduling, featured toggle, shipping, summary
//   - Auto-generates slug from name on create
//   - Redirects to /products/[id]/edit after create (for variant management)
//   - SEO section with Google preview and character counters
//   UPDATED: All navigation routes now use /products instead of /dashboard/products
// =============================================================================

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { IconLoader2, IconArrowLeft, IconDeviceFloppy, IconEye } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "./image-upload"
import { VariantManager } from "./variant-manager"
import { ProductStatusBadge } from "./product-status-badge"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  compare_at_price: number | null
  images: string[]
  status: string
  scheduled_publish_date: string | null
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  requires_shipping: boolean
  is_featured: boolean
  product_variants: Variant[]
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
  product_variant_options: {
    variant_id: string
    template_id: string
    value_id: string
    variation_templates: { id: string; name: string }
    variation_template_values: { id: string; value: string }
  }[]
}

interface ProductFormProps {
  product?: Product
  mode: "create" | "edit"
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "")
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [autoSlug, setAutoSlug] = useState(mode === "create")
  const [variants, setVariants] = useState<Variant[]>(product?.product_variants ?? [])

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    base_price: product?.base_price ? String(product.base_price) : "",
    compare_at_price: product?.compare_at_price ? String(product.compare_at_price) : "",
    images: product?.images ?? [],
    status: product?.status ?? "draft",
    scheduled_publish_date: product?.scheduled_publish_date ? product.scheduled_publish_date.slice(0, 16) : "",
    meta_title: product?.meta_title ?? "",
    meta_description: product?.meta_description ?? "",
    requires_shipping: product?.requires_shipping ?? true,
    is_featured: product?.is_featured ?? false,
  })

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && form.name) setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
  }, [form.name, autoSlug])

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "slug") setAutoSlug(false)
  }, [])

  const handleSave = async (overrideStatus?: string) => {
    if (!form.name || !form.slug || !form.base_price) {
      setError("Name, slug, and base price are required"); return
    }

    setSaving(true); setError(""); setSuccess("")

    const payload = {
      ...form,
      base_price: parseFloat(form.base_price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      status: overrideStatus ?? form.status,
      scheduled_publish_date:
        form.status === "scheduled" && form.scheduled_publish_date
          ? new Date(form.scheduled_publish_date).toISOString()
          : null,
    }

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.id}`
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || "Failed to save product"); setSaving(false); return }

      if (mode === "create") {
        router.push(`/products/${data.product.id}/edit`)
      } else {
        setSuccess("Product saved successfully")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch { setError("Network error. Please try again.") } finally { setSaving(false) }
  }

  const seoTitleLength = (form.meta_title || form.name).length
  const seoDescLength = (form.meta_description || form.description).length

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/products")}>
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{mode === "create" ? "New Product" : "Edit Product"}</h1>
            {product && (
              <div className="mt-0.5 flex items-center gap-2">
                <ProductStatusBadge status={product.status as "draft" | "published" | "scheduled" | "archived"} />
                {product.published_at && (
                  <span className="text-xs text-muted-foreground">Published {new Date(product.published_at).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === "edit" && form.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/products/${form.slug}`} target="_blank"><IconEye className="mr-1.5 h-4 w-4" />View</a>
            </Button>
          )}
          {form.status === "draft" && (
            <Button variant="outline" size="sm" onClick={() => handleSave("published")} disabled={saving}>Publish Now</Button>
          )}
          <Button size="sm" onClick={() => handleSave()} disabled={saving}>
            {saving ? <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <IconDeviceFloppy className="mr-1.5 h-4 w-4" />}
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Basic info */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">Product Details</h2>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Classic Cotton Tee" />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">URL Slug *</Label>
                  {mode === "create" && (
                    <button type="button" onClick={() => { setAutoSlug(true); setForm((prev) => ({ ...prev, slug: slugify(prev.name) })) }} className="text-xs text-primary hover:underline">Auto-generate</button>
                  )}
                </div>
                <Input id="slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="classic-cotton-tee" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">/products/{form.slug || "..."}</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your product..." rows={4} />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">Images</h2>
            <ImageUpload images={form.images} onChange={(images) => updateField("images", images)} />
          </section>

          {/* Pricing */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="base_price">Base Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input id="base_price" type="number" step="0.01" min="0" value={form.base_price} onChange={(e) => updateField("base_price", e.target.value)} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="compare_at_price">Compare at Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input id="compare_at_price" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => updateField("compare_at_price", e.target.value)} placeholder="0.00" className="pl-7" />
                </div>
                <p className="text-xs text-muted-foreground">Show as original price with strikethrough</p>
              </div>
            </div>
          </section>

          {/* Variants (edit mode only) */}
          {mode === "edit" && product && (
            <section className="rounded-lg border bg-card p-5">
              <VariantManager productId={product.id} variants={variants} onVariantsChange={setVariants} />
            </section>
          )}
          {mode === "create" && (
            <section className="rounded-lg border border-dashed bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">Save the product first, then you can add variants with sizes, colors, and inventory.</p>
            </section>
          )}

          {/* SEO */}
          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">Search Engine Optimization</h2>
            <div className="mb-4 rounded-md bg-muted/50 p-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{form.meta_title || form.name || "Product Title"}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500">yourstore.com/products/{form.slug || "..."}</p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{form.meta_description || form.description || "Product description will appear here..."}</p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <span className={cn("text-xs", seoTitleLength > 60 ? "text-red-500" : "text-muted-foreground")}>{seoTitleLength}/60</span>
                </div>
                <Input id="meta_title" value={form.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} placeholder={form.name || "Page title for search engines"} />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <span className={cn("text-xs", seoDescLength > 160 ? "text-red-500" : "text-muted-foreground")}>{seoDescLength}/160</span>
                </div>
                <Textarea id="meta_description" value={form.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} placeholder={form.description || "Description for search engine results"} rows={2} />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">Status</h3>
            <Select value={form.status} onValueChange={(val) => updateField("status", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {form.status === "scheduled" && (
              <div className="mt-3 grid gap-1.5">
                <Label htmlFor="publish_date" className="text-xs">Publish Date & Time</Label>
                <Input id="publish_date" type="datetime-local" value={form.scheduled_publish_date} onChange={(e) => updateField("scheduled_publish_date", e.target.value)} />
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-sm">Featured product</Label>
                <Switch id="featured" checked={form.is_featured} onCheckedChange={(checked) => updateField("is_featured", checked)} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="shipping" className="text-sm">Requires shipping</Label>
                <Switch id="shipping" checked={form.requires_shipping} onCheckedChange={(checked) => updateField("requires_shipping", checked)} />
              </div>
            </div>
          </section>

          {mode === "edit" && (
            <section className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium">Summary</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Variants</dt><dd className="font-medium">{variants.length}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Total inventory</dt><dd className="font-medium">{variants.reduce((sum, v) => sum + (v.is_active ? v.inventory_count : 0), 0)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Price range</dt>
                  <dd className="font-medium">
                    {variants.length > 0
                      ? `$${Math.min(...variants.map((v) => Number(v.price))).toFixed(2)} – $${Math.max(...variants.map((v) => Number(v.price))).toFixed(2)}`
                      : `$${Number(form.base_price || 0).toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Images</dt><dd className="font-medium">{form.images.length}</dd></div>
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
