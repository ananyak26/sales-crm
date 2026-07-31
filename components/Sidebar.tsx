"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutGrid,
  Handshake,
  Building2,
  Package,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const hideOn = ["/login"];
  if (
    hideOn.includes(pathname) ||
    pathname.startsWith("/quote/") ||
    pathname.startsWith("/invoice/")
  ) {
    return null;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 bg-ink-gradient min-h-screen flex flex-col text-ink-200">
      {/* Brand */}
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow shrink-0">
          <Sparkles size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Sales<span className="text-brand-300">CRM</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-ink-300 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-brand-400" />
              )}
              <Icon
                size={17}
                strokeWidth={2}
                className={active ? "text-brand-300" : "text-ink-400 group-hover:text-ink-200"}
              />
              {l.label}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/settings"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${
              pathname === "/settings"
                ? "bg-white/[0.08] text-white"
                : "text-ink-300 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Settings size={17} strokeWidth={2} className="text-ink-400 group-hover:text-ink-200" />
            Settings
          </Link>
        </div>
      </nav>

      {/* Footer / account */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-ink-300 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <LogOut size={17} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
