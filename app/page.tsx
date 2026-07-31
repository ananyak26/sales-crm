import { createClient } from "@/lib/supabase/server";
import { Users, Handshake, FileText, Wallet, ArrowUpRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ count: leadsCount }, { count: dealsCount }, { count: quotesCount }, { data: openDeals }] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("deals").select("*", { count: "exact", head: true }),
      supabase.from("quotes").select("*", { count: "exact", head: true }),
      supabase.from("deals").select("amount").not("stage", "in", '("Won","Lost")'),
    ]);

  const pipelineValue = (openDeals || []).reduce((sum, d: any) => sum + Number(d.amount || 0), 0);

  const { data: recentQuotes } = await supabase
    .from("quotes")
    .select("id, quote_number, status, grand_total, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Open Leads", value: leadsCount ?? 0, icon: Users, tint: "bg-brand-50 text-brand-600" },
    { label: "Active Deals", value: dealsCount ?? 0, icon: Handshake, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Quotes Created", value: quotesCount ?? 0, icon: FileText, tint: "bg-amber-50 text-amber-600" },
    {
      label: "Pipeline Value",
      value: `₹${pipelineValue.toLocaleString("en-IN")}`,
      icon: Wallet,
      tint: "bg-rose-50 text-rose-600",
    },
  ];

  const statusStyle: Record<string, string> = {
    Accepted: "badge-success",
    Sent: "badge-brand",
    Draft: "badge-neutral",
    Rejected: "badge-danger",
    Expired: "badge-warning",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm text-gray-500">Welcome back</h2>
        <p className="text-[13px] text-gray-400">Here's what's happening across your pipeline today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-hover p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold mt-3.5 text-ink-900 tracking-tight">{s.value}</p>
              <p className="text-[13px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-ink-900 text-[15px]">Recent Quotes</h2>
          <a href="/quotes" className="text-[13px] font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            View all <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Quote #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentQuotes || []).map((q: any) => (
                <tr key={q.id}>
                  <td className="font-medium text-ink-900">{q.quote_number}</td>
                  <td>
                    <span className={statusStyle[q.status] || "badge-neutral"}>{q.status}</span>
                  </td>
                  <td>₹{Number(q.grand_total).toLocaleString("en-IN")}</td>
                  <td className="text-gray-500">{new Date(q.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!recentQuotes || recentQuotes.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-gray-400 text-center py-10">
                    No quotes yet — create your first one to see it here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
