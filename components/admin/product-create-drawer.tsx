// =============================================================================
// File: src/components/admin/product-create-drawer.tsx
// Description: Side drawer (Sheet) for quick product creation.
//   Shows essential fields only: name, slug, price, compare-at, status.
//   After saving, redirects to /products/[id]/edit for full editing
//   (images, variants, SEO, etc.).
// =============================================================================

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface ProductCreateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  status: "draft",
}

export function ProductCreateDrawer({
  open,
  onOpenChange,
}: ProductCreateDrawerProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [autoSlug, setAutoSlug] = useState(true)
  const [form, setForm] = useState(initialForm)

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setForm(initialForm)
      setError("")
      setAutoSlug(true)
    }
  }, [open])

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [form.name, autoSlug])

  const handleSave = async (andEdit?: boolean) => {
    if (!form.name || !form.slug || !form.base_price) {
      setError("Name, slug, and base price are required")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          base_price: parseFloat(form.base_price),
          compare_at_price: form.compare_at_price
            ? parseFloat(form.compare_at_price)
            : null,
          images: [],
          requires_shipping: true,
          is_featured: false,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create product")
        setSaving(false)
        return
      }

      onOpenChange(false)

      if (andEdit) {
        router.push(`/products/${data.product.id}/edit`)
      } else {
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Product</SheetTitle>
          <SheetDescription>
            Add the basics, then continue editing for images, variants, and SEO.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid gap-5 px-1">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Product Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="drawer-name">Product Name *</Label>
              <Input
                id="drawer-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Classic Cotton Tee"
                autoFocus
              />
            </div>

            {/* URL Slug */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="drawer-slug">URL Slug *</Label>
                {!autoSlug && (
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
                )}
              </div>
              <Input
                id="drawer-slug"
                value={form.slug}
                onChange={(e) => {
                  setAutoSlug(false)
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }}
                placeholder="classic-cotton-tee"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                /products/{form.slug || "..."}
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="drawer-desc">Description</Label>
              <Textarea
                id="drawer-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="drawer-price">Base Price (USD) *</Label>
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
                      setForm((prev) => ({
                        ...prev,
                        base_price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
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
                      setForm((prev) => ({
                        ...prev,
                        compare_at_price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, status: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose &quot;Draft&quot; to finish editing before publishing.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 border-t pt-4 sm:flex-col">
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="w-full"
          >
            {saving && (
              <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
            )}
            Create & Continue Editing
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="w-full"
          >
            Create Product
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
