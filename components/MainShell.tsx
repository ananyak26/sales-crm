"use client";

import { usePathname } from "next/navigation";

// Routes that render their own full-bleed layout and must not get the
// dashboard's padded, max-width-constrained container.
const fullBleedRoutes = ["/login"];

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed =
    fullBleedRoutes.includes(pathname) ||
    pathname.startsWith("/quote/") ||
    pathname.startsWith("/invoice/");

  if (isFullBleed) {
    return <main className="flex-1 min-w-0">{children}</main>;
  }

  return <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>;
}
