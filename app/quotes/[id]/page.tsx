"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QuoteDocument from "@/components/QuoteDocument";
import StatusSelect from "@/components/StatusSelect";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusOptions = ["Draft", "Sent", "Accepted", "Rejected"];

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
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);

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

  const generatePdf = async () => {
    if (!printRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`${quote.quote_number}.pdf`);
  };

  const downloadPdf = async () => {
    setDownloading(true);
    await generatePdf();
    setDownloading(false);
  };

  const sendQuote = async () => {
    if (!sendEmail) {
      alert("Enter a recipient email");
      return;
    }
    setSending(true);
    await generatePdf();
    setSending(false);

    const subject = `Quotation ${quote.quote_number}${account?.name ? " for " + account.name : ""}`;
    const body =
      `Hi,\n\n` +
      `Please find attached your quotation${account?.name ? " for " + account.name : ""}.\n\n` +
      `Total: ₹${Number(quote.grand_total).toLocaleString("en-IN")}\n\n` +
      `Thanks!`;

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(sendEmail)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank");
    alert(
      `"${quote.quote_number}.pdf" was downloaded to your computer.\n\n` +
        `In the Gmail tab that just opened, click the paperclip (attach) icon, pick that PDF from your Downloads folder, then hit Send.`
    );
    updateStatus("Sent");
  };

  const convertToInvoice = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: invoiceNumberData, error: numError } = await supabase.rpc("next_invoice_number");
    if (numError || !invoiceNumberData) {
      alert("Error generating sales order number: " + numError?.message);
      return;
    }
    const invoiceNumber = invoiceNumberData as string;

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
      product_description: i.product_description || null,
      image_url: i.image_url || null,
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
            Convert to Sales Order
          </button>
        </div>
      </div>

      <div className="card p-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <label className="label mb-0 whitespace-nowrap">Status</label>
          <StatusSelect value={quote.status} onChange={updateStatus} options={statusOptions} colorMap={statusColors} />
        </div>
        <input
          className="input flex-1 min-w-[220px]"
          type="email"
          placeholder="client@email.com"
          value={sendEmail}
          onChange={(e) => setSendEmail(e.target.value)}
        />
        <button className="btn-primary shrink-0" onClick={sendQuote} disabled={sending}>
          {sending ? "Preparing..." : "Send to Client"}
        </button>
      </div>

      <div ref={printRef}>
        <QuoteDocument quote={quote} items={items} account={account} contact={contact} company={company} />
      </div>
    </div>
  );
}
