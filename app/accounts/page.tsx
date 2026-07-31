"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import type { Account } from "@/lib/types";

const emptyForm = {
  name: "",
  industry: "",
  phone: "",
  website: "",
  billing_address: "",
  shipping_address: "",
  gstin: "",
  state: "",
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh",
  "Puducherry",
];

export default function AccountsPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: false });
    if (error) console.error("Load accounts failed:", error);
    setAccounts(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (a: Account) => {
    setForm(a);
    setEditingId(a.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return;
    let error;
    if (editingId) {
      ({ error } = await supabase.from("accounts").update(form).eq("id", editingId));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase.from("accounts").insert({ ...form, created_by: user?.id }));
    }
    if (error) {
      console.error("Save account failed:", error);
      alert(`Could not save account: ${error.message}`);
      return;
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this account?")) return;
    await supabase.from("accounts").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <button className="btn-primary" onClick={openNew}>
          + New Account
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? "Edit Account" : "New Account"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" value={form.industry || ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input className="input" value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            </div>
            <div>
              <label className="label">State (for GST place of supply)</label>
              <select className="input" value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Billing Address</label>
            <textarea className="input" rows={2} value={form.billing_address || ""} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
          </div>
          <div>
            <label className="label">Shipping Address (leave blank if same as billing)</label>
            <textarea className="input" rows={2} value={form.shipping_address || ""} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
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
              <th>Name</th>
              <th>Industry</th>
              <th>GSTIN</th>
              <th>State</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="cursor-pointer" onClick={() => openEdit(a)}>
                <td className="font-medium">{a.name}</td>
                <td>{a.industry}</td>
                <td>{a.gstin}</td>
                <td>{a.state}</td>
                <td>{a.phone}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button className="text-brand-600 text-sm" onClick={(e) => { e.stopPropagation(); openEdit(a); }}>
                    Edit
                  </button>
                  <button className="text-red-600 text-sm" onClick={(e) => { e.stopPropagation(); remove(a.id); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-6">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}