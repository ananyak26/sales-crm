// app/api/employees/[id]/route.ts
// DELETE-only. Lets the boss remove an employee's account entirely.
// Their past accounts/deals/quotes/invoices are kept (visible to the boss)
// with the owner cleared — see migration_004_employee_delete.sql.

import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
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
      { error: 'Only the boss can remove employees' },
      { status: 403 }
    )
  }

  if (params.id === user.id) {
    return NextResponse.json(
      { error: "You can't remove your own account" },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Don't allow removing another boss account through this endpoint.
  const { data: target } = await admin
    .from('profiles')
    .select('role')
    .eq('id', params.id)
    .single()

  if (target?.role === 'boss') {
    return NextResponse.json(
      { error: 'Cannot remove a boss account from here' },
      { status: 400 }
    )
  }

  const { error } = await admin.auth.admin.deleteUser(params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
