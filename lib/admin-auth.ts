// =============================================================================
// File: src/lib/admin-auth.ts
// Description: Admin authentication helper for API routes.
//              Verifies Clerk session and checks if user is in ADMIN_USER_IDS.
// =============================================================================

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(",") ?? []

export async function requireAdmin() {
  const { userId } = await auth()

  if (!userId) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const isAdmin = ADMIN_USER_IDS.includes(userId)

  if (!isAdmin) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { authorized: true as const, userId }
}
