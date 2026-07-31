"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("company_settings").select("*").eq("id", 1).single();
      setForm(data || { id: 1 });
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const { id, ...rest } = form;
    const { error } = await supabase.from("company_settings").upsert({ id: 1, ...rest });
    setSaving(false);
    if (!error) setSaved(true);
    else alert("Error saving: " + error.message);
  };

  if (!form) return <p>Loading...</p>;

  const field = (key: string, label: string, span = 1) => (
    <div className={span === 2 ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input className="input" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Company Settings</h1>
      <p className="text-sm text-gray-500">
        This information appears as the letterhead on every quote your team sends — company name, GST details, bank
        info, and default terms.
      </p>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("company_name", "Company Name", 2)}
          {field("address_line", "Address Line", 2)}
          {field("city", "City")}
          {field("state", "State")}
          {field("pincode", "Pincode")}
          {field("country", "Country")}
          {field("gstin", "GSTIN")}
          {field("phone", "Phone")}
          {field("email", "Email")}
          {field("website", "Website")}
          {field("logo_url", "Logo URL (optional, hosted image link)", 2)}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Bank Details (shown on quotes)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("bank_account_name", "Account Name")}
          {field("bank_name", "Bank Name")}
          {field("bank_account_number", "Account Number")}
          {field("bank_ifsc", "IFSC Code")}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Default Terms & Conditions</h2>
        <textarea
          className="input"
          rows={5}
          value={form.default_terms || ""}
          onChange={(e) => setForm({ ...form, default_terms: e.target.value })}
        />
        <p className="text-xs text-gray-400">
          Pre-fills new quotes. Each quote can still edit its own terms before sending.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-green-600 text-sm">Saved ✓</span>}
      </div>
    </div>
  );
}
