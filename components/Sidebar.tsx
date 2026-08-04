"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  BarChart3,
  Users,
} from "lucide-react";

const salesLinks = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/invoices", label: "Sales Order", icon: Receipt },
];

const bossLinks = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/invoices", label: "Sales Order", icon: Receipt },
  { href: "/boss/employees", label: "Employees", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"sales" | "boss">("sales");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role === "boss") setRole("boss");
    });
  }, []);

  const links = role === "boss" ? bossLinks : salesLinks;

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
    <aside className="w-64 shrink-0 sticky top-0 h-screen bg-ink-gradient flex flex-col text-ink-200 overflow-hidden">
      {/* Brand */}
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow shrink-0">
          <Sparkles size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Sales<span className="text-brand-300">CRM</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10.5px] font-semibold text-ink-500 uppercase tracking-widest">Menu</p>
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-ink-300 hover:text-white hover:bg-white/[0.045] hover:translate-x-0.5"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-brand-400 shadow-glow" />
              )}
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0 ${
                  active
                    ? "bg-brand-500/20 text-brand-300"
                    : "text-ink-400 group-hover:text-ink-100 group-hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
              </span>
              {l.label}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/settings"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
              pathname === "/settings"
                ? "bg-white/[0.08] text-white"
                : "text-ink-300 hover:text-white hover:bg-white/[0.045] hover:translate-x-0.5"
            }`}
          >
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0 ${
                pathname === "/settings"
                  ? "bg-brand-500/20 text-brand-300"
                  : "text-ink-400 group-hover:text-ink-100 group-hover:bg-white/[0.05]"
              }`}
            >
              <Settings size={16} strokeWidth={2} />
            </span>
            Settings
          </Link>
        </div>
      </nav>

      {/* Footer / account */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-ink-300 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg text-ink-400 group-hover:text-rose-300 group-hover:bg-rose-500/10 transition-colors shrink-0">
            <LogOut size={16} strokeWidth={2} />
          </span>
          Log out
        </button>
      </div>
    </aside>
  );
}
