"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusSelect from "@/components/StatusSelect";

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
  const [invoices, setInvoices] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, accounts(name)")
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
              <th>Status</th>
              <th>Total</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="cursor-pointer" onClick={() => router.push(`/invoices/${inv.id}`)}>
                <td className="font-medium">{inv.invoice_number}</td>
                <td>{inv.accounts?.name || "—"}</td>
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
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
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
