// lib/getUserRole.ts
// Small helper to look up whether the current user is "sales" or "boss".
// Import your existing Supabase client factory here instead of re-creating one —
// adjust the import path below to match whatever you already use elsewhere
// in /app (e.g. `import { createClient } from '@/lib/supabase/server'`).

import { createClient } from '@/lib/supabase/server'

export type UserRole = 'sales' | 'boss'

export async function getUserRole(): Promise<{
  userId: string | null
  role: UserRole | null
}> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { userId: null, role: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    userId: user.id,
    role: (profile?.role as UserRole) ?? 'sales',
  }
}
