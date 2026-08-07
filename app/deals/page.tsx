"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import { useUserRole } from "@/lib/useUserRole";
import type { Deal, Account } from "@/lib/types";

const emptyForm = { name: "", account_id: "", stage: "Prospecting", amount: 0, close_date: "" };
const stageColors: Record<string, string> = {
  Prospecting: "bg-blue-100 text-blue-700",
  Proposal: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-gray-200 text-gray-600",
};

export default function DealsPage() {
  const supabase = createClient();
  const { isBoss } = useUserRole();
  const [deals, setDeals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const { data } = await supabase
      .from("deals")
      .select("*, accounts(name), owner:profiles!deals_created_by_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setDeals(data || []);
    const { data: accs } = await supabase.from("accounts").select("*").order("name");
    setAccounts(accs || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (d: Deal) => {
    setForm({ ...d, close_date: d.close_date || "" });
    setEditingId(d.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return;
    const payload = {
      name: form.name,
      account_id: form.account_id || null,
      stage: form.stage,
      amount: Number(form.amount),
      close_date: form.close_date || null,
    };
    if (editingId) {
      await supabase.from("deals").update(payload).eq("id", editingId);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("deals").insert({ ...payload, created_by: user?.id });
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    await supabase.from("deals").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deals</h1>
        <button className="btn-primary" onClick={openNew}>
          + New Deal
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? "Edit Deal" : "New Deal"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="label">Deal Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Customer</label>
              <select className="input" value={form.account_id || ""} onChange={(e) => setForm({ ...form, account_id: e.target.value })}>
                <option value="">—</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Stage</label>
              <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {Object.keys(stageColors).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="label">Expected Close Date</label>
              <input type="date" className="input" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary" onClick={save}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Customer</th>
              {isBoss && <th>Owner</th>}
              <th>Stage</th>
              <th>Amount</th>
              <th>Close Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="cursor-pointer" onClick={() => openEdit(d)}>
                <td className="font-medium">{d.name}</td>
                <td>{d.accounts?.name || "—"}</td>
                {isBoss && <td>{d.owner?.full_name || d.owner?.email || "—"}</td>}
                <td>
                  <span className={`badge ${stageColors[d.stage]}`}>{d.stage}</span>
                </td>
                <td>₹{Number(d.amount).toLocaleString("en-IN")}</td>
                <td>{d.close_date ? new Date(d.close_date).toLocaleDateString() : "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button className="text-brand-600 text-sm" onClick={(e) => { e.stopPropagation(); openEdit(d); }}>
                    Edit
                  </button>
                  <button className="text-red-600 text-sm" onClick={(e) => { e.stopPropagation(); remove(d.id); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan={isBoss ? 7 : 6} className="text-center text-gray-400 py-6">
                  No deals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
