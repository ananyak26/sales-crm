"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import type { Product } from "@/lib/types";

const emptyForm = { name: "", sku: "", price: 0, tax_rate: 18, description: "", hsn_sac: "", unit: "Nos" };

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setForm(p);
    setEditingId(p.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return;
    const payload = { ...form, price: Number(form.price), tax_rate: Number(form.tax_rate) };
    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("products").insert({ ...payload, created_by: user?.id });
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products / Price Book</h1>
        <button className="btn-primary" onClick={openNew}>
          + New Product
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? "Edit Product" : "New Product"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="label">HSN/SAC Code</label>
              <input className="input" value={form.hsn_sac || ""} onChange={(e) => setForm({ ...form, hsn_sac: e.target.value })} />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Tax Rate (%)</label>
              <input type="number" className="input" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={form.unit || "Nos"} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <th>SKU</th>
              <th>HSN/SAC</th>
              <th>Price</th>
              <th>Tax %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="cursor-pointer" onClick={() => openEdit(p)}>
                <td className="font-medium">{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.hsn_sac}</td>
                <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td>{p.tax_rate}%</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button className="text-brand-600 text-sm" onClick={(e) => { e.stopPropagation(); openEdit(p); }}>
                    Edit
                  </button>
                  <button className="text-red-600 text-sm" onClick={(e) => { e.stopPropagation(); remove(p.id); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-6">
                  No products yet — add items to your price book.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
