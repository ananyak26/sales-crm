"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Plus, Bell, Settings, LogOut, FileText, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type QuoteAlert = {
  id: string;
  quote_number: string;
  valid_until: string;
  expired: boolean;
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<QuoteAlert[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const hideOn = ["/login"];
  const hidden =
    hideOn.includes(pathname) || pathname.startsWith("/quote/") || pathname.startsWith("/invoice/");

  useEffect(() => {
    if (hidden) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const loadAlerts = async () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const weekOutStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("quotes")
        .select("id, quote_number, valid_until, status")
        .in("status", ["Draft", "Sent"])
        .not("valid_until", "is", null)
        .lte("valid_until", weekOutStr)
        .order("valid_until", { ascending: true })
        .limit(10);

      const list: QuoteAlert[] = (data || []).map((q: any) => ({
        id: q.id,
        quote_number: q.quote_number,
        valid_until: q.valid_until,
        expired: q.valid_until < todayStr,
      }));
      setAlerts(list);
    };
    loadAlerts();
  }, [hidden]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
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

  if (hidden) return null;

  const initial = (email || "U").charAt(0).toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-4 px-6 sticky top-0 z-10">
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search leads, deals, quotes..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm
              placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
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
                Quote Expiry Alerts
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 && (
                  <p className="px-4 py-4 text-sm text-gray-400">You're all caught up — no quotes expiring soon.</p>
                )}
                {alerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setNotifOpen(false);
                      router.push(`/quotes/${a.id}`);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-2.5"
                  >
                    {a.expired ? (
                      <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <FileText size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink-900">{a.quote_number}</p>
                      <p className="text-xs text-gray-500">
                        {a.expired ? "Expired on " : "Expires "}
                        {new Date(a.valid_until).toLocaleDateString()}
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
