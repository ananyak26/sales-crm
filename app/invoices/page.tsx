"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusSelect from "@/components/StatusSelect";
import { useUserRole } from "@/lib/useUserRole";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Overdue: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusOptions = ["Draft", "Sent", "Paid", "Overdue"];

export default function InvoicesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { isBoss } = useUserRole();
  const [invoices, setInvoices] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, accounts(name), owner:profiles!invoices_created_by_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setInvoices(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("invoices").update({ status }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this Sales Order? This cannot be undone.")) return;
    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales Orders</h1>
      <p className="text-sm text-gray-500">
        Sales Orders are created by converting an accepted quote. Go to a quote and click "Convert to Sales Order".
      </p>

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Sales Order #</th>
              <th>Account</th>
              {isBoss && <th>Owner</th>}
              <th>Status</th>
              <th>Total</th>
              <th>Due Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="cursor-pointer" onClick={() => router.push(`/invoices/${inv.id}`)}>
                <td className="font-medium">{inv.invoice_number}</td>
                <td>{inv.accounts?.name || "—"}</td>
                {isBoss && <td>{inv.owner?.full_name || inv.owner?.email || "—"}</td>}
                <td onClick={(e) => e.stopPropagation()}>
                  <StatusSelect
                    value={inv.status}
                    onChange={(status) => updateStatus(inv.id, status)}
                    options={statusOptions}
                    colorMap={statusColors}
                  />
                </td>
                <td>₹{Number(inv.grand_total).toLocaleString("en-IN")}</td>
                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
                <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button className="text-red-600 text-sm" onClick={() => remove(inv.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={isBoss ? 7 : 6} className="text-center text-gray-400 py-6">
                  No Sales Orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
