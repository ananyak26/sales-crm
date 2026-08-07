"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QuoteDocument from "@/components/QuoteDocument";
import QuoteItemPhotos from "@/components/QuoteItemPhotos";
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
  const photosRef = useRef<HTMLDivElement>(null);

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
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Renders a canvas across as many PDF pages as it needs, slicing at page-height boundaries.
    const addCanvasAsPages = (canvas: HTMLCanvasElement, startNewPage: boolean) => {
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      if (startNewPage) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    };

    const docCanvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, allowTaint: false });
    addCanvasAsPages(docCanvas, false);

    // Product photos always start on a fresh page (page 2 onward), full size.
    if (photosRef.current && photosRef.current.innerHTML.trim() !== "") {
      const photosCanvas = await html2canvas(photosRef.current, { scale: 2, useCORS: true, allowTaint: false });
      addCanvasAsPages(photosCanvas, true);
    }

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      // Simple neat border frame around each page
      pdf.setDrawColor(28, 28, 28);
      pdf.setLineWidth(0.4);
      pdf.rect(6, 6, pageWidth - 12, pageHeight - 12);
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 3.5, { align: "center" });
    }

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
      <div ref={photosRef}>
        <QuoteItemPhotos items={items} />
      </div>
    </div>
  );
}
