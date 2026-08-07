// Boss-only Reports page: all-time charts + downloadable monthly per-employee reports.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/getUserRole";
import ReportsCharts from "@/components/ReportsCharts";
import DealsTable from "@/components/DealsTable";
import MonthlyReports from "@/components/MonthlyReports";

type DealRow = {
  id: string;
  name: string;
  amount: number;
  stage: string;
  created_at: string;
  account: { name: string } | null;
  owner: { id: string; full_name: string | null; email: string } | null;
};

type QuoteRow = {
  id: string;
  quote_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  owner: { id: string; full_name: string | null; email: string } | null;
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const { role } = await getUserRole();
  if (role !== "boss") redirect("/deals");

  const supabase = createClient();

  const [{ data: deals, error: dealsError }, { data: quotes, error: quotesError }, { data: reps }] =
    await Promise.all([
      supabase
        .from("deals")
        .select(
          `
          id, name, amount, stage, created_at,
          account:accounts ( name ),
          owner:profiles!deals_created_by_fkey ( id, full_name, email )
        `
        )
        .order("created_at", { ascending: false })
        .returns<DealRow[]>(),
      supabase
        .from("quotes")
        .select(
          `
          id, quote_number, status, grand_total, created_at,
          owner:profiles!quotes_created_by_fkey ( id, full_name, email )
        `
        )
        .order("created_at", { ascending: false })
        .returns<QuoteRow[]>(),
      supabase.from("profiles").select("id, full_name, email, role").order("full_name"),
    ]);

  if (dealsError || quotesError) {
    return (
      <div className="text-sm text-rose-600">
        Couldn&apos;t load reports: {dealsError?.message || quotesError?.message}
      </div>
    );
  }

  const dealRows = deals ?? [];
  const quoteRows = quotes ?? [];
  const allReps = (reps ?? []).filter((r: any) => r.role !== "boss");

  // ---------- existing all-time charts (unchanged) ----------
  const byRep = new Map<string, { name: string; won: number; lost: number; active: number; wonValue: number }>();
  for (const d of dealRows) {
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

  const byStage = new Map<string, number>();
  for (const d of dealRows) byStage.set(d.stage, (byStage.get(d.stage) ?? 0) + 1);
  const stageStats = Array.from(byStage.entries()).map(([stage, count]) => ({ stage, count }));

  const totalWonValue = dealRows.filter((d) => d.stage === "Won").reduce((s, d) => s + (d.amount ?? 0), 0);
  const totalWonCount = dealRows.filter((d) => d.stage === "Won").length;
  const totalActive = dealRows.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length;
  const topRep = repStats[0];
  const activeDeals = dealRows.filter((d) => d.stage !== "Won" && d.stage !== "Lost");

  // ---------- NEW: monthly per-employee reports ----------
  const monthKey = (iso: string) => iso.slice(0, 7); // "2026-08"
  const monthsSet = new Set<string>();
  dealRows.forEach((d) => monthsSet.add(monthKey(d.created_at)));
  quoteRows.forEach((q) => monthsSet.add(monthKey(q.created_at)));
  const currentMonth = new Date().toISOString().slice(0, 7);
  monthsSet.add(currentMonth);
  const months = Array.from(monthsSet).sort().reverse(); // newest first

  const selectedMonth =
    searchParams.month && months.includes(searchParams.month) ? searchParams.month : currentMonth;

  const monthlyDeals = dealRows.filter((d) => monthKey(d.created_at) === selectedMonth);
  const monthlyQuotes = quoteRows.filter((q) => monthKey(q.created_at) === selectedMonth);

  type RepMonthly = {
    id: string;
    name: string;
    email: string;
    dealsCreated: number;
    dealsWon: number;
    dealsLost: number;
    revenueWon: number;
    quotesCreated: number;
    quotesSent: number;
    quotesAccepted: number;
    quotesRejected: number;
  };

  const monthlyByRep = new Map<string, RepMonthly>();
  const ensureRep = (id: string, name: string, email: string) => {
    if (!monthlyByRep.has(id)) {
      monthlyByRep.set(id, {
        id,
        name,
        email,
        dealsCreated: 0,
        dealsWon: 0,
        dealsLost: 0,
        revenueWon: 0,
        quotesCreated: 0,
        quotesSent: 0,
        quotesAccepted: 0,
        quotesRejected: 0,
      });
    }
    return monthlyByRep.get(id)!;
  };

  // seed every rep so people with zero activity this month still show up
  for (const r of allReps) ensureRep(r.id, r.full_name || r.email, r.email);

  for (const d of monthlyDeals) {
    if (!d.owner) continue;
    const rep = ensureRep(d.owner.id, d.owner.full_name || d.owner.email, d.owner.email);
    rep.dealsCreated += 1;
    if (d.stage === "Won") {
      rep.dealsWon += 1;
      rep.revenueWon += d.amount ?? 0;
    } else if (d.stage === "Lost") {
      rep.dealsLost += 1;
    }
  }
  for (const q of monthlyQuotes) {
    if (!q.owner) continue;
    const rep = ensureRep(q.owner.id, q.owner.full_name || q.owner.email, q.owner.email);
    rep.quotesCreated += 1;
    if (q.status === "Sent") rep.quotesSent += 1;
    else if (q.status === "Accepted") rep.quotesAccepted += 1;
    else if (q.status === "Rejected") rep.quotesRejected += 1;
  }

  const monthlyRepStats = Array.from(monthlyByRep.values()).sort((a, b) => b.revenueWon - a.revenueWon);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">How the team is performing, deal by deal.</p>
      </div>

      <ReportsCharts
        repStats={repStats}
        stageStats={stageStats}
        summary={{ totalWonValue, totalWonCount, totalActive, topRepName: topRep?.name ?? "—" }}
      />

      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-3">
          Active deals across the team ({activeDeals.length})
        </h2>
        <DealsTable deals={activeDeals as any} showOwner />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-3">Monthly employee reports</h2>
        <MonthlyReports months={months} selectedMonth={selectedMonth} repStats={monthlyRepStats} />
      </div>
    </div>
  );
}
