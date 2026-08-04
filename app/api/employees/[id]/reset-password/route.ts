// app/api/employees/[id]/reset-password/route.ts
// POST-only. Lets the boss reset a specific employee's password.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'boss') {
    return NextResponse.json(
      { error: 'Only the boss can reset passwords' },
      { status: 403 }
    )
  }

  const { password } = await request.json()

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(params.id, { password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
