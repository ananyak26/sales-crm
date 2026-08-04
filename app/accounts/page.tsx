"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import { useUserRole } from "@/lib/useUserRole";
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
  primary_contact_name: "",
  gst_registration_type: "",
  payment_terms: "",
};

const GST_REGISTRATION_TYPES = [
  "Registered Business - Regular",
  "Registered Business - Composition",
  "Unregistered Business",
  "Consumer",
  "Overseas",
  "Special Economic Zone",
  "Deemed Export",
  "Tax Deductor",
  "SEZ Developer",
];

const PAYMENT_TERM_PRESETS = [
  "Due on receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Advance",
  "Payment After Delivery",
  "50% Advance, 50% Against the Delivery",
  "30% Advance, 60% Before Dispatch, 10% After Installation",
  "60% Advance with PO/PI, 40% Against PI & Balance After Commissioning",
  "30% Along with PO, 40% Against PI, 30% After Installation",
  "20% Advance + 65% Against PI + 15% After Installation",
];

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
  const { isBoss } = useUserRole();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("*, owner:profiles!accounts_created_by_fkey(full_name, email)")
      .order("created_at", { ascending: false });
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

  // Boss only: the same client can get added independently by more than one
  // rep (each rep only sees their own accounts, so they can't tell it's a
  // duplicate). Group by name here so the boss sees it once, with all the
  // reps who have their own copy of it listed under Owner. Editing/deleting
  // acts on the most recently created copy — the other rep's copy is
  // untouched, since it's still their own separate row underneath.
  const displayRows = isBoss
    ? Array.from(
        accounts
          .reduce((groups, a) => {
            const key = (a.name || "").trim().toLowerCase();
            const existing = groups.get(key);
            if (!existing) {
              groups.set(key, { ...a, owners: a.owner ? [a.owner] : [], duplicateCount: 1 });
            } else {
              existing.duplicateCount += 1;
              if (a.owner) existing.owners.push(a.owner);
            }
            return groups;
          }, new Map<string, any>())
          .values()
      )
    : accounts.map((a) => ({ ...a, owners: a.owner ? [a.owner] : [], duplicateCount: 1 }));

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
            <div>
              <label className="label">Primary Contact</label>
              <input
                className="input"
                placeholder="Name of person you deal with"
                value={form.primary_contact_name || ""}
                onChange={(e) => setForm({ ...form, primary_contact_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">GST Registration Type</label>
              <select
                className="input"
                value={form.gst_registration_type || ""}
                onChange={(e) => setForm({ ...form, gst_registration_type: e.target.value })}
              >
                <option value="">Select type</option>
                {GST_REGISTRATION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Payment Terms</label>
              <input
                className="input"
                list="payment-term-presets"
                placeholder="Pick a preset or type a custom term"
                value={form.payment_terms || ""}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
              />
              <datalist id="payment-term-presets">
                {PAYMENT_TERM_PRESETS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
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
              <th>Primary Contact</th>
              <th>Industry</th>
              {isBoss && <th>Owner</th>}
              <th>GSTIN</th>
              <th>Payment Terms</th>
              <th>State</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((a) => (
              <tr key={a.id} className="cursor-pointer" onClick={() => openEdit(a)}>
                <td className="font-medium">{a.name}</td>
                <td>{a.primary_contact_name || "—"}</td>
                <td>{a.industry}</td>
                {isBoss && (
                  <td>
                    {a.owners.map((o: any) => o.full_name || o.email).join(", ") || "—"}
                    {a.duplicateCount > 1 && (
                      <span className="ml-1 text-xs text-gray-400">({a.duplicateCount} reps)</span>
                    )}
                  </td>
                )}
                <td>{a.gstin}</td>
                <td>{a.payment_terms || "—"}</td>
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
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={isBoss ? 9 : 8} className="text-center text-gray-400 py-6">
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