"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Account, Contact, Deal, Product, QuoteItem } from "@/lib/types";

const blankItem = (): QuoteItem => ({
  product_id: null,
  description: "",
  product_description: "",
  image_url: null,
  hsn_sac: "",
  unit: "Nos",
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
  line_total: 0,
});

export default function NewQuotePage() {
  const supabase = createClient();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [accountId, setAccountId] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [subject, setSubject] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [notes, setNotes] = useState("Looking forward for your business.");
  const [discount, setDiscount] = useState(0);
  const [terms, setTerms] = useState(
    "Payment due within 30 days of acceptance. Prices valid until the date above."
  );
  const [items, setItems] = useState<QuoteItem[]>([blankItem()]);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [{ data: accs }, { data: dls }, { data: prods }, { data: comp }] = await Promise.all([
        supabase.from("accounts").select("*").order("name"),
        supabase.from("deals").select("*").order("name"),
        supabase.from("products").select("*").order("name"),
        supabase.from("company_settings").select("*").eq("id", 1).single(),
      ]);
      setAccounts(accs || []);
      setDeals(dls || []);
      setProducts(prods || []);
      setCompany(comp);
      if (comp?.default_terms) setTerms(comp.default_terms);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!accountId) {
        setContacts([]);
        return;
      }
      const { data } = await supabase.from("contacts").select("*").eq("account_id", accountId);
      setContacts(data || []);
      const acc = accounts.find((a) => a.id === accountId);
      if (acc?.state) setPlaceOfSupply(acc.state);
    })();
  }, [accountId]);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  // Same state as company -> CGST+SGST split; different state -> IGST
  const taxType: "IGST" | "CGST_SGST" =
    company?.state && selectedAccount?.state && company.state === selectedAccount.state ? "CGST_SGST" : "IGST";

  const updateItem = (index: number, patch: Partial<QuoteItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      next[index].line_total = Number(next[index].quantity) * Number(next[index].unit_price);
      return next;
    });
  };

  const pickProduct = (index: number, productId: string) => {
    const p = products.find((p) => p.id === productId);
    if (!p) {
      updateItem(index, { product_id: null });
      return;
    }
    updateItem(index, {
      product_id: p.id,
      description: p.name,
      product_description: p.description || "",
      image_url: p.image_url || null,
      unit_price: Number(p.price),
      tax_rate: Number(p.tax_rate),
      hsn_sac: p.hsn_sac || "",
      unit: p.unit || "Nos",
    });
  };

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const taxTotal = items.reduce(
    (s, i) => s + (Number(i.quantity) * Number(i.unit_price) * Number(i.tax_rate)) / 100,
    0
  );
  const grandTotal = subtotal - Number(discount) + taxTotal;

  const save = async () => {
    if (!accountId) {
      alert("Please select an account/client");
      return;
    }
    if (items.length === 0 || !items[0].description) {
      alert("Please add at least one line item");
      return;
    }
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: quoteNumberData, error: numError } = await supabase.rpc("next_quote_number");
    if (numError || !quoteNumberData) {
      alert("Error generating quote number: " + numError?.message);
      setSaving(false);
      return;
    }
    const quoteNumber = quoteNumberData as string;

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        quote_number: quoteNumber,
        account_id: accountId,
        contact_id: contactId || null,
        deal_id: dealId || null,
        status: "Draft",
        subtotal,
        discount: Number(discount),
        tax_total: taxTotal,
        grand_total: grandTotal,
        valid_until: validUntil || null,
        terms,
        subject: subject || null,
        place_of_supply: placeOfSupply || null,
        tax_type: taxType,
        notes: notes || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error || !quote) {
      alert("Error creating quote: " + error?.message);
      setSaving(false);
      return;
    }

    const itemRows = items
      .filter((i) => i.description)
      .map((i, idx) => ({
        quote_id: quote.id,
        product_id: i.product_id,
        description: i.description,
        product_description: i.product_description || null,
        image_url: i.image_url || null,
        hsn_sac: i.hsn_sac || null,
        unit: i.unit || "Nos",
        quantity: i.quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate,
        line_total: i.line_total,
        sort_order: idx,
      }));

    await supabase.from("quote_items").insert(itemRows);
    router.push(`/quotes/${quote.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">New Quote</h1>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Customer *</label>
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Contact</label>
            <select className="input" value={contactId} onChange={(e) => setContactId(e.target.value)}>
              <option value="">—</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Related Deal</label>
            <select className="input" value={dealId} onChange={(e) => setDealId(e.target.value)}>
              <option value="">—</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Valid Until</label>
            <input type="date" className="input" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div>
            <label className="label">Place Of Supply</label>
            <input
              className="input"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              placeholder="e.g. Maharashtra"
            />
          </div>
          <div className="flex items-end">
            <p className="text-xs text-gray-500">
              Tax type: <span className="font-semibold">{taxType === "IGST" ? "IGST (interstate)" : "CGST + SGST (same state)"}</span>{" "}
              — based on your company state vs the client's state in Customers.
            </p>
          </div>
        </div>
        <div>
          <label className="label">Subject</label>
          <input
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Quotation for KAIZEN PLUTO-50W with complete accessories"
          />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Line Items</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                  Item {idx + 1}
                </span>
                <button className="text-red-600 text-sm shrink-0" onClick={() => removeItem(idx)}>
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Product</label>
                  <div className="flex items-center gap-2">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-dashed border-gray-200 shrink-0" />
                    )}
                    <select
                      className="input flex-1"
                      value={item.product_id || ""}
                      onChange={(e) => pickProduct(idx, e.target.value)}
                    >
                      <option value="">Custom item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">HSN/SAC</label>
                  <input
                    className="input"
                    value={item.hsn_sac || ""}
                    onChange={(e) => updateItem(idx, { hsn_sac: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Product Detail (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Shown under the item on the quotation"
                  value={item.product_description || ""}
                  onChange={(e) => updateItem(idx, { product_description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="label">Qty</label>
                  <input
                    type="number"
                    className="input"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Unit Price</label>
                  <input
                    type="number"
                    className="input"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Tax %</label>
                  <input
                    type="number"
                    className="input"
                    value={item.tax_rate}
                    onChange={(e) => updateItem(idx, { tax_rate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Amount</label>
                  <div className="input flex items-center bg-gray-50 font-medium">
                    ₹{item.line_total.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-secondary" onClick={addItem}>
          + Add Line Item
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex justify-between">
          <div className="w-1/2 space-y-4">
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <label className="label">Terms & Conditions</label>
              <textarea className="input" rows={4} value={terms} onChange={(e) => setTerms(e.target.value)} />
            </div>
          </div>
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span>Discount</span>
              <input
                type="number"
                className="input w-24 text-right"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹{taxTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Quote"}
        </button>
        <button className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
