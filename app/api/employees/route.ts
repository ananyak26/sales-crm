// app/api/employees/route.ts
// POST-only. Lets a logged-in boss create a username/password account for
// a new employee, without needing a real email address.

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const EMAIL_DOMAIN = 'crm.internal' // fake domain, just satisfies Supabase Auth's email field

export async function POST(request: Request) {
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
      { error: 'Only the boss can add employees' },
      { status: 403 }
    )
  }

  const { username, fullName, password } = await request.json()

  if (!username || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Username and an 8+ character password are required' },
      { status: 400 }
    )
  }

  const cleanUsername = String(username).trim().toLowerCase().replace(/\s+/g, '')
  const email = `${cleanUsername}@${EMAIL_DOMAIN}`

  const admin = createAdminClient() // no args needed — reads env vars internally

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip verification — the address isn't real
    user_metadata: { username: cleanUsername, full_name: fullName ?? '' },
  })

  if (error) {
    const message = error.message.includes('already been registered')
      ? 'That username is already taken'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Belt-and-suspenders: set username/full_name/role directly in case the
  // handle_new_user trigger hasn't been updated to read them from metadata yet.
  await admin
    .from('profiles')
    .update({ username: cleanUsername, full_name: fullName ?? '', role: 'sales' })
    .eq('id', created.user!.id)

  return NextResponse.json({ ok: true, id: created.user!.id, username: cleanUsername })
}
