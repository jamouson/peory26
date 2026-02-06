// =============================================================================
// File: src/components/admin/image-upload.tsx
// Description: Product image uploader with:
//   - Drag-and-drop file upload zone
//   - Click-to-browse file picker
//   - URL paste fallback input
//   - Drag-to-reorder (first image = primary)
//   - Delete with Supabase Storage cleanup
//   Uploads via /api/admin/upload. Max 8 images, 5MB each.
// =============================================================================

"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import {
  IconPhoto,
  IconTrash,
  IconGripVertical,
  IconLoader2,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error("Upload error:", err)
      return null
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = maxImages - images.length
      const toUpload = fileArray.slice(0, remaining)
      if (toUpload.length === 0) return

      setUploading(true)
      const urls = await Promise.all(toUpload.map(uploadFile))
      const valid = urls.filter(Boolean) as string[]
      if (valid.length > 0) onChange([...images, ...valid])
      setUploading(false)
    },
    [images, maxImages, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const removeImage = async (index: number) => {
    const url = images[index]
    onChange(images.filter((_, i) => i !== index))

    // Delete from storage in background (non-blocking)
    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
    } catch {
      // Non-critical — image already removed from product
    }
  }

  const handleDragStart = (index: number) => setDragIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const reordered = [...images]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    onChange(reordered)
    setDragIndex(index)
  }

  const handleDragEnd = () => setDragIndex(null)

  return (
    <div className="space-y-3">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                dragIndex === index && "opacity-50",
                index === 0 && "ring-2 ring-primary"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />

              {/* Hover overlay controls */}
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1.5 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <button type="button" className="cursor-grab rounded bg-white/90 p-1 text-zinc-700 hover:bg-white active:cursor-grabbing">
                  <IconGripVertical className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => removeImage(index)} className="rounded bg-red-500/90 p-1 text-white hover:bg-red-600">
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <IconPhoto className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop images here, or{" "}
                <label className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
                  browse
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = "" }}
                  />
                </label>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                JPEG, PNG, WebP, or AVIF up to 5MB. {images.length}/{maxImages} images.
              </p>
            </>
          )}
        </div>
      )}

      {/* URL input fallback */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Or paste an image URL..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              const input = e.currentTarget
              const url = input.value.trim()
              if (url && images.length < maxImages) { onChange([...images, url]); input.value = "" }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement
            const url = input?.value?.trim()
            if (url && images.length < maxImages) { onChange([...images, url]); input.value = "" }
          }}
        >
          Add URL
        </Button>
      </div>
    </div>
  )
}
