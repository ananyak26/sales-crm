"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  FileText,
  Receipt,
  Handshake,
  Building2,
  Package,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReminderAlert = {
  id: string;
  kind: "quote" | "deal";
  recordId: string;
  title: string;
  date: string;
  overdue: boolean;
};

type SearchResults = {
  accounts: { id: string; name: string }[];
  deals: { id: string; name: string; stage: string }[];
  quotes: { id: string; quote_number: string; subject: string | null }[];
  invoices: { id: string; invoice_number: string }[];
  products: { id: string; name: string; sku: string | null }[];
};

const emptyResults: SearchResults = { accounts: [], deals: [], quotes: [], invoices: [], products: [] };

// Reminders fire for anything due (or overdue) within this many days.
const REMINDER_WINDOW_DAYS = 2;

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ReminderAlert[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const searchRef = useRef<HTMLDivElement>(null);

  const hideOn = ["/login"];
  const hidden =
    hideOn.includes(pathname) || pathname.startsWith("/quote/") || pathname.startsWith("/invoice/");

  useEffect(() => {
    if (hidden) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const loadAlerts = async () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const cutoffStr = new Date(Date.now() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const [{ data: quoteData }, { data: dealData }] = await Promise.all([
        supabase
          .from("quotes")
          .select("id, quote_number, valid_until, status")
          .in("status", ["Draft", "Sent"])
          .not("valid_until", "is", null)
          .lte("valid_until", cutoffStr)
          .order("valid_until", { ascending: true })
          .limit(8),
        supabase
          .from("deals")
          .select("id, name, close_date, stage")
          .in("stage", ["Prospecting", "Proposal", "Negotiation"])
          .not("close_date", "is", null)
          .lte("close_date", cutoffStr)
          .order("close_date", { ascending: true })
          .limit(8),
      ]);

      const quoteAlerts: ReminderAlert[] = (quoteData || []).map((q: any) => ({
        id: `quote-${q.id}`,
        kind: "quote",
        recordId: q.id,
        title: q.quote_number,
        date: q.valid_until,
        overdue: q.valid_until < todayStr,
      }));
      const dealAlerts: ReminderAlert[] = (dealData || []).map((d: any) => ({
        id: `deal-${d.id}`,
        kind: "deal",
        recordId: d.id,
        title: d.name,
        date: d.close_date,
        overdue: d.close_date < todayStr,
      }));

      setAlerts([...quoteAlerts, ...dealAlerts].sort((a, b) => a.date.localeCompare(b.date)));
    };
    loadAlerts();
  }, [hidden]);

  // Debounced live search across accounts, deals, quotes, invoices, and products.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(emptyResults);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const supabase = createClient();
      const like = `%${q}%`;
      const [accRes, dealRes, quoteRes, invRes, prodRes] = await Promise.all([
        supabase.from("accounts").select("id, name").ilike("name", like).limit(5),
        supabase.from("deals").select("id, name, stage").ilike("name", like).limit(5),
        supabase
          .from("quotes")
          .select("id, quote_number, subject")
          .or(`quote_number.ilike.${like},subject.ilike.${like}`)
          .limit(5),
        supabase.from("invoices").select("id, invoice_number").ilike("invoice_number", like).limit(5),
        supabase.from("products").select("id, name, sku").or(`name.ilike.${like},sku.ilike.${like}`).limit(5),
      ]);
      setResults({
        accounts: accRes.data || [],
        deals: dealRes.data || [],
        quotes: quoteRes.data || [],
        invoices: invRes.data || [],
        products: prodRes.data || [],
      });
      setSearching(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const goTo = (href: string) => {
    setSearchOpen(false);
    setNotifOpen(false);
    setQuery("");
    router.push(href);
  };

  if (hidden) return null;

  const initial = (email || "U").charAt(0).toUpperCase();
  const totalResults =
    results.accounts.length + results.deals.length + results.quotes.length + results.invoices.length + results.products.length;
  const showDropdown = searchOpen && query.trim().length >= 2;

  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-4 px-6 sticky top-0 z-10">
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm" ref={searchRef}>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchOpen(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Search accounts, deals, quotes, sales order..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-9 py-2 text-sm
              placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}

          {showDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 max-h-96 overflow-y-auto">
              {searching && (
                <div className="px-4 py-4 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Searching...
                </div>
              )}

              {!searching && totalResults === 0 && (
                <p className="px-4 py-4 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
              )}

              {!searching && results.accounts.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Customers
                  </div>
                  {results.accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => goTo("/accounts")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <Building2 size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-ink-800 truncate">{a.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.deals.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Deals
                  </div>
                  {results.deals.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => goTo("/deals")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <Handshake size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-ink-800 truncate flex-1">{d.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{d.stage}</span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.quotes.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Quotes
                  </div>
                  {results.quotes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => goTo(`/quotes/${q.id}`)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <FileText size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-ink-800 truncate flex-1">{q.quote_number}</span>
                      {q.subject && <span className="text-xs text-gray-400 truncate max-w-[120px]">{q.subject}</span>}
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.invoices.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Sales Order
                  </div>
                  {results.invoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => goTo(`/invoices/${inv.id}`)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <Receipt size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-ink-800 truncate">{inv.invoice_number}</span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.products.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Products
                  </div>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => goTo("/products")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <Package size={15} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-ink-800 truncate flex-1">{p.name}</span>
                      {p.sku && <span className="text-xs text-gray-400 shrink-0">{p.sku}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push("/quotes/new")}
          className="btn-primary btn-sm hidden sm:inline-flex"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Quote
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink-400 hover:bg-gray-100 hover:text-ink-600 transition-colors"
          >
            <Bell size={17} />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Reminders · Next {REMINDER_WINDOW_DAYS} Days
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 && (
                  <p className="px-4 py-4 text-sm text-gray-400">
                    You're all caught up — nothing expiring or closing soon.
                  </p>
                )}
                {alerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => goTo(a.kind === "quote" ? `/quotes/${a.recordId}` : "/deals")}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-2.5"
                  >
                    {a.overdue ? (
                      <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    ) : a.kind === "quote" ? (
                      <FileText size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <Handshake size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {a.kind === "quote"
                          ? a.overdue
                            ? "Expired on "
                            : "Expires "
                          : a.overdue
                            ? "Was due to close "
                            : "Closing "}
                        {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-semibold flex items-center justify-center shadow-soft"
          >
            {initial}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-ink-900 truncate">{email || "Signed in"}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-gray-50"
              >
                <Settings size={15} className="text-gray-400" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
