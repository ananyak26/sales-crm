import { amountInWordsRupees } from "@/lib/numberToWords";

function inr(n: number) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function QuoteDocument({
  quote,
  items,
  account,
  contact,
  company,
}: {
  quote: any;
  items: any[];
  account: any;
  contact: any;
  company: any;
}) {
  const isSplitTax = quote.tax_type === "CGST_SGST";

  return (
    <div className="bg-white text-sm text-gray-800" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-300">
          <div className="flex gap-4">
            {company?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt="logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <p className="font-bold text-base">{company?.company_name || "Your Company Name"}</p>
              <p className="text-xs leading-5 text-gray-600">
                {company?.address_line}
                {company?.address_line && <br />}
                {[company?.city, company?.state, company?.pincode].filter(Boolean).join(" ")}
                {(company?.city || company?.state) && <br />}
                {company?.country}
                {company?.country && <br />}
                {company?.gstin && <>GSTIN {company.gstin}<br /></>}
                {(company?.phone || company?.email) && (
                  <>
                    Contact details:-{company?.phone}
                    {company?.phone && company?.email ? "," : ""}
                    {company?.email}
                    <br />
                  </>
                )}
                {company?.website}
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-700">Quote</h1>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 border-b border-gray-300 text-xs">
          <div className="p-4 border-r border-gray-300 space-y-1">
            <p>
              <span className="font-semibold"># </span>: {quote.quote_number}
            </p>
            <p>
              <span className="font-semibold">Quote Date</span> :{" "}
              {new Date(quote.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")}
            </p>
          </div>
          <div className="p-4">
            <p>
              <span className="font-semibold">Place Of Supply</span> : {quote.place_of_supply || "—"}
            </p>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-2 border-b border-gray-300 text-xs">
          <div className="p-4 border-r border-gray-300">
            <p className="font-semibold mb-1">Bill To</p>
            <p className="font-bold">{account?.name}</p>
            <p className="whitespace-pre-line">{account?.billing_address}</p>
            {contact && <p>Attn: {contact.name}</p>}
            {account?.gstin && <p>GSTIN {account.gstin}</p>}
          </div>
          <div className="p-4">
            <p className="font-semibold mb-1">Ship To</p>
            <p className="whitespace-pre-line">{account?.shipping_address || account?.billing_address}</p>
          </div>
        </div>

        {/* Subject */}
        {quote.subject && (
          <div className="p-4 border-b border-gray-300 text-xs">
            <span className="font-semibold">Subject :</span>
            <p className="mt-1">{quote.subject}</p>
          </div>
        )}

        {/* Line items */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Item &amp; Description</th>
              <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
              <th className="border border-gray-300 p-2 text-right">Qty</th>
              <th className="border border-gray-300 p-2 text-right">Rate</th>
              {isSplitTax ? (
                <>
                  <th className="border border-gray-300 p-2 text-center" colSpan={2}>
                    CGST
                  </th>
                  <th className="border border-gray-300 p-2 text-center" colSpan={2}>
                    SGST
                  </th>
                </>
              ) : (
                <th className="border border-gray-300 p-2 text-center" colSpan={2}>
                  IGST
                </th>
              )}
              <th className="border border-gray-300 p-2 text-right">Amount</th>
            </tr>
            {isSplitTax && (
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1" colSpan={5}></th>
                <th className="border border-gray-300 p-1 text-right">%</th>
                <th className="border border-gray-300 p-1 text-right">Amt</th>
                <th className="border border-gray-300 p-1 text-right">%</th>
                <th className="border border-gray-300 p-1 text-right">Amt</th>
                <th className="border border-gray-300 p-1"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const lineAmount = Number(it.quantity) * Number(it.unit_price);
              const taxAmt = (lineAmount * Number(it.tax_rate)) / 100;
              return (
                <tr key={it.id || idx}>
                  <td className="border border-gray-300 p-2 align-top">{idx + 1}</td>
                  <td className="border border-gray-300 p-2 align-top whitespace-pre-line">{it.description}</td>
                  <td className="border border-gray-300 p-2 align-top">{it.hsn_sac}</td>
                  <td className="border border-gray-300 p-2 align-top text-right">
                    {Number(it.quantity).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 align-top text-right">{inr(it.unit_price)}</td>
                  {isSplitTax ? (
                    <>
                      <td className="border border-gray-300 p-2 align-top text-right">
                        {(Number(it.tax_rate) / 2).toFixed(0)}%
                      </td>
                      <td className="border border-gray-300 p-2 align-top text-right">{inr(taxAmt / 2)}</td>
                      <td className="border border-gray-300 p-2 align-top text-right">
                        {(Number(it.tax_rate) / 2).toFixed(0)}%
                      </td>
                      <td className="border border-gray-300 p-2 align-top text-right">{inr(taxAmt / 2)}</td>
                    </>
                  ) : (
                    <>
                      <td className="border border-gray-300 p-2 align-top text-right">
                        {Number(it.tax_rate).toFixed(0)}%
                      </td>
                      <td className="border border-gray-300 p-2 align-top text-right">{inr(taxAmt)}</td>
                    </>
                  )}
                  <td className="border border-gray-300 p-2 align-top text-right">{inr(lineAmount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals + words */}
        <div className="grid grid-cols-2 border-t-0">
          <div className="p-4 text-xs border-r border-gray-300">
            <p className="font-semibold">Total In Words</p>
            <p className="italic font-semibold mt-1">{amountInWordsRupees(quote.grand_total)}</p>
            {quote.notes && (
              <div className="mt-4">
                <p className="font-semibold">Notes</p>
                <p>{quote.notes}</p>
              </div>
            )}
          </div>
          <div className="p-4 text-xs">
            <div className="flex justify-between py-1">
              <span>Sub Total</span>
              <span>{inr(quote.subtotal)}</span>
            </div>
            {Number(quote.discount) > 0 && (
              <div className="flex justify-between py-1">
                <span>Discount</span>
                <span>-{inr(quote.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span>{isSplitTax ? "CGST + SGST" : "IGST"}</span>
              <span>{inr(quote.tax_total)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-sm">
              <span>Total</span>
              <span>₹{inr(quote.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Bank + signature */}
        <div className="grid grid-cols-2 border-t border-gray-300 text-xs">
          <div className="p-4 border-r border-gray-300">
            {company?.bank_account_name && (
              <>
                <p className="font-semibold">BANK DETAILS</p>
                <p>Account Name:-{company.bank_account_name}</p>
                <p>Bank Name:- {company.bank_name}</p>
                <p>Account Number:-{company.bank_account_number}</p>
                <p>IFSC Code:-{company.bank_ifsc}</p>
              </>
            )}
          </div>
          <div className="p-4 flex items-end justify-center">
            <p className="border-t border-gray-400 pt-1 w-48 text-center">Authorized Signature</p>
          </div>
        </div>

        {/* Terms */}
        {quote.terms && (
          <div className="p-4 border-t border-gray-300 text-xs whitespace-pre-line">
            <p className="font-semibold mb-1">Terms &amp; Conditions</p>
            {quote.terms}
          </div>
        )}
      </div>
    </div>
  );
}
