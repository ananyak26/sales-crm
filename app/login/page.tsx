"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ShieldCheck, Mail, Lock } from "lucide-react";

// Fixed (non-random) particle configs — avoids SSR/client hydration mismatches
const particles = [
  { left: "8%", size: 3, duration: 9, delay: -1, op: 0.5 },
  { left: "18%", size: 2, duration: 12, delay: -6, op: 0.4 },
  { left: "27%", size: 4, duration: 10, delay: -3, op: 0.55 },
  { left: "39%", size: 2, duration: 14, delay: -8, op: 0.35 },
  { left: "52%", size: 3, duration: 11, delay: -2, op: 0.45 },
  { left: "64%", size: 2, duration: 13, delay: -9, op: 0.4 },
  { left: "73%", size: 4, duration: 9.5, delay: -4, op: 0.5 },
  { left: "83%", size: 3, duration: 12.5, delay: -7, op: 0.4 },
  { left: "91%", size: 2, duration: 10.5, delay: -5, op: 0.45 },
  { left: "46%", size: 3, duration: 15, delay: -10, op: 0.35 },
];

const previewCards = [
  {
    number: "QT-0012",
    status: "Accepted",
    statusColor: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    total: "₹3,71,700",
    style: { top: "9%", left: "5%", "--tz": "70px", "--rx": "5deg", "--ry": "-10deg" } as React.CSSProperties,
    cls: "float-card-a w-[172px]",
    blur: "",
  },
  {
    number: "QT-0009",
    status: "Sent",
    statusColor: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    total: "₹1,18,000",
    style: { top: "12%", right: "5%", "--tz": "30px", "--rx": "-4deg", "--ry": "9deg" } as React.CSSProperties,
    cls: "float-card-b w-[178px] opacity-80",
    blur: "blur-[0.6px]",
  },
  {
    number: "QT-0014",
    status: "Draft",
    statusColor: "text-ink-200 bg-white/[0.06] border-white/10",
    total: "₹59,000",
    style: { bottom: "10%", left: "7%", "--tz": "100px", "--rx": "6deg", "--ry": "-5deg" } as React.CSSProperties,
    cls: "float-card-c w-[164px]",
    blur: "",
  },
  {
    number: "QT-0007",
    status: "Sent",
    statusColor: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    total: "₹94,300",
    style: { bottom: "13%", right: "6%", "--tz": "50px", "--rx": "-5deg", "--ry": "7deg" } as React.CSSProperties,
    cls: "float-card-b w-[168px] opacity-80",
    blur: "blur-[0.6px]",
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
    <div
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className="h-screen relative flex items-center justify-center overflow-hidden bg-ink-gradient px-6 py-4"
      style={{ perspective: "1400px" }}
    >
      {/* Rich mesh gradient — multiple hues for depth, not a flat single-tone wash */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 12%, rgba(99,102,241,0.35), transparent 40%), " +
            "radial-gradient(circle at 88% 85%, rgba(129,140,248,0.28), transparent 45%), " +
            "radial-gradient(circle at 85% 10%, rgba(167,139,250,0.18), transparent 38%), " +
            "radial-gradient(circle at 8% 88%, rgba(56,189,248,0.12), transparent 40%)",
        }}
      />
      <div className="noise-overlay" />
      {/* Vignette for focus toward center */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle at 50% 50%, transparent 35%, rgba(5,6,14,0.55) 100%)" }}
      />

      {/* Drifting aurora blobs — visible ambient motion, multi-hue for richness */}
      <div
        className="aurora-blob w-[460px] h-[460px] bg-brand-500/25"
        style={{ top: "-10%", left: "-8%", animationDelay: "0s" }}
      />
      <div
        className="aurora-blob w-[380px] h-[380px] bg-violet-400/[0.18]"
        style={{ bottom: "-12%", right: "-6%", animationDelay: "-5s" }}
      />
      <div
        className="aurora-blob w-[320px] h-[320px] bg-sky-400/[0.12]"
        style={{ top: "28%", right: "16%", animationDelay: "-9s" }}
      />
      <div
        className="aurora-blob w-[260px] h-[260px] bg-brand-300/[0.14]"
        style={{ bottom: "22%", left: "20%", animationDelay: "-3s" }}
      />

      {/* Rising twinkle particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={
            {
              left: p.left,
              bottom: "-4%",
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--op": p.op,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 3D scene: grid floor + floating quote cards, tilts toward cursor (desktop only) */}
      <div
        className="hidden md:block absolute inset-0"
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
            className={`float-card absolute ${c.cls} ${c.blur}`}
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

      {/* Centered column: brand, headline, sign-in card */}
      <div className="fade-in-up relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
            <span className="absolute inset-0 rounded-lg bg-brand-400 animate-ping opacity-20" />
            <Sparkles size={15} className="relative text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold text-white tracking-tight">
            Sales<span className="text-brand-300">CRM</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          <ShieldCheck size={11} className="text-brand-300" />
          <p className="text-[10.5px] font-semibold text-brand-300 uppercase tracking-[0.2em]">Secure Access</p>
        </div>
        <h1 className="text-xl font-bold text-white text-center leading-snug tracking-tight mb-4 max-w-[320px]">
          Run your sales pipeline like a{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-indigo-200">
            premium team
          </span>
          .
        </h1>

        <div className="glow-ring rounded-2xl w-full">
          <div className="w-full rounded-2xl bg-white/[0.97] backdrop-blur-xl p-6 relative overflow-hidden">
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
                  <input
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
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
              <button
                className="btn-primary btn-shine w-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                disabled={loading}
              >
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
        </div>

        <p className="relative text-[11px] text-ink-400 mt-4">© {new Date().getFullYear()} SalesCRM</p>
      </div>
    </div>
  );
}
