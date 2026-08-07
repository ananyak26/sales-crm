"use client";

import { useRouter } from "next/navigation";

type RepMonthly = {
  id: string;
  name: string;
  email: string;
  dealsCreated: number;
  dealsWon: number;
  dealsLost: number;
  revenueWon: number;
  quotesCreated: number;
  quotesSent: number;
  quotesAccepted: number;
  quotesRejected: number;
};

const currency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function toCsv(rows: RepMonthly[], month: string) {
  const header = [
    "Employee",
    "Email",
    "Month",
    "Deals Created",
    "Deals Won",
    "Deals Lost",
    "Revenue Won (INR)",
    "Quotes Created",
    "Quotes Sent",
    "Quotes Accepted",
    "Quotes Rejected",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.email,
        monthLabel(month),
        r.dealsCreated,
        r.dealsWon,
        r.dealsLost,
        r.revenueWon,
        r.quotesCreated,
        r.quotesSent,
        r.quotesAccepted,
        r.quotesRejected,
      ]
        .map(escape)
        .join(",")
    );
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- PDF export (jsPDF, same lib already used for quote/invoice PDFs) ----------

const PDF_COLUMNS: { label: string; key: keyof RepMonthly; width: number }[] = [
  { label: "Employee", key: "name", width: 42 },
  { label: "Deals Won", key: "dealsWon", width: 20 },
  { label: "Deals Lost", key: "dealsLost", width: 20 },
  { label: "Revenue Won", key: "revenueWon", width: 30 },
  { label: "Quotes Sent", key: "quotesSent", width: 22 },
  { label: "Quotes Accepted", key: "quotesAccepted", width: 26 },
  { label: "Quotes Rejected", key: "quotesRejected", width: 26 },
];

const MARGIN = 14;
const ROW_H = 8;

// jsPDF's built-in fonts don't include the ₹ glyph, so PDFs use "Rs." instead —
// the on-screen table and CSV export still use the proper ₹ symbol via currency().
const pdfCurrency = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

function cellText(r: RepMonthly, key: keyof RepMonthly) {
  if (key === "revenueWon") return pdfCurrency(r.revenueWon as number);
  return String(r[key]);
}

/** Draws the table header at the current y and returns the y for the first data row. */
function drawTableHeader(doc: any, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  let x = MARGIN;
  for (const col of PDF_COLUMNS) {
    doc.text(col.label, x, y);
    x += col.width;
  }
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 2, x, y + 2);
  doc.setFont("helvetica", "normal");
  return y + 2 + ROW_H;
}

function buildTeamPdf(rows: RepMonthly[], month: string) {
  return import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Monthly Team Report", MARGIN, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(monthLabel(month), MARGIN, 27);

    let y = 40;
    y = drawTableHeader(doc, y);

    doc.setFontSize(9);
    for (const r of rows) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
        y = drawTableHeader(doc, y);
      }
      let x = MARGIN;
      for (const col of PDF_COLUMNS) {
        const text = cellText(r, col.key);
        doc.text(doc.splitTextToSize(text, col.width - 2), x, y);
        x += col.width;
      }
      y += ROW_H;
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated ${new Date().toLocaleDateString("en-IN")}`, MARGIN, pageHeight - 10);

    doc.save(`team-report-${month}.pdf`);
  });
}

function buildEmployeePdf(r: RepMonthly, month: string) {
  return import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(r.name, MARGIN, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Monthly Report — ${monthLabel(month)}`, MARGIN, 27);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(r.email, MARGIN, 33);
    doc.setTextColor(0);

    const stats: [string, string][] = [
      ["Deals created", String(r.dealsCreated)],
      ["Deals won", String(r.dealsWon)],
      ["Deals lost", String(r.dealsLost)],
      ["Revenue won", pdfCurrency(r.revenueWon)],
      ["Quotes created", String(r.quotesCreated)],
      ["Quotes sent", String(r.quotesSent)],
      ["Quotes accepted", String(r.quotesAccepted)],
      ["Quotes rejected", String(r.quotesRejected)],
    ];

    let y = 48;
    doc.setFontSize(11);
    for (const [label, value] of stats) {
      doc.setFont("helvetica", "normal");
      doc.text(label, MARGIN, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, MARGIN + 70, y);
      y += 9;
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated ${new Date().toLocaleDateString("en-IN")}`, MARGIN, doc.internal.pageSize.getHeight() - 10);

    doc.save(`${r.name.replace(/\s+/g, "-")}-${month}.pdf`);
  });
}

export default function MonthlyReports({
  months,
  selectedMonth,
  repStats,
}: {
  months: string[];
  selectedMonth: string;
  repStats: RepMonthly[];
}) {
  const router = useRouter();

  return (
    <div className="card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={selectedMonth}
          onChange={(e) => router.push(`/reports?month=${e.target.value}`)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => downloadCsv(`team-report-${selectedMonth}.csv`, toCsv(repStats, selectedMonth))}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Download all as CSV
          </button>
          <button
            onClick={() => buildTeamPdf(repStats, selectedMonth)}
            className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            Download all as PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Deals Won</th>
              <th>Deals Lost</th>
              <th>Revenue Won</th>
              <th>Quotes Sent</th>
              <th>Quotes Accepted</th>
              <th>Quotes Rejected</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {repStats.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.name}</td>
                <td>{r.dealsWon}</td>
                <td>{r.dealsLost}</td>
                <td className="font-semibold">{currency(r.revenueWon)}</td>
                <td>{r.quotesSent}</td>
                <td>{r.quotesAccepted}</td>
                <td>{r.quotesRejected}</td>
                <td className="whitespace-nowrap space-x-3">
                  <button
                    onClick={() =>
                      downloadCsv(`${r.name.replace(/\s+/g, "-")}-${selectedMonth}.csv`, toCsv([r], selectedMonth))
                    }
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => buildEmployeePdf(r, selectedMonth)}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
            {repStats.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-sm text-gray-400 py-6">
                  No activity this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
