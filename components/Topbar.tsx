"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Plus, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/deals": "Deals",
  "/accounts": "Accounts",
  "/products": "Products",
  "/quotes": "Quotes",
  "/invoices": "Invoices",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const hideOn = ["/login"];
  const hidden =
    hideOn.includes(pathname) || pathname.startsWith("/quote/") || pathname.startsWith("/invoice/");

  useEffect(() => {
    if (hidden) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [hidden]);

  if (hidden) return null;

  const title = titles[pathname] || "SalesCRM";
  const initial = (email || "U").charAt(0).toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center gap-4 px-6 sticky top-0 z-10">
      <h1 className="text-[17px] font-semibold text-ink-900 tracking-tight shrink-0">{title}</h1>

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
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-ink-400 hover:bg-gray-100 hover:text-ink-600 transition-colors">
          <Bell size={17} />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-semibold flex items-center justify-center shadow-soft">
          {initial}
        </div>
      </div>
    </header>
  );
}
