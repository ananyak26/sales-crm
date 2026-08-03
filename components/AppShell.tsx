"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Routes that render full-bleed, edge-to-edge — no sidebar, topbar, padding, or max-width.
const BARE_PREFIXES = ["/login", "/quote/", "/invoice/"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
