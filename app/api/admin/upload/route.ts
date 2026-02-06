// =============================================================================
// File: src/app/api/admin/upload/route.ts
// Description: Image upload API using Supabase Storage.
//   POST   — Upload image (JPEG, PNG, WebP, AVIF — max 5MB)
//   DELETE — Delete image by public URL
//   Auto-creates "product-images" bucket if it doesn't exist.
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"

const BUCKET = "product-images"
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

// POST /api/admin/upload
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === BUCKET)

    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ALLOWED_TYPES,
        fileSizeLimit: MAX_SIZE,
      })
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const fileName = `${randomUUID()}.${ext}`
    const filePath = `products/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error("Upload failed:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// DELETE /api/admin/upload
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Extract storage path from the public URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(
      /\/storage\/v1\/object\/public\/product-images\/(.+)/
    )

    if (!pathMatch) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([pathMatch[1]])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
