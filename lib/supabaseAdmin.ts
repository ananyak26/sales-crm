// lib/supabaseAdmin.ts
// SERVER-ONLY. Never import this into a 'use client' file or expose the
// service role key to the browser — it bypasses RLS entirely.
// Requires SUPABASE_SERVICE_ROLE_KEY in your env vars (Vercel + .env.local).
// Find it in Supabase dashboard → Project Settings → API → service_role key.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
