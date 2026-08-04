// components/DealsTable.tsx
// Drop this in components/, then use it from both app/deals/page.tsx (rep view)
// and app/deals/page.tsx boss branch (or a dedicated app/boss/deals/page.tsx).
//
// Adjust the field names in the Deal type / table cells below to match your
// actual "deals" columns from supabase/schema.sql (title, amount, stage, etc).

type Deal = {
  id: string
  title: string
  amount: number
  stage: string
  created_at: string
  account?: { name: string } | null
  owner?: { full_name: string; email: string } | null // only present for boss view
}

export default function DealsTable({
  deals,
  showOwner = false,
}: {
  deals: Deal[]
  showOwner?: boolean
}) {
  const currency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n)

  const stageStyles: Record<string, string> = {
    won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    lost: 'bg-red-50 text-red-700 ring-red-600/20',
    default: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Deal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Account
            </th>
            {showOwner && (
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Owner
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Stage
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {deal.title}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {deal.account?.name ?? '—'}
              </td>
              {showOwner && (
                <td className="px-4 py-3 text-sm text-slate-600">
                  {deal.owner?.full_name ?? deal.owner?.email ?? '—'}
                </td>
              )}
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    stageStyles[deal.stage] ?? stageStyles.default
                  }`}
                >
                  {deal.stage}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-900">
                {currency(deal.amount)}
              </td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td
                colSpan={showOwner ? 5 : 4}
                className="px-4 py-8 text-center text-sm text-slate-400"
              >
                No active deals yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
