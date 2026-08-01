"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, TrendingUp, FileCheck, ShieldCheck } from "lucide-react";

const previewCards = [
  {
    number: "QT-0012",
    status: "Accepted",
    statusColor: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    total: "₹3,71,700",
    style: { top: "10%", left: "6%", "--tz": "70px", "--rx": "5deg", "--ry": "-10deg" } as React.CSSProperties,
    cls: "float-card-a w-[172px]",
  },
  {
    number: "QT-0009",
    status: "Sent",
    statusColor: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    total: "₹1,18,000",
    style: { top: "42%", right: "2%", "--tz": "30px", "--rx": "-4deg", "--ry": "9deg" } as React.CSSProperties,
    cls: "float-card-b w-[178px] opacity-90",
  },
  {
    number: "QT-0014",
    status: "Draft",
    statusColor: "text-ink-200 bg-white/[0.06] border-white/10",
    total: "₹59,000",
    style: { bottom: "10%", left: "22%", "--tz": "100px", "--rx": "6deg", "--ry": "-5deg" } as React.CSSProperties,
    cls: "float-card-c w-[164px]",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tiltY", `${x * 12}deg`);
    el.style.setProperty("--tiltX", `${-y * 10}deg`);
  };

  const resetTilt = () => {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--tiltY", `0deg`);
    el.style.setProperty("--tiltX", `0deg`);
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
    <div className="min-h-screen flex bg-white">
      {/* Left: brand panel with 3D scene */}
      <div
        ref={sceneRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className="hidden lg:flex lg:w-1/2 bg-ink-gradient relative overflow-hidden flex-col justify-between p-12"
        style={{ perspective: "1400px" }}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.15), transparent 45%)",
          }}
        />

        {/* 3D scene: grid floor + floating quote cards, tilts toward cursor */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg))",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[70%]" style={{ perspective: "700px" }}>
            <div className="grid-floor" />
          </div>

          {previewCards.map((c) => (
            <div
              key={c.number}
              className={`float-card absolute ${c.cls}`}
              style={{ ...c.style, transformStyle: "preserve-3d" }}
            >
              <div className="rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-white/90 tracking-wide">{c.number}</span>
                  <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border ${c.statusColor}`}>
                    {c.status}
                  </span>
                </div>
                <div className="space-y-1.5 mb-2.5">
                  <div className="h-1.5 rounded-full bg-white/[0.12] w-full" />
                  <div className="h-1.5 rounded-full bg-white/[0.08] w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <span className="text-[9.5px] text-white/40 uppercase tracking-wider">Total</span>
                  <span className="text-[12px] font-bold text-white">{c.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

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
              { icon: TrendingUp, text: "Track deals through to closed revenue" },
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50 relative">
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(99,102,241,0.08), transparent 40%)",
          }}
        />
        <div className="card w-full max-w-sm p-8 relative shadow-premium border-gray-100/80">
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
