// app/boss/deals/page.tsx
// Boss-only "all deals" view. Reuses DealsTable with showOwner=true.
// If you'd rather keep one URL (/deals) for both roles, move this logic
// into your existing app/deals/page.tsx behind an `if (role === 'boss')`
// branch instead of a separate route — see the note at the bottom of this file.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/getUserRole'
import DealsTable from '@/components/DealsTable'

export default async function BossDealsPage() {
  const { role } = await getUserRole()

  if (role !== 'boss') {
    redirect('/deals')
  }

  const supabase = createClient()

  // Adjust the select() below to match your real deals/accounts/profiles columns.
  const { data: deals, error } = await supabase
    .from('deals')
    .select(
      `
      id,
      title,
      amount,
      stage,
      created_at,
      account:accounts ( name ),
      owner:profiles!deals_created_by_fkey ( full_name, email )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Couldn&apos;t load deals: {error.message}
      </div>
    )
  }

  const active = (deals ?? []).filter(
    (d) => d.stage !== 'won' && d.stage !== 'lost'
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Active deals — all reps
        </h1>
        <p className="text-sm text-slate-500">
          {active.length} active deal{active.length === 1 ? '' : 's'} across
          your team right now.
        </p>
      </div>
      <DealsTable deals={active as any} showOwner />
    </div>
  )
}
