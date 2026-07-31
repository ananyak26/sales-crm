"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/lib/types";

const emptyForm = { name: "", company: "", email: "", phone: "", status: "New", source: "", notes: "" };
const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Qualified: "bg-green-100 text-green-700",
  Lost: "bg-gray-200 text-gray-600",
};

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) console.error("Load leads failed:", error);
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setForm(lead);
    setEditingId(lead.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return;
    let error;
    if (editingId) {
      ({ error } = await supabase.from("leads").update(form).eq("id", editingId));
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      ({ error } = await supabase.from("leads").insert({ ...form, created_by: user?.id }));
    }
    if (error) {
      console.error("Save lead failed:", error);
      alert(`Could not save lead: ${error.message}`);
      return;
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button className="btn-primary" onClick={openNew}>
          + New Lead
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.keys(statusColors).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Source</label>
              <input className="input" value={form.source || ""} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card p-4 overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="cursor-pointer" onClick={() => openEdit(l)}>
                <td className="font-medium">{l.name}</td>
                <td>{l.company}</td>
                <td>{l.email}</td>
                <td>{l.phone}</td>
                <td>
                  <span className={`badge ${statusColors[l.status]}`}>{l.status}</span>
                </td>
                <td>{l.source}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button className="text-brand-600 text-sm" onClick={(e) => { e.stopPropagation(); openEdit(l); }}>
                    Edit
                  </button>
                  <button className="text-red-600 text-sm" onClick={(e) => { e.stopPropagation(); remove(l.id); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-6">
                  No leads yet — click "New Lead" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}