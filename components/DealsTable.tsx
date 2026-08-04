type Deal = {
  id: string;
  name: string;
  amount: number;
  stage: string;
  created_at: string;
  account?: { name: string } | null;
  owner?: { full_name: string | null; email: string } | null; // only present for boss view
};

const stageStyles: Record<string, string> = {
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-rose-50 text-rose-700 border-rose-200",
  Prospecting: "bg-gray-100 text-gray-600 border-gray-200",
  Proposal: "bg-amber-50 text-amber-700 border-amber-200",
  Negotiation: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function DealsTable({ deals, showOwner = false }: { deals: Deal[]; showOwner?: boolean }) {
  const currency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="card p-4 overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Deal</th>
            <th>Account</th>
            {showOwner && <th>Owner</th>}
            <th>Stage</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td className="font-medium">{deal.name}</td>
              <td>{deal.account?.name ?? "—"}</td>
              {showOwner && <td>{deal.owner?.full_name ?? deal.owner?.email ?? "—"}</td>}
              <td>
                <span className={`badge border ${stageStyles[deal.stage] ?? stageStyles.Prospecting}`}>
                  {deal.stage}
                </span>
              </td>
              <td>{currency(deal.amount)}</td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td colSpan={showOwner ? 5 : 4} className="text-center text-gray-400 py-6">
                No active deals yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
