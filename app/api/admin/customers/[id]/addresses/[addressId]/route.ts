// =============================================================================
// File: src/app/api/admin/customers/[id]/addresses/[addressId]/route.ts
// Description: Individual customer address API.
//   PUT    — Update an address
//   DELETE — Delete an address
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

// PUT /api/admin/customers/[id]/addresses/[addressId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id, addressId } = await params

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
      .update({
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
      .eq("id", addressId)
      .eq("customer_id", id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update address:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ address: data })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// DELETE /api/admin/customers/[id]/addresses/[addressId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.authorized) return admin.response

  const { id, addressId } = await params

  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", id)

  if (error) {
    console.error("Failed to delete address:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
