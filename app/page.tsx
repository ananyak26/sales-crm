import { createClient } from "@/lib/supabase/server";

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
    { label: "Open Leads", value: leadsCount ?? 0 },
    { label: "Active Deals", value: dealsCount ?? 0 },
    { label: "Quotes Created", value: quotesCount ?? 0 },
    { label: "Pipeline Value", value: `₹${pipelineValue.toLocaleString("en-IN")}` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-3">Recent Quotes</h2>
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
                <td>{q.quote_number}</td>
                <td>{q.status}</td>
                <td>₹{Number(q.grand_total).toLocaleString("en-IN")}</td>
                <td>{new Date(q.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!recentQuotes || recentQuotes.length === 0) && (
              <tr>
                <td colSpan={4} className="text-gray-400 text-center py-4">
                  No quotes yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
