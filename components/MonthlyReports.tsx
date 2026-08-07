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

        <button
          onClick={() => downloadCsv(`team-report-${selectedMonth}.csv`, toCsv(repStats, selectedMonth))}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Download all as CSV
        </button>
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
                <td>
                  <button
                    onClick={() =>
                      downloadCsv(`${r.name.replace(/\s+/g, "-")}-${selectedMonth}.csv`, toCsv([r], selectedMonth))
                    }
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    Download
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
