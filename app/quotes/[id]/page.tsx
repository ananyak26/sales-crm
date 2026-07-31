"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QuoteDocument from "@/components/QuoteDocument";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    const { data: q } = await supabase.from("quotes").select("*").eq("id", id).single();
    if (!q) return;
    setQuote(q);
    const { data: its } = await supabase.from("quote_items").select("*").eq("quote_id", id).order("sort_order");
    setItems(its || []);
    if (q.account_id) {
      const { data: acc } = await supabase.from("accounts").select("*").eq("id", q.account_id).single();
      setAccount(acc);
    }
    if (q.contact_id) {
      const { data: c } = await supabase.from("contacts").select("*").eq("id", q.contact_id).single();
      setContact(c);
      setSendEmail(c?.email || "");
    }
    const { data: comp } = await supabase.from("company_settings").select("*").eq("id", 1).single();
    setCompany(comp);
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status: string) => {
    await supabase.from("quotes").update({ status }).eq("id", id);
    load();
  };

  const downloadPdf = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`${quote.quote_number}.pdf`);
    setDownloading(false);
  };

  const sendQuote = async () => {
    if (!sendEmail) {
      alert("Enter a recipient email");
      return;
    }
    setSending(true);
    const shareUrl = `${window.location.origin}/quote/${quote.share_token}`;
    const res = await fetch("/api/send-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: sendEmail,
        quoteNumber: quote.quote_number,
        accountName: account?.name,
        total: quote.grand_total,
        shareUrl,
      }),
    });
    if (res.ok) {
      await updateStatus("Sent");
      alert("Quote sent!");
    } else {
      const body = await res.json().catch(() => ({}));
      alert("Failed to send: " + (body.error || res.statusText));
    }
    setSending(false);
  };

  const convertToInvoice = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true });
    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, "0")}`;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        quote_id: quote.id,
        account_id: quote.account_id,
        status: "Draft",
        subtotal: quote.subtotal,
        tax_total: quote.tax_total,
        grand_total: quote.grand_total,
        place_of_supply: quote.place_of_supply,
        tax_type: quote.tax_type,
        due_date: null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error || !invoice) {
      alert("Error: " + error?.message);
      return;
    }

    const invoiceItems = items.map((i, idx) => ({
      invoice_id: invoice.id,
      product_id: i.product_id,
      description: i.description,
      hsn_sac: i.hsn_sac,
      unit: i.unit,
      quantity: i.quantity,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate,
      line_total: i.line_total,
    }));
    await supabase.from("invoice_items").insert(invoiceItems);
    router.push(`/invoices`);
  };

  if (!quote) return <p>Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quote.quote_number}</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={downloadPdf} disabled={downloading}>
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <button className="btn-primary" onClick={convertToInvoice}>
            Convert to Invoice
          </button>
        </div>
      </div>

      <div className="card p-5 flex items-center gap-3">
        <label className="label mb-0">Status:</label>
        <select className="input w-40" value={quote.status} onChange={(e) => updateStatus(e.target.value)}>
          <option>Draft</option>
          <option>Sent</option>
          <option>Accepted</option>
          <option>Rejected</option>
        </select>
        <div className="flex-1" />
        <input
          className="input flex-1"
          placeholder="client@email.com"
          value={sendEmail}
          onChange={(e) => setSendEmail(e.target.value)}
        />
        <button className="btn-primary" onClick={sendQuote} disabled={sending}>
          {sending ? "Sending..." : "Send to Client"}
        </button>
      </div>

      <div ref={printRef}>
        <QuoteDocument quote={quote} items={items} account={account} contact={contact} company={company} />
      </div>
    </div>
  );
}
