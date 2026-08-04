"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/Modal";
import type { Product } from "@/lib/types";

const emptyForm = { name: "", sku: "", price: 0, tax_rate: 18, description: "", hsn_sac: "", unit: "Nos", image_url: "" };

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    setUploading(false);
    if (error) {
      alert(`Image upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f: any) => ({ ...f, image_url: data.publicUrl }));
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
          <div>
            <label className="label">Product Image</label>
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="h-16 w-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                  No image
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                />
                <button type="button" className="btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : form.image_url ? "Replace image" : "Upload image"}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    className="text-xs text-red-600 text-left"
                    onClick={() => setForm((f: any) => ({ ...f, image_url: "" }))}
                  >
                    Remove image
                  </button>
                )}
              </div>
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
              <th></th>
              <th>Name</th>
              <th>SKU</th>
              <th>HSN/SAC</th>
              <th>Price</th>
              <th>Tax %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="cursor-pointer" onClick={() => openEdit(p)}>
                <td>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-10 w-10 rounded-md object-cover border border-gray-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-md border border-dashed border-gray-200" />
                  )}
                </td>
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
                <td colSpan={7} className="text-center text-gray-400 py-6">
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
