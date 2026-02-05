// =============================================================================
// lib/supabase-admin.ts — Server-side Supabase client (service role)
// =============================================================================
// Used in API routes where we verify Clerk auth ourselves,
// then use service role to bypass RLS for writes.
// RLS still acts as a safety net for reads.

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})