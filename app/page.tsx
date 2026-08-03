"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ShieldCheck, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);

  // Subtle cursor-reactive spotlight — the one restrained interactive touch
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
  };

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
    <div
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      className="h-screen relative flex items-center justify-center overflow-hidden bg-ink-gradient px-6 py-4"
    >
      {/* Two slow, quiet indigo blobs — the only ambient motion, kept monochrome and subtle */}
      <div className="aurora-blob-slow w-[560px] h-[560px] bg-brand-600/[0.16]" style={{ top: "-16%", left: "-12%" }} />
      <div
        className="aurora-blob-slow w-[480px] h-[480px] bg-brand-500/[0.12]"
        style={{ bottom: "-18%", right: "-10%", animationDelay: "-9s" }}
      />

      {/* Cursor-reactive spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(650px circle at var(--spot-x, 50%) var(--spot-y, 40%), rgba(129,140,248,0.10), transparent 60%)",
        }}
      />

      {/* Fine grain — the detail that keeps a dark gradient from looking flat/plasticky */}
      <div className="noise-overlay" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle at 50% 45%, transparent 30%, rgba(5,6,14,0.5) 100%)" }}
      />

      {/* Centered column: brand, headline, sign-in card */}
      <div className="fade-in-up relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <Sparkles size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold text-white tracking-tight">
            Sales<span className="text-brand-300">CRM</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck size={11} className="text-brand-300" />
          <p className="text-[10.5px] font-semibold text-brand-300 uppercase tracking-[0.2em]">Secure Access</p>
        </div>
        <h1 className="text-xl font-bold text-white text-center leading-snug tracking-tight mb-6 max-w-[320px]">
          Run your sales pipeline like a premium team.
        </h1>

        <div className="w-full rounded-2xl bg-white/[0.97] backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(10,12,22,0.6)] p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <h2 className="text-lg font-bold text-ink-900 tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {mode === "signin" ? "Sign in to your account" : "Set up a sales rep account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="label">Full name</label>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-3 py-2.5 text-sm text-ink-900
                    placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-3 py-2.5 text-sm text-ink-900
                    placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
            <button className="btn-primary w-full transition-all hover:brightness-110" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-4 block mx-auto"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="relative text-[11px] text-ink-400 mt-4">© {new Date().getFullYear()} SalesCRM</p>
      </div>
    </div>
  );
}
