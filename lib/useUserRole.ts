"use client";
// lib/useUserRole.ts
// Client-side hook: who's logged in, and are they the boss?
// Used to conditionally show the "Owner" column on list pages, and to
// scope newly-created rows to the current user.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<"sales" | "boss" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setRole((data?.role as "sales" | "boss") ?? "sales");
      setLoading(false);
    })();
  }, []);

  return { role, userId, isBoss: role === "boss", loading };
}
