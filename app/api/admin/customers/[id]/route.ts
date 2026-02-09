// =============================================================================
// File: src/app/api/admin/customers/[id]/route.ts
// Description: Individual customer API.
//   GET    — Fetch single customer with addresses
//   PUT    — Update customer fields
//   DELETE — Delete a single customer (if no orders)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/customers/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select(
      `
      *,
      customer_addresses (*),
      orders (id, status, total, created_at)
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ customer: data })
}

// PUT /api/admin/customers/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  try {
    const body = await request.json()
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      admin_notes,
      tags,
      social_media,
      is_active,
    } = body

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .neq("id", id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this email already exists" },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        admin_notes: admin_notes?.trim() || null,
        tags: tags || [],
        social_media: social_media || null,
        is_active: is_active ?? true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update customer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ customer: data })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// DELETE /api/admin/customers/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("customer_id", id)
    .limit(1)

  if (orders && orders.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete a customer with existing orders. Deactivate them instead.",
      },
      { status: 409 }
    )
  }

  const { error } = await supabaseAdmin
    .from("customers")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Failed to delete customer:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
