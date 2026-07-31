"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Routes that don't require an active session — never force-logout on these.
const PUBLIC_PREFIXES = ["/login", "/quote/", "/invoice/"];

// This component is rendered once in the root layout. The root layout persists
// across in-app (client-side) navigation and only remounts on a genuine browser
// page load/reload — so this effect only fires when the page is actually reloaded,
// not when the user clicks around the app.
export default function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
    if (isPublic) return;

    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      router.push("/login");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
