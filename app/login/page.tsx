"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";

const previewCards = [
  {
    number: "QT-0012",
    status: "Accepted",
    statusColor: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    total: "₹3,71,700",
    style: { top: "10%", left: "6%", "--tz": "60px", "--rx": "5deg", "--ry": "-10deg" } as React.CSSProperties,
    cls: "float-card-a w-[164px]",
  },
  {
    number: "QT-0009",
    status: "Sent",
    statusColor: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    total: "₹1,18,000",
    style: { top: "13%", right: "6%", "--tz": "24px", "--rx": "-4deg", "--ry": "9deg" } as React.CSSProperties,
    cls: "float-card-b w-[168px] opacity-90",
  },
  {
    number: "QT-0014",
    status: "Draft",
    statusColor: "text-ink-200 bg-white/[0.06] border-white/10",
    total: "₹59,000",
    style: { bottom: "11%", left: "8%", "--tz": "80px", "--rx": "6deg", "--ry": "-5deg" } as React.CSSProperties,
    cls: "float-card-c w-[156px]",
  },
  {
    number: "QT-0007",
    status: "Sent",
    statusColor: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    total: "₹94,300",
    style: { bottom: "14%", right: "7%", "--tz": "40px", "--rx": "-5deg", "--ry": "7deg" } as React.CSSProperties,
    cls: "float-card-b w-[160px] opacity-90",
  },
];

// Fixed (not random) so server and client render identical markup — avoids hydration mismatch.
const particles = [
  { left: "8%", size: 3, delay: "0s", duration: "9s", op: 0.5 },
  { left: "16%", size: 2, delay: "1.4s", duration: "11s", op: 0.35 },
  { left: "27%", size: 2, delay: "3.1s", duration: "8s", op: 0.45 },
  { left: "38%", size: 3, delay: "0.6s", duration: "12s", op: 0.3 },
  { left: "49%", size: 2, delay: "2.2s", duration: "10s", op: 0.4 },
  { left: "61%", size: 3, delay: "4s", duration: "9s", op: 0.5 },
  { left: "72%", size: 2, delay: "1s", duration: "11s", op: 0.35 },
  { left: "83%", size: 2, delay: "2.8s", duration: "8.5s", op: 0.45 },
  { left: "91%", size: 3, delay: "0.2s", duration: "10.5s", op: 0.3 },
  { left: "55%", size: 2, delay: "5s", duration: "9.5s", op: 0.4 },
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
    <div
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="h-dvh w-screen relative flex items-center justify-center overflow-hidden bg-ink-gradient"
      style={{ perspective: "1400px" }}
    >
      {/* Drifting aurora glows — full-bleed, always covers every edge */}
      <div className="absolute inset-0">
        <div
          className="aurora"
          style={{
            width: 620,
            height: 620,
            top: "-14%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(99,102,241,0.38), transparent 70%)",
          }}
        />
        <div
          className="aurora aurora-b"
          style={{
            width: 560,
            height: 560,
            bottom: "-16%",
            right: "-8%",
            background: "radial-gradient(circle, rgba(129,140,248,0.30), transparent 70%)",
          }}
        />
        <div
          className="aurora aurora-c"
          style={{
            width: 460,
            height: 460,
            top: "30%",
            right: "20%",
            background: "radial-gradient(circle, rgba(79,70,229,0.24), transparent 70%)",
          }}
        />
      </div>

      {/* Rising ambient particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                left: p.left,
                bottom: "-10px",
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
                "--op": p.op,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Vignette to keep focus centered */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(6,7,14,0.55) 100%)",
        }}
      />

      {/* 3D scene: grid floor + floating quote cards, tilts toward cursor (desktop only) */}
      <div
        className="hidden lg:block absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg))",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[65%]" style={{ perspective: "700px" }}>
          <div className="grid-floor" />
        </div>

        {previewCards.map((c) => (
          <div
            key={c.number}
            className={`float-card absolute ${c.cls}`}
            style={{ ...c.style, transformStyle: "preserve-3d" }}
          >
            <div className="rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white/90 tracking-wide">{c.number}</span>
                <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border ${c.statusColor}`}>
                  {c.status}
                </span>
              </div>
              <div className="space-y-1.5 mb-2">
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

      {/* Centered column: brand, headline, sign-in card — sized to fit one screen, no scroll */}
      <div className="animate-fade-in-up relative z-10 w-full max-w-[380px] flex flex-col items-center px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <Sparkles size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold text-white tracking-tight">
            Sales<span className="text-brand-300">CRM</span>
          </span>
        </div>

        <p className="text-[10.5px] font-semibold text-brand-300 uppercase tracking-[0.2em] mb-1.5">
          Secure Access
        </p>
        <h1 className="text-xl font-bold text-white text-center leading-snug tracking-tight mb-5 max-w-[300px]">
          Run your sales pipeline like a premium team.
        </h1>

        <div className="w-full rounded-2xl bg-white/[0.95] backdrop-blur-xl border border-white/20 shadow-[0_30px_80px_-20px_rgba(10,12,22,0.6)] p-6">
          <h2 className="text-lg font-bold text-ink-900 tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-[13px] text-gray-500 mt-0.5 mb-4">
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
            {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <button
            className="text-[13px] text-brand-600 hover:text-brand-700 font-medium mt-4 block mx-auto"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="relative text-[11px] text-ink-400 mt-5">© {new Date().getFullYear()} SalesCRM</p>
      </div>
    </div>
  );
}
