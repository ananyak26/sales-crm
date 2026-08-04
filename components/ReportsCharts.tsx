"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type RepStat = { name: string; won: number; lost: number; active: number; wonValue: number };
type StageStat = { stage: string; count: number };

const STAGE_COLORS: Record<string, string> = {
  Won: "#10b981",
  Lost: "#f43f5e",
  Prospecting: "#9ca3af",
  Proposal: "#f59e0b",
  Negotiation: "#3b82f6",
};
const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#8b5cf6"];

const currency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
    </div>
  );
}

export default function ReportsCharts({
  repStats,
  stageStats,
  summary,
}: {
  repStats: RepStat[];
  stageStats: StageStat[];
  summary: { totalWonValue: number; totalWonCount: number; totalActive: number; topRepName: string };
}) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Revenue won" value={currency(summary.totalWonValue)} />
        <SummaryCard label="Deals won" value={String(summary.totalWonCount)} />
        <SummaryCard label="Active deals" value={String(summary.totalActive)} />
        <SummaryCard label="Top rep" value={summary.topRepName} />
      </div>

      {repStats.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">
          No deals yet — reports will populate once your team starts adding deals.
        </div>
      ) : (
        <>
          {/* Deals won per rep */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Deals closed by rep</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={repStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" name="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Lost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue per rep */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Revenue won by rep</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={repStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
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
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">All deals by stage</h2>
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
                    <Cell key={s.stage} fill={STAGE_COLORS[s.stage] ?? PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Rep leaderboard table */}
          <div className="card p-4 overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Rep</th>
                  <th>Won</th>
                  <th>Active</th>
                  <th>Lost</th>
                  <th>Revenue won</th>
                </tr>
              </thead>
              <tbody>
                {repStats.map((rep) => (
                  <tr key={rep.name}>
                    <td className="font-medium">{rep.name}</td>
                    <td>{rep.won}</td>
                    <td>{rep.active}</td>
                    <td>{rep.lost}</td>
                    <td className="font-semibold">{currency(rep.wonValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
