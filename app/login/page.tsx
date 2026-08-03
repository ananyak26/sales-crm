"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight } from "lucide-react";

const stats = [
  { value: "1,000+", label: "quotes tracked" },
  { value: "250+", label: "inventory SKUs" },
  { value: "Real-time", label: "team sync" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);
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

  const handleForgotPassword = async () => {
    setError(null);
    if (!email) {
      setError("Enter your email above, then click “Forgot password?”.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    if (error) setError(error.message);
    else setResetSent(true);
  };

  return (
    <div className="h-dvh w-screen overflow-hidden flex bg-white">
      {/* Left — brand panel with animated blueprint grid */}
      <div className="hidden lg:flex relative w-[54%] shrink-0 overflow-hidden bg-[#0a0b12] flex-col justify-between p-12">
        <div className="blueprint-grid" />
        <div className="scan-beam" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.16), transparent 55%)" }}
        />

        {/* Corner brackets — precision/viewfinder motif */}
        <span className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/15 rounded-tl-sm" />
        <span className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/15 rounded-tr-sm" />
        <span className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/15 rounded-bl-sm" />
        <span className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/15 rounded-br-sm" />

        {/* Abstract traced circuit path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 700"
          preserveAspectRatio="xMidYMid slice"
        >
          <polyline
            className="trace-path"
            points="80,560 220,560 280,480 460,480 520,400 700,400"
            fill="none"
            stroke="rgba(129,140,248,0.55)"
            strokeWidth="1.5"
            pathLength={1}
          />
          <polyline
            className="trace-path"
            style={{ animationDelay: "1.4s" }}
            points="120,150 260,150 320,220 520,220 580,290"
            fill="none"
            stroke="rgba(129,140,248,0.4)"
            strokeWidth="1.5"
            pathLength={1}
          />
          <circle className="reticle-pulse" cx="220" cy="560" r="4" fill="rgba(165,180,252,0.8)" />
          <circle className="reticle-pulse" cx="520" cy="400" r="4" fill="rgba(165,180,252,0.8)" style={{ animationDelay: "0.8s" }} />
          <circle className="reticle-pulse" cx="580" cy="290" r="4" fill="rgba(165,180,252,0.8)" style={{ animationDelay: "1.6s" }} />
        </svg>

        {/* Content */}
        <div className="relative z-10 animate-fade-in-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
              <Sparkles size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Sales<span className="text-brand-300">CRM</span>
            </span>
          </div>
          <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-[0.22em] mt-8 mb-3">
            Sales Operations
          </p>
        </div>

        <div className="relative z-10 max-w-md animate-fade-in-left" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-[2.35rem] leading-[1.15] font-bold text-white tracking-tight">
            Built for teams who close with <em className="text-brand-300 not-italic font-bold">precision.</em>
          </h1>
          <p className="text-[15px] text-white/50 mt-4 leading-relaxed max-w-sm">
            Track deals, quotes, and invoices in one connected workspace — from first contact to
            paid invoice.
          </p>

          <div className="flex items-center gap-6 mt-9 pt-6 border-t border-white/10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/30 animate-fade-in-left" style={{ animationDelay: "0.2s" }}>
          © {new Date().getFullYear()} SalesCRM · Internal demo build
        </p>
      </div>

      {/* Right — sign-in form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-[360px] animate-fade-in-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
              <Sparkles size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold text-ink-900 tracking-tight">
              Sales<span className="text-brand-600">CRM</span>
            </span>
          </div>

          <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-[0.2em] mb-2">
            Secure Access
          </p>
          <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[13.5px] text-gray-500 mt-1.5 mb-7">
            {mode === "signin"
              ? "Sign in with your credentials to continue."
              : "Set up a sales rep account to get started."}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {resetSent && (
              <p className="text-[13px] text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                Reset link sent — check your inbox at {email}.
              </p>
            )}
            {error && <p className="text-[13px] text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

            <button className="btn-primary w-full group" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
              {!loading && (
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <button
            className="text-[13px] text-gray-500 hover:text-ink-700 font-medium mt-6 block mx-auto"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setResetSent(false);
            }}
          >
            {mode === "signin" ? (
              <>
                Need an account? <span className="text-brand-600">Sign up</span>
              </>
            ) : (
              <>
                Already have an account? <span className="text-brand-600">Sign in</span>
              </>
            )}
          </button>

          <p className="text-[11.5px] text-gray-400 text-center mt-10">
            Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}
