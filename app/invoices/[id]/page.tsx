"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QuoteDocument from "@/components/QuoteDocument";
import StatusDropdown, { StatusOption } from "@/components/StatusDropdown";

const invoiceStatusOptions: StatusOption[] = [
  { value: "Draft", tone: "gray" },
  { value: "Sent", tone: "blue" },
  { value: "Paid", tone: "green" },
  { value: "Overdue", tone: "red" },
];

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
        <StatusDropdown
          value={invoice.status}
          options={invoiceStatusOptions}
          onChange={(status) => updateStatus(status)}
        />
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
