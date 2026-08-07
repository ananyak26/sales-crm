'use client'
// app/login/page.tsx
// Username/password login. Under the hood it looks up the real (fake)
// email tied to that username via the get_email_for_username() RPC, then
// signs in normally through Supabase Auth.
//
// Visual design is grounded in the actual brand (Kaizen Laser &
// Automation — see /public/kaizen-logo.png): a precision-engineering,
// laser-cutting motif, rendered in a single blue accent (main + light
// tint). The signature element is a technical drawing of a mounting
// bracket "cut" by a traveling laser beam on a loop.
//
// This version adds real depth: a receding 3D grid floor (Tron-style),
// drifting glow particles, and mouse-driven parallax across background
// layers + a subtle 3D tilt on the card itself. Everything is pure
// CSS/SVG — no WebGL/three.js dependency — and respects
// prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Oswald, JetBrains_Mono } from 'next/font/google'

const display = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

// Deterministic "random" particle layout — avoids Math.random() so the
// server-rendered markup matches the client on hydration.
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 4),
  duration: 14 + ((i * 5) % 12),
  delay: -((i * 2.3) % 18),
  peak: 0.18 + (i % 5) * 0.06,
}))

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mouse-driven parallax tilt, normalized to -1..1 on each axis.
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion.current) return
    const { innerWidth, innerHeight } = window
    setTilt({
      x: (e.clientX / innerWidth - 0.5) * 2,
      y: (e.clientY / innerHeight - 0.5) * 2,
    })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: email, error: lookupError } = await supabase.rpc(
      'get_email_for_username',
      { p_username: username.trim().toLowerCase() }
    )

    if (lookupError || !email) {
      setLoading(false)
      setError('Invalid username or password')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Invalid username or password')
      return
    }

    router.push('/deals')
    router.refresh()
  }

  // Diagonal section-hatching inside the bracket drawing, generated rather
  // than hand-placed — standard engineering-drawing convention for a cut
  // cross-section.
  const hatchLines = Array.from({ length: 20 }, (_, i) => {
    const offset = i * 24 - 140
    return { x1: 70 + offset, y1: 90, x2: 70 + offset - 330, y2: 420 }
  })

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0c0e] px-4 py-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base ambient glow — drifts opposite the cursor, furthest "depth" */}
      <div
        className="kz-layer pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(99,102,241,0.10)_0%,transparent_70%)]"
        style={{ transform: `translate3d(${tilt.x * -8}px, ${tilt.y * -6}px, 0)` }}
      />

      {/* Secondary roaming glow orbs, different phase/speed for parallax depth */}
      <div
        className="kz-layer kz-orb-drift-1 pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 0)`,
        }}
      />
      <div
        className="kz-layer kz-orb-drift-2 pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
          transform: `translate3d(${tilt.x * -6}px, ${tilt.y * -4}px, 0)`,
        }}
      />

      {/* Faint static machined-steel grid overlay */}
      <div className="kz-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />

      {/* Receding 3D grid floor — Tron-style perspective, scrolls toward viewer */}
      <div
        className="kz-layer pointer-events-none absolute inset-x-0 bottom-0 h-[60%] overflow-hidden"
        style={{
          perspective: '600px',
          transform: `translate3d(${tilt.x * -16}px, ${tilt.y * -8}px, 0)`,
        }}
        aria-hidden="true"
      >
        <div className="kz-floor absolute inset-x-[-50%] bottom-[-10%] h-[140%]" />
      </div>

      {/* Floating glow particles drifting upward through the scene */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="kz-particle absolute rounded-full"
            style={
              {
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--kz-peak': p.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Vignette so the grid/art/particles fade toward the edges */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_65%_at_50%_50%,transparent_30%,rgba(11,12,14,0.94)_100%)]" />

      {/* Signature element: a laser-cut mounting-bracket drawing, traced
          on a loop by a moving beam + cutting head. Sits at a "mid" depth. */}
      <svg
        className="kz-layer pointer-events-none absolute -bottom-24 -right-20 h-[520px] w-[520px] opacity-[0.4] md:opacity-[0.55]"
        style={{ transform: `translate3d(${tilt.x * -10}px, ${tilt.y * -6}px, 0)` }}
        viewBox="0 0 480 480"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="bracketClip">
            <path d="M70,100 L300,100 L300,190 L230,190 L230,400 L70,400 Z" />
          </clipPath>
        </defs>

        {/* section hatching (material cross-section, engineering-drawing convention) */}
        <g clipPath="url(#bracketClip)" stroke="#6366f1" strokeWidth="1" opacity="0.1">
          {hatchLines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>

        {/* base outline, always faintly visible */}
        <path
          d="M70,100 L300,100 L300,190 L230,190 L230,400 L70,400 Z"
          stroke="#a5aeff"
          strokeWidth="1.25"
          opacity="0.28"
        />

        {/* the same outline, "cut" by the beam on a loop */}
        <path
          id="kzBracketPath"
          className="kz-trace"
          d="M70,100 L300,100 L300,190 L230,190 L230,400 L70,400 Z"
          stroke="#6366f1"
          strokeWidth="2"
          pathLength={1}
          strokeLinecap="round"
        />

        {/* mounting holes */}
        {[
          [120, 140],
          [255, 140],
          [120, 250],
          [120, 350],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" stroke="#a5aeff" strokeWidth="1" opacity="0.3" />
        ))}

        {/* dimension line */}
        <line x1="70" y1="70" x2="300" y2="70" stroke="#a5aeff" strokeWidth="1" opacity="0.28" />
        <line x1="70" y1="64" x2="70" y2="76" stroke="#a5aeff" strokeWidth="1" opacity="0.28" />
        <line x1="300" y1="64" x2="300" y2="76" stroke="#a5aeff" strokeWidth="1" opacity="0.28" />
        <text x="164" y="56" fill="#a5aeff" opacity="0.35" fontSize="11" fontFamily="monospace">
          230mm
        </text>

        {/* registration / alignment crosshairs, a real laser-cutting convention */}
        <g stroke="#6366f1" strokeWidth="1" opacity="0.3">
          <line x1="382" y1="76" x2="382" y2="100" />
          <line x1="370" y1="88" x2="394" y2="88" />
          <circle cx="382" cy="88" r="7" />
        </g>

        {/* the moving cutting head, following the same path */}
        <circle r="3.2" fill="#6366f1">
          <animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1;1" keyTimes="0;0.5;0.78;1" calcMode="linear">
            <mpath href="#kzBracketPath" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0;0"
            keyTimes="0;0.08;0.78;0.9;1"
            dur="9s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="8" fill="#6366f1" opacity="0.25">
          <animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1;1" keyTimes="0;0.5;0.78;1" calcMode="linear">
            <mpath href="#kzBracketPath" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.25;0.25;0;0"
            keyTimes="0;0.08;0.78;0.9;1"
            dur="9s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <div
        className="kz-layer relative w-full max-w-sm"
        style={{ transform: `translate3d(${tilt.x * 4}px, ${tilt.y * 3}px, 0)` }}
      >
        {/* control-panel readout header, above the card */}
        <div
          className={`${mono.className} kz-fade-left mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/30`}
        >
          <span>Kaizen Ops / Sales Console</span>
          <span className="flex items-center gap-1.5">
            <span className="kz-pulse h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
            secure link
          </span>
        </div>

        {/* Card itself tilts in 3D toward the cursor, on top of its fade-in */}
        <div
          className="kz-fade-up kz-card-tilt relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-8 shadow-[0_2px_6px_rgba(0,0,0,0.35),0_28px_64px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          style={{
            transform: `perspective(1000px) rotateY(${tilt.x * 3}deg) rotateX(${-tilt.y * 3}deg)`,
          }}
        >
          {/* corner registration ticks, echoing the laser-cutting motif */}
          <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 rounded-tl-2xl border-l border-t border-[#6366f1]/50" />
          <span className="pointer-events-none absolute -right-px -top-px h-3 w-3 rounded-tr-2xl border-r border-t border-[#6366f1]/50" />
          <span className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 rounded-bl-2xl border-b border-l border-[#6366f1]/50" />
          <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 rounded-br-2xl border-b border-r border-[#6366f1]/50" />

          {/* top accent line, like a machine status strip */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/70 to-transparent" />

          <div className="mb-7 flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/95 p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              <img
                src="/kaizen-logo.png"
                alt="Kaizen Laser and Automation"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p
                className={`${display.className} text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6366f1]`}
              >
                Sales Console
              </p>
              <p className="mt-0.5 text-[11px] text-white/35">Kaizen Laser &amp; Automation</p>
            </div>
          </div>

          <h1 className={`${display.className} text-2xl font-semibold tracking-tight text-white`}>
            Welcome back
          </h1>
          <p className="mb-6 mt-1.5 text-sm leading-relaxed text-white/45">
            Use the username and password your manager gave you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}
            <div>
              <label className={`${mono.className} mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/40`}>
                Username
              </label>
              <input
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#6366f1]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#6366f1]/15"
              />
            </div>
            <div>
              <label className={`${mono.className} mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-white/40`}>
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#6366f1]/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#6366f1]/15"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-b from-[#818cf8] to-[#4f46e5] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_20px_-6px_rgba(99,102,241,0.5)] transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p
          className={`${mono.className} kz-fade-up mt-5 text-center text-[10px] uppercase tracking-[0.18em] text-white/20`}
        >
          Precision leads · precision quotes · precision close
        </p>
      </div>

      <style jsx>{`
        .kz-layer {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .kz-card-tilt {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .kz-grid {
          background-image: linear-gradient(rgba(165, 174, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165, 174, 255, 0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        /* Receding perspective floor: a grid rotated back in 3D space that
           scrolls its own background-position to feel like it's moving
           toward the viewer, Tron-style. */
        .kz-floor {
          background-image: linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px);
          background-size: 64px 64px;
          transform: rotateX(75deg);
          transform-origin: bottom center;
          opacity: 0.45;
          -webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);
          mask-image: linear-gradient(to top, black 0%, transparent 80%);
          animation: kz-floor-scroll 4s linear infinite;
        }
        @keyframes kz-floor-scroll {
          from {
            background-position: 0px 0px, 0px 0px;
          }
          to {
            background-position: 0px 64px, 0px 64px;
          }
        }
        .kz-orb-drift-1 {
          animation: kz-orb-drift-1-anim 22s ease-in-out infinite;
        }
        @keyframes kz-orb-drift-1-anim {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, -30px);
          }
        }
        .kz-orb-drift-2 {
          animation: kz-orb-drift-2-anim 26s ease-in-out infinite;
        }
        @keyframes kz-orb-drift-2-anim {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-30px, 24px);
          }
        }
        .kz-particle {
          bottom: -5%;
          background: radial-gradient(circle, rgba(165, 174, 255, 0.9) 0%, rgba(99, 102, 241, 0.5) 55%, transparent 75%);
          box-shadow: 0 0 6px 1px rgba(99, 102, 241, 0.35);
          opacity: 0;
          animation-name: kz-particle-float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes kz-particle-float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--kz-peak, 0.3);
          }
          90% {
            opacity: var(--kz-peak, 0.3);
          }
          100% {
            transform: translateY(-105vh) translateX(16px);
            opacity: 0;
          }
        }
        .kz-trace {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: kz-trace-draw 9s ease-in-out infinite;
        }
        @keyframes kz-trace-draw {
          0% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          78% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        .kz-pulse {
          animation: kz-pulse-anim 2.6s ease-in-out infinite;
        }
        @keyframes kz-pulse-anim {
          0%,
          100% {
            opacity: 0.35;
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 6px 2px rgba(99, 102, 241, 0.5);
          }
        }
        .kz-fade-up {
          animation: kz-fade-up-anim 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes kz-fade-up-anim {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .kz-fade-left {
          animation: kz-fade-left-anim 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes kz-fade-left-anim {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .kz-trace,
          .kz-pulse,
          .kz-fade-up,
          .kz-fade-left,
          .kz-floor,
          .kz-orb-drift-1,
          .kz-orb-drift-2,
          .kz-particle {
            animation: none !important;
          }
          .kz-layer,
          .kz-card-tilt {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
