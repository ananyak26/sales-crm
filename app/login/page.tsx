'use client'
// app/login/page.tsx
// Username/password login. Under the hood it looks up the real (fake)
// email tied to that username via the get_email_for_username() RPC, then
// signs in normally through Supabase Auth.
//
// NOTE: this assumes a browser Supabase client at '@/lib/supabase/client'
// (createClient() returning a client-side client). Adjust the import to
// match whatever you already use in your existing login page, and copy
// over any styling/branding (logo, colors) from your current version —
// this is functionally complete but visually plain.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      {/* Ambient glow behind everything */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(99,102,241,0.22)_0%,transparent_70%)]" />

      {/* 3D animated grid — ceiling */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 [perspective:500px] [transform-style:preserve-3d]">
        <div className="grid-plane grid-plane-top" />
      </div>
      {/* 3D animated grid — floor */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 [perspective:500px] [transform-style:preserve-3d]">
        <div className="grid-plane grid-plane-bottom" />
      </div>

      {/* Horizon glow line */}
      <div className="horizon-line pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />

      {/* Vignette so the grid fades toward the edges instead of hard-cutting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_50%,transparent_35%,rgba(10,12,22,0.9)_100%)]" />

      {/* Floating orbs for extra depth */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-500/20 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-brand-400/20 blur-[90px]" />

      <div className="relative w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-premium backdrop-blur-xl">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src="/kaizen-logo.png" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-300">Sales CRM</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-300">Use the username and password your manager gave you.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Username</label>
            <input
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-400 outline-none transition focus:border-brand-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-400 outline-none transition focus:border-brand-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/15"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .grid-plane {
          position: absolute;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: linear-gradient(rgba(129, 140, 248, 0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 140, 248, 0.35) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .grid-plane-top {
          top: 0;
          transform-origin: bottom;
          transform: rotateX(-75deg);
          animation: grid-scroll-up 5s linear infinite;
        }
        .grid-plane-bottom {
          bottom: 0;
          transform-origin: top;
          transform: rotateX(75deg);
          animation: grid-scroll-down 5s linear infinite;
        }
        @keyframes grid-scroll-down {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 56px;
          }
        }
        @keyframes grid-scroll-up {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 -56px;
          }
        }
        .horizon-line {
          transform-origin: center;
          animation: horizon-pulse 4s ease-in-out infinite;
        }
        @keyframes horizon-pulse {
          0%,
          100% {
            opacity: 0.45;
            transform: translateY(-50%) scaleX(0.55);
            box-shadow: 0 0 10px 2px rgba(129, 140, 248, 0.3);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scaleX(1);
            box-shadow: 0 0 44px 10px rgba(129, 140, 248, 0.85);
          }
        }
      `}</style>
    </div>
  )
}
