"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusSelect from "@/components/StatusSelect";
import { useUserRole } from "@/lib/useUserRole";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusOptions = ["Draft", "Sent", "Accepted", "Rejected"];

export default function QuotesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isBoss } = useUserRole();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*, accounts(name), owner:profiles!quotes_created_by_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    if (error) console.error("Load quotes failed:", error);
    setQuotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("quotes").update({ status }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    await supabase.from("quote_items").delete().eq("quote_id", id);
    await supabase.from("quotes").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <button className="btn-primary" onClick={() => router.push("/quotes/new")}>
          + New Quote
        </button>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Account</th>
              {isBoss && <th>Owner</th>}
              <th>Subject</th>
              <th>Status</th>
              <th>Total</th>
              <th>Valid Until</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="cursor-pointer" onClick={() => router.push(`/quotes/${q.id}`)}>
                <td className="font-medium">{q.quote_number}</td>
                <td>{q.accounts?.name || "—"}</td>
                {isBoss && <td>{q.owner?.full_name || q.owner?.email || "—"}</td>}
                <td>{q.subject || "—"}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <StatusSelect
                    value={q.status}
                    onChange={(status) => updateStatus(q.id, status)}
                    options={statusOptions}
                    colorMap={statusColors}
                  />
                </td>
                <td>₹{Number(q.grand_total).toLocaleString("en-IN")}</td>
                <td>{q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "—"}</td>
                <td>{new Date(q.created_at).toLocaleDateString()}</td>
                <td className="space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="text-brand-600 text-sm"
                    onClick={() => router.push(`/quotes/${q.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button className="text-red-600 text-sm" onClick={() => remove(q.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && quotes.length === 0 && (
              <tr>
                <td colSpan={isBoss ? 9 : 8} className="text-center text-gray-400 py-6">
                  No quotes yet — click "New Quote" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
