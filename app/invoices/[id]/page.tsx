"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QuoteDocument from "@/components/QuoteDocument";
import StatusSelect from "@/components/StatusSelect";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border-gray-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Overdue: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusOptions = ["Draft", "Sent", "Paid", "Overdue"];

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const load = async () => {
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (!inv) return;
    setInvoice(inv);
    const { data: its } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order");
    setItems(its || []);
    if (inv.account_id) {
      const { data: acc } = await supabase.from("accounts").select("*").eq("id", inv.account_id).single();
      setAccount(acc);
    }
    const { data: comp } = await supabase.from("company_settings").select("*").eq("id", 1).single();
    setCompany(comp);
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status: string) => {
    await supabase.from("invoices").update({ status }).eq("id", id);
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
    pdf.save(`${invoice.invoice_number}.pdf`);
    setDownloading(false);
  };

  if (!invoice) return <p>Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button className="btn-ghost btn-sm" onClick={() => router.push("/invoices")}>
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
        </div>
        <button className="btn-secondary" onClick={downloadPdf} disabled={downloading}>
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div className="card p-5 flex items-center gap-3">
        <label className="label mb-0 whitespace-nowrap">Status</label>
        <select
          className={`badge ${statusColors[invoice.status]} border-0`}
          value={invoice.status}
          onChange={(e) => updateStatus(e.target.value)}
        >
          <option>Draft</option>
          <option>Sent</option>
          <option>Paid</option>
          <option>Overdue</option>
        </select>
      </div>

      <div ref={printRef}>
        <QuoteDocument
          quote={{ ...invoice, quote_number: invoice.invoice_number }}
          items={items}
          account={account}
          contact={null}
          company={company}
          docLabel="Tax Invoice"
          dueDate={invoice.due_date}
        />
      </div>
    </div>
  );
}
