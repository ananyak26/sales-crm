// Boss-only Reports page: per-rep performance, deal-stage breakdown, and
// the full list of active deals across the team.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/getUserRole";
import ReportsCharts from "@/components/ReportsCharts";
import DealsTable from "@/components/DealsTable";

type DealRow = {
  id: string;
  name: string;
  amount: number;
  stage: string;
  created_at: string;
  account: { name: string } | null;
  owner: { id: string; full_name: string | null; email: string } | null;
};

export default async function ReportsPage() {
  const { role } = await getUserRole();
  if (role !== "boss") redirect("/deals");

  const supabase = createClient();

  const { data: deals, error } = await supabase
    .from("deals")
    .select(
      `
      id,
      name,
      amount,
      stage,
      created_at,
      account:accounts ( name ),
      owner:profiles!deals_created_by_fkey ( id, full_name, email )
    `
    )
    .order("created_at", { ascending: false })
    .returns<DealRow[]>();

  if (error) {
    return <div className="text-sm text-rose-600">Couldn&apos;t load reports: {error.message}</div>;
  }

  const rows = deals ?? [];

  // --- Aggregate per rep ---
  const byRep = new Map<string, { name: string; won: number; lost: number; active: number; wonValue: number }>();
  for (const d of rows) {
    const key = d.owner?.id ?? "unknown";
    const name = d.owner?.full_name || d.owner?.email || "Unassigned";
    if (!byRep.has(key)) byRep.set(key, { name, won: 0, lost: 0, active: 0, wonValue: 0 });
    const rep = byRep.get(key)!;
    if (d.stage === "Won") {
      rep.won += 1;
      rep.wonValue += d.amount ?? 0;
    } else if (d.stage === "Lost") {
      rep.lost += 1;
    } else {
      rep.active += 1;
    }
  }
  const repStats = Array.from(byRep.values()).sort((a, b) => b.wonValue - a.wonValue);

  // --- Aggregate by stage (for the pie chart) ---
  const byStage = new Map<string, number>();
  for (const d of rows) byStage.set(d.stage, (byStage.get(d.stage) ?? 0) + 1);
  const stageStats = Array.from(byStage.entries()).map(([stage, count]) => ({ stage, count }));

  // --- Headline numbers ---
  const totalWonValue = rows.filter((d) => d.stage === "Won").reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const totalWonCount = rows.filter((d) => d.stage === "Won").length;
  const totalActive = rows.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length;
  const topRep = repStats[0];

  const activeDeals = rows.filter((d) => d.stage !== "Won" && d.stage !== "Lost");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">How the team is performing, deal by deal.</p>
      </div>

      <ReportsCharts
        repStats={repStats}
        stageStats={stageStats}
        summary={{
          totalWonValue,
          totalWonCount,
          totalActive,
          topRepName: topRep?.name ?? "—",
        }}
      />

      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-3">
          Active deals across the team ({activeDeals.length})
        </h2>
        <DealsTable deals={activeDeals as any} showOwner />
      </div>
    </div>
  );
}
