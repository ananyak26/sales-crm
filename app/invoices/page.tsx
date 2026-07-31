"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-200 text-gray-600",
  Sent: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function InvoicesPage() {
  const supabase = createClient();
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
      <h1 className="text-2xl font-bold">Invoices</h1>
      <p className="text-sm text-gray-500">
        Invoices are created by converting an accepted quote. Go to a quote and click "Convert to Invoice".
      </p>

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Account</th>
              <th>Status</th>
              <th>Total</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.invoice_number}</td>
                <td>{inv.accounts?.name || "—"}</td>
                <td>
                  <select
                    className={`badge ${statusColors[inv.status]} border-0`}
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                  >
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </td>
                <td>₹{Number(inv.grand_total).toLocaleString("en-IN")}</td>
                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
