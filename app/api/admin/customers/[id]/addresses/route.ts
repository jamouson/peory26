// =============================================================================
// File: src/app/api/admin/customers/[id]/addresses/route.ts
// Description: Customer addresses collection API.
//   GET  — List addresses for a customer
//   POST — Add a new address
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/admin/customers/[id]/addresses
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ addresses: data })
}

// POST /api/admin/customers/[id]/addresses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id } = await params

  try {
    const body = await request.json()
    const {
      label,
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      state,
      zip,
      country,
      phone,
      is_default,
    } = body

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !address_line1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !zip?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "First name, last name, address, city, state, and ZIP are required",
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("customer_addresses")
      .insert({
        customer_id: id,
        label: label?.trim() || "Home",
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        address_line1: address_line1.trim(),
        address_line2: address_line2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country?.trim() || "US",
        phone: phone?.trim() || null,
        is_default: is_default ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create address:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ address: data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
