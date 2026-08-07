import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuoteDocument from "@/components/QuoteDocument";
import QuoteItemPhotos from "@/components/QuoteItemPhotos";

export default async function PublicQuotePage({ params }: { params: { token: string } }) {
  const supabase = createClient();

  const { data: quote } = await supabase.from("quotes").select("*").eq("share_token", params.token).single();
  if (!quote) return notFound();

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("sort_order");

  const { data: account } = quote.account_id
    ? await supabase.from("accounts").select("*").eq("id", quote.account_id).single()
    : { data: null };

  const { data: contact } = quote.contact_id
    ? await supabase.from("contacts").select("*").eq("id", quote.contact_id).single()
    : { data: null };

  const { data: company } = await supabase.from("company_settings").select("*").eq("id", 1).single();

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <QuoteDocument quote={quote} items={items || []} account={account} contact={contact} company={company} />
        <QuoteItemPhotos items={items || []} />
      </div>
    </div>
  );
}
