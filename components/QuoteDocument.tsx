import { amountInWordsRupees } from "@/lib/numberToWords";

function inr(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Brand palette — derived from the Kaizen logo (charcoal/black + orange).
const CHARCOAL = "#1c1c1c";
const CHARCOAL_SOFT = "#2a2a2a";
const ORANGE = "#f5a524";
const ORANGE_DEEP = "#d9720c";

export default function QuoteDocument({
  quote,
  items,
  account,
  contact,
  company,
  docLabel = "Quote",
  dueDate,
}: {
  quote: any;
  items: any[];
  account: any;
  contact: any;
  company: any;
  docLabel?: string;
  dueDate?: string | null;
}) {
  const isSplitTax = quote.tax_type === "CGST_SGST";
  const taxColSpan = isSplitTax ? 4 : 2;

  return (
    <div className="bg-sky-50 text-gray-800 text-xs" style={{ fontFamily: "Cambria, Georgia, 'Times New Roman', serif" }}>
      <div>
        {/* Header band */}
        <div
          data-pdf-block
          className="relative text-white px-8 pt-6 pb-7 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${CHARCOAL} 0%, ${CHARCOAL_SOFT} 100%)` }}
        >
          <div className="relative flex justify-between items-start gap-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company?.logo_url || "/kaizen-logo.png"}
                alt="logo"
                crossOrigin="anonymous"
                className="h-14 w-auto max-w-[160px] object-contain shrink-0 bg-white p-1"
              />
              <div>
                <p className="text-lg font-bold tracking-tight text-white">{company?.company_name || "Your Company Name"}</p>
                <p className="text-xs leading-5 text-gray-300 mt-1 max-w-xs">
                  {company?.address_line}
                  {company?.address_line && <br />}
                  {[company?.city, company?.state, company?.pincode].filter(Boolean).join(" ")}
                  {(company?.city || company?.state) && <br />}
                  {company?.country}
                  {company?.country && <br />}
                  {company?.gstin && <>GSTIN {company.gstin}<br /></>}
                  {(company?.phone || company?.email) && (
                    <>
                      {company?.phone}
                      {company?.phone && company?.email ? " · " : ""}
                      {company?.email}
                      <br />
                    </>
                  )}
                  {company?.website}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: ORANGE }}>
                {docLabel}
              </p>
              <p className="text-2xl font-bold mt-1 text-white"># {quote.quote_number}</p>
              <div className="text-xs text-gray-300 mt-3 space-y-0.5">
                <p>{docLabel} Date &nbsp;{fmtDate(quote.created_at)}</p>
                {dueDate && <p>Due Date &nbsp;&nbsp;&nbsp;{fmtDate(dueDate)}</p>}
                {quote.valid_until && !dueDate && <p>Valid Until &nbsp;{fmtDate(quote.valid_until)}</p>}
              </div>
            </div>
          </div>
        </div>
        {/* Accent bar */}
        <div
          className="h-1.5"
          style={{ background: `linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DEEP} 50%, ${ORANGE} 100%)` }}
        />

        {/* Bill To / Ship To / Details */}
        <div data-pdf-block className="grid grid-cols-3 gap-px bg-sky-200 text-xs border-b" style={{ borderColor: "#bfdbfe" }}>
          <div className="bg-sky-50 p-4">
            <p className="uppercase text-[10px] tracking-widest font-bold mb-1.5" style={{ color: ORANGE_DEEP }}>
              Billed To
            </p>
            <p className="font-bold text-gray-900 text-sm">{account?.name}</p>
            <p className="whitespace-pre-line text-gray-600 mt-1 leading-5">{account?.billing_address}</p>
            {contact && <p className="text-gray-600 mt-1">Attn: {contact.name}</p>}
            {account?.gstin && <p className="text-gray-600 mt-1">GSTIN {account.gstin}</p>}
          </div>
          <div className="bg-sky-50 p-4">
            <p className="uppercase text-[10px] tracking-widest font-bold mb-1.5" style={{ color: ORANGE_DEEP }}>
              Shipped To
            </p>
            <p className="whitespace-pre-line text-gray-600 leading-5">
              {account?.shipping_address || account?.billing_address}
            </p>
          </div>
          <div className="bg-sky-50 p-4">
            <p className="uppercase text-[10px] tracking-widest font-bold mb-1.5" style={{ color: ORANGE_DEEP }}>
              Details
            </p>
            <div className="space-y-1 text-gray-600">
              <p>Place of Supply: <span className="text-gray-800 font-medium">{quote.place_of_supply || "—"}</span></p>
              <p>
                Tax Type:{" "}
                <span className="text-gray-800 font-medium">{isSplitTax ? "CGST + SGST" : "IGST"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subject */}
        {quote.subject && (
          <div data-pdf-block className="px-6 py-3 border-b border-sky-200 bg-sky-50 text-xs">
            <span className="font-bold uppercase tracking-wide text-[10px]" style={{ color: ORANGE_DEEP }}>
              Subject
            </span>
            <p className="mt-1 text-gray-700 font-medium">{quote.subject}</p>
          </div>
        )}

        {/* Line items — wrapped as a single data-pdf-block so the whole table
            (header row + all items) moves together as one unit if it doesn't
            fit on the first page, instead of being cut mid-row. */}
        <div data-pdf-block>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-white" style={{ background: CHARCOAL }}>
              <th className="p-2 pl-6 text-left font-bold w-8 border border-gray-700">#</th>
              <th className="p-2 text-left font-bold border border-gray-700">Item &amp; Description</th>
              <th className="p-2 text-left font-bold border border-gray-700">HSN/SAC</th>
              <th className="p-2 text-right font-bold border border-gray-700">Qty</th>
              <th className="p-2 text-right font-bold border border-gray-700">Rate</th>
              {isSplitTax ? (
                <>
                  <th className="p-2 text-center font-bold border border-gray-700" colSpan={2}>CGST</th>
                  <th className="p-2 text-center font-bold border border-gray-700" colSpan={2}>SGST</th>
                </>
              ) : (
                <th className="p-2 text-center font-bold border border-gray-700" colSpan={2}>IGST</th>
              )}
              <th className="p-2 pr-6 text-right font-bold border border-gray-700">Amount</th>
            </tr>
            {isSplitTax && (
              <tr className="bg-sky-100 text-gray-600 text-[10px]">
                <th className="p-1 border border-gray-300" colSpan={5}></th>
                <th className="p-1 text-right font-medium border border-gray-300">%</th>
                <th className="p-1 text-right font-medium border border-gray-300">Amt</th>
                <th className="p-1 text-right font-medium border border-gray-300">%</th>
                <th className="p-1 text-right font-medium pr-6 border border-gray-300">Amt</th>
                <th className="p-1 border border-gray-300"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const lineAmount = Number(it.quantity) * Number(it.unit_price);
              const taxAmt = (lineAmount * Number(it.tax_rate)) / 100;
              return (
                <tr key={it.id || idx} className={idx % 2 === 1 ? "bg-orange-50/30" : "bg-sky-50"}>
                  <td className="p-2 pl-6 align-top border border-sky-200 text-gray-700 font-medium">
                    {idx + 1}
                  </td>
                  <td className="p-2 align-top border border-sky-200">
                    <p className="font-semibold text-gray-900 whitespace-pre-line">{it.description}</p>
                    {it.product_description && (
                      <p className="text-gray-600 text-[10px] leading-4 mt-0.5 whitespace-pre-line">
                        {it.product_description}
                      </p>
                    )}
                  </td>
                  <td className="p-2 align-top border border-sky-200 text-gray-800">{it.hsn_sac}</td>
                  <td className="p-2 align-top border border-sky-200 text-right text-gray-900">
                    {Number(it.quantity).toFixed(2)}
                  </td>
                  <td className="p-2 align-top border border-sky-200 text-right text-gray-900">
                    {inr(it.unit_price)}
                  </td>
                  {isSplitTax ? (
                    <>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {(Number(it.tax_rate) / 2).toFixed(0)}%
                      </td>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {inr(taxAmt / 2)}
                      </td>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {(Number(it.tax_rate) / 2).toFixed(0)}%
                      </td>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {inr(taxAmt / 2)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {Number(it.tax_rate).toFixed(0)}%
                      </td>
                      <td className="p-2 align-top border border-sky-200 text-right text-gray-800">
                        {inr(taxAmt)}
                      </td>
                    </>
                  )}
                  <td className="p-2 pr-6 align-top border border-sky-200 text-right font-semibold text-gray-900">
                    {inr(lineAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Totals + words */}
        <div data-pdf-block className="grid grid-cols-2 border-t border-sky-200">
          <div className="p-5 text-xs border-r border-sky-200">
            <div className="bg-orange-50/40 p-3" style={{ border: `1px solid ${ORANGE}55` }}>
              <p className="font-bold uppercase text-[10px] tracking-widest" style={{ color: ORANGE_DEEP }}>
                Total In Words
              </p>
              <p className="italic font-semibold mt-1.5 text-gray-800">{amountInWordsRupees(quote.grand_total)}</p>
            </div>
            {quote.notes && (
              <div className="mt-3">
                <p className="font-bold uppercase text-[10px] tracking-widest" style={{ color: ORANGE_DEEP }}>
                  Notes
                </p>
                <p className="mt-1 text-gray-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>
          <div className="p-5 text-xs">
            <div className="flex justify-between py-1 text-gray-600">
              <span>Sub Total</span>
              <span className="font-medium text-gray-800">{inr(quote.subtotal)}</span>
            </div>
            {Number(quote.discount) > 0 && (
              <div className="flex justify-between py-1 text-gray-600">
                <span>Discount</span>
                <span className="font-medium text-gray-800">-{inr(quote.discount)}</span>
              </div>
            )}
            {Number(quote.adjustment || 0) !== 0 && (
              <div className="flex justify-between py-1 text-gray-600">
                <span>Adjustment</span>
                <span className="font-medium text-gray-800">
                  {Number(quote.adjustment) > 0 ? "" : "-"}
                  {inr(Math.abs(Number(quote.adjustment)))}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 text-gray-600">
              <span>{isSplitTax ? "CGST + SGST" : "IGST"}</span>
              <span className="font-medium text-gray-800">{inr(quote.tax_total)}</span>
            </div>
            <div
              className="mt-2.5 flex justify-between items-center text-white px-4 py-3 shadow-soft"
              style={{ background: `linear-gradient(90deg, ${ORANGE_DEEP} 0%, ${ORANGE} 100%)` }}
            >
              <span className="font-semibold uppercase text-[10px] tracking-widest text-white">
                {docLabel === "Quote" ? "Subtotal" : "Total Due"}
              </span>
              <span className="font-bold text-lg text-white">₹{inr(quote.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Bank + signature */}
        <div data-pdf-block className="grid grid-cols-2 border-t border-sky-200 text-xs">
          <div className="p-5 border-r border-sky-200">
            {company?.bank_account_name && (
              <>
                <p className="font-bold uppercase text-[10px] tracking-widest mb-1.5" style={{ color: ORANGE_DEEP }}>
                  Bank Details
                </p>
                <div className="space-y-0.5 text-gray-600">
                  <p>Account Name: <span className="text-gray-800 font-medium">{company.bank_account_name}</span></p>
                  <p>Bank Name: <span className="text-gray-800 font-medium">{company.bank_name}</span></p>
                  <p>Account Number: <span className="text-gray-800 font-medium">{company.bank_account_number}</span></p>
                  <p>IFSC Code: <span className="text-gray-800 font-medium">{company.bank_ifsc}</span></p>
                </div>
              </>
            )}
          </div>
          <div className="p-5 flex items-end justify-center">
            <p className="border-t border-gray-400 pt-1.5 w-48 text-center text-gray-600">Authorized Signature</p>
          </div>
        </div>

        {/* Footer accent strip */}
        <div data-pdf-block className="h-1.5" style={{ background: `linear-gradient(90deg, ${ORANGE} 0%, ${ORANGE_DEEP} 50%, ${ORANGE} 100%)` }} />
      </div>
    </div>
  );
}
