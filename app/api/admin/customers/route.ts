// =============================================================================
// File: src/app/api/admin/customers/route.ts
// Description: Customers collection API.
//   GET  — List customers with search, pagination, active filter
//   POST — Create a new customer (admin-created, no Clerk account required)
//   DELETE — Bulk delete customers (only if no orders)
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/customers
export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")
  const sort = searchParams.get("sort") ?? "created_at"
  const order = searchParams.get("order") ?? "desc"

  let query = supabaseAdmin
    .from("customers")
    .select(
      `
      *,
      customer_addresses (*)
    `,
      { count: "exact" }
    )

  if (status === "active") query = query.eq("is_active", true)
  if (status === "inactive") query = query.eq("is_active", false)

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  const ascending = order === "asc"
  query = query.order(sort, { ascending }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Failed to fetch customers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    customers: data,
    total: count,
    page,
    limit,
  })
}

// POST /api/admin/customers
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const body = await request.json()
    const { first_name, last_name, email, phone, company, admin_notes, tags, social_media } =
      body

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
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this email already exists" },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        admin_notes: admin_notes?.trim() || null,
        tags: tags || [],
        social_media: social_media || null,
        created_by: admin.userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create customer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ customer: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// DELETE /api/admin/customers (bulk delete)
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      )
    }

    const { data: orderedCustomers } = await supabaseAdmin
      .from("orders")
      .select("customer_id")
      .in("customer_id", ids)

    if (orderedCustomers && orderedCustomers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete customers with existing orders. Deactivate them instead.",
        },
        { status: 409 }
      )
    }

    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .in("id", ids)

    if (error) {
      console.error("Failed to delete customers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted: ids.length })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
