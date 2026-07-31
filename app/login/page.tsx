"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, TrendingUp, FileCheck, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-gradient relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.15), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <Sparkles size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Sales<span className="text-brand-300">CRM</span>
          </span>
        </div>

        <div className="relative space-y-8 max-w-sm">
          <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
            Run your sales pipeline like a premium team.
          </h1>
          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: "Track leads through deals to closed revenue" },
              { icon: FileCheck, text: "Generate GST-ready quotes in seconds" },
              { icon: ShieldCheck, text: "Row-level security keeps your data safe" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <f.icon size={16} className="text-brand-300" />
                </div>
                <p className="text-[14px] text-ink-200">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12px] text-ink-400">© {new Date().getFullYear()} SalesCRM</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="card w-full max-w-sm p-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Sparkles size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold text-ink-900">SalesCRM</span>
          </div>

          <h1 className="text-xl font-bold text-ink-900 tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {mode === "signin" ? "Sign in to your account" : "Set up a sales rep account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label">Full name</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-5 block mx-auto"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
