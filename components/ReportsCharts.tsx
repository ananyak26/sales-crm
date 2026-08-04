'use client'
// components/ReportsCharts.tsx
// Pure presentation — takes already-aggregated data from app/reports/page.tsx
// and renders summary cards + charts. Needs `recharts` installed:
//   npm install recharts

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

type RepStat = {
  name: string
  won: number
  lost: number
  active: number
  wonValue: number
}

type StageStat = { stage: string; count: number }

const STAGE_COLORS: Record<string, string> = {
  won: '#059669',
  lost: '#dc2626',
  default: '#6366f1',
}
const PALETTE = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed']

const currency = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function ReportsCharts({
  repStats,
  stageStats,
  summary,
}: {
  repStats: RepStat[]
  stageStats: StageStat[]
  summary: {
    totalWonValue: number
    totalWonCount: number
    totalActive: number
    topRepName: string
  }
}) {
  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Revenue won" value={currency(summary.totalWonValue)} />
        <SummaryCard label="Deals won" value={String(summary.totalWonCount)} />
        <SummaryCard label="Active deals" value={String(summary.totalActive)} />
        <SummaryCard label="Top rep" value={summary.topRepName} />
      </div>

      {/* Deals won per rep */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Deals closed by rep
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={repStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="won" name="Won" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="active" name="Active" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Lost" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue per rep */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Revenue won by rep
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={repStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip formatter={(v: number) => currency(v)} />
            <Bar dataKey="wonValue" name="Revenue" radius={[4, 4, 0, 0]}>
              {repStats.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deals by stage */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          All deals by stage
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stageStats}
              dataKey="count"
              nameKey="stage"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ stage, count }) => `${stage}: ${count}`}
            >
              {stageStats.map((s, i) => (
                <Cell
                  key={s.stage}
                  fill={STAGE_COLORS[s.stage] ?? PALETTE[i % PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Rep leaderboard table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                Rep
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Won
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Active
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Lost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Revenue won
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {repStats.map((rep) => (
              <tr key={rep.name} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {rep.name}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">
                  {rep.won}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">
                  {rep.active}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">
                  {rep.lost}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-900">
                  {currency(rep.wonValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
