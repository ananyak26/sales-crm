import { createClient } from "@/lib/supabase/server";
import DashboardCharts from "@/components/DashboardCharts";

const OPEN_STAGES = ["Prospecting", "Proposal", "Negotiation"];
const STAGE_ORDER = ["Prospecting", "Proposal", "Negotiation", "Won", "Lost"];
const QUOTE_STATUS_ORDER = ["Draft", "Sent", "Accepted", "Rejected"];

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: deals }, { data: quotes }, { data: invoices }, { data: accounts }] = await Promise.all([
    supabase.from("deals").select("id, name, stage, amount, account_id"),
    supabase.from("quotes").select("id, status, grand_total, created_at"),
    supabase.from("invoices").select("id, status, grand_total, created_at"),
    supabase.from("accounts").select("id, name"),
  ]);

  const dealsList = deals || [];
  const quotesList = quotes || [];
  const invoicesList = invoices || [];
  const accountsList = accounts || [];

  const openDeals = dealsList.filter((d: any) => OPEN_STAGES.includes(d.stage));
  const pipelineValue = openDeals.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
  const revenueCollected = invoicesList
    .filter((i: any) => i.status === "Paid")
    .reduce((sum: number, i: any) => sum + Number(i.grand_total || 0), 0);
  const acceptedQuotes = quotesList.filter((q: any) => q.status === "Accepted").length;

  const dealsByStage = STAGE_ORDER.map((stage) => {
    const inStage = dealsList.filter((d: any) => d.stage === stage);
    return {
      stage,
      count: inStage.length,
      amount: inStage.reduce((s: number, d: any) => s + Number(d.amount || 0), 0),
    };
  });

  const quotesByStatus = QUOTE_STATUS_ORDER.map((status) => {
    const inStatus = quotesList.filter((q: any) => q.status === status);
    return {
      status,
      count: inStatus.length,
      value: inStatus.reduce((s: number, q: any) => s + Number(q.grand_total || 0), 0),
    };
  });

  // Revenue trend: paid invoices grouped by month, last 6 months (including current).
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-US", { month: "short" }) };
  });
  const revenueTrend = months.map((m) => {
    const total = invoicesList
      .filter((i: any) => i.status === "Paid")
      .filter((i: any) => {
        const d = new Date(i.created_at);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      })
      .reduce((s: number, i: any) => s + Number(i.grand_total || 0), 0);
    return { label: m.label, value: total };
  });

  // Top 5 accounts by open pipeline value.
  const accountNameById = new Map(accountsList.map((a: any) => [a.id, a.name]));
  const pipelineByAccount = new Map<string, number>();
  openDeals.forEach((d: any) => {
    if (!d.account_id) return;
    pipelineByAccount.set(d.account_id, (pipelineByAccount.get(d.account_id) || 0) + Number(d.amount || 0));
  });
  const topAccounts = Array.from(pipelineByAccount.entries())
    .map(([id, value]) => ({ name: accountNameById.get(id) || "Unknown", value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats = [
    { label: "Active Deals", value: dealsList.length, sub: `${openDeals.length} open` },
    { label: "Quotes Created", value: quotesList.length, sub: `${acceptedQuotes} accepted` },
    { label: "Pipeline Value", value: `₹${pipelineValue.toLocaleString("en-IN")}`, sub: "open deals" },
    { label: "Revenue Collected", value: `₹${revenueCollected.toLocaleString("en-IN")}`, sub: "paid invoices" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s how your pipeline is looking today.</p>
      </div>
      <DashboardCharts
        stats={stats}
        dealsByStage={dealsByStage}
        quotesByStatus={quotesByStatus}
        revenueTrend={revenueTrend}
        topAccounts={topAccounts}
      />
    </div>
  );
}
