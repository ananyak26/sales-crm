// app/reports/page.tsx
// Boss-only Reports page: summary cards + charts of which rep closed what.
// Adjust column names in the .select() below to match your real schema
// (supabase/schema.sql) if they differ.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/getUserRole'
import ReportsCharts from '@/components/ReportsCharts'

type DealRow = {
  id: string
  title: string
  amount: number
  stage: string
  created_at: string
  owner: { id: string; full_name: string | null; email: string } | null
}

export default async function ReportsPage() {
  const { role } = await getUserRole()

  if (role !== 'boss') {
    redirect('/deals')
  }

  const supabase = createClient()

  const { data: deals, error } = await supabase
    .from('deals')
    .select(
      `
      id,
      title,
      amount,
      stage,
      created_at,
      owner:profiles!deals_created_by_fkey ( id, full_name, email )
    `
    )
    .returns<DealRow[]>()

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">
        Couldn&apos;t load reports: {error.message}
      </div>
    )
  }

  const rows = deals ?? []

  // --- Aggregate per rep ---
  const byRep = new Map<
    string,
    { name: string; won: number; lost: number; active: number; wonValue: number }
  >()

  for (const d of rows) {
    const key = d.owner?.id ?? 'unknown'
    const name = d.owner?.full_name || d.owner?.email || 'Unassigned'
    if (!byRep.has(key)) {
      byRep.set(key, { name, won: 0, lost: 0, active: 0, wonValue: 0 })
    }
    const rep = byRep.get(key)!
    if (d.stage === 'won') {
      rep.won += 1
      rep.wonValue += d.amount ?? 0
    } else if (d.stage === 'lost') {
      rep.lost += 1
    } else {
      rep.active += 1
    }
  }

  const repStats = Array.from(byRep.values()).sort(
    (a, b) => b.wonValue - a.wonValue
  )

  // --- Aggregate by stage (for the pie chart) ---
  const byStage = new Map<string, number>()
  for (const d of rows) {
    byStage.set(d.stage, (byStage.get(d.stage) ?? 0) + 1)
  }
  const stageStats = Array.from(byStage.entries()).map(([stage, count]) => ({
    stage,
    count,
  }))

  // --- Headline numbers ---
  const totalWonValue = rows
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const totalWonCount = rows.filter((d) => d.stage === 'won').length
  const totalActive = rows.filter(
    (d) => d.stage !== 'won' && d.stage !== 'lost'
  ).length
  const topRep = repStats[0]

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">
          How the team is performing, deal by deal.
        </p>
      </div>

      <ReportsCharts
        repStats={repStats}
        stageStats={stageStats}
        summary={{
          totalWonValue,
          totalWonCount,
          totalActive,
          topRepName: topRep?.name ?? '—',
        }}
      />
    </div>
  )
}
