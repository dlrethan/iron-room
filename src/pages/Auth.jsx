import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

export default function Auth() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Enter your email address.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  const handleGoogle = async () => {
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) setError(err.message)
  }

  // ── Sent state ──────────────────────────────────────────────────────────────

  if (sent) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6">
        <div className="w-full max-w-[360px] text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-iron-accent/10 border border-iron-accent/30 flex items-center justify-center">
              <IconMail />
            </div>
          </div>
          <h1 className="font-display font-black text-iron-text uppercase leading-none mb-3" style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)' }}>
            Check your email
          </h1>
          <p className="font-mono text-[13px] text-iron-muted leading-relaxed mb-6">
            We sent a magic link to{' '}
            <span className="text-iron-accent font-bold">{email}</span>.
            Click it to sign in — no password needed.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="press font-display text-[11px] uppercase tracking-widest text-iron-muted border-0 bg-transparent"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  // ── Sign in form ────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="font-display font-black text-iron-text uppercase leading-none"
            style={{ fontSize: 'clamp(2.8rem, 12vw, 4rem)' }}
          >
            Iron<span className="text-iron-accent">Room</span>
          </h1>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-iron-muted mt-2">
            Track. Progress. Dominate.
          </p>
        </div>

        {/* Email form */}
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              Email
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              className={[
                'w-full h-[52px] bg-iron-surface border rounded-iron',
                'font-mono text-base text-iron-text px-4',
                'placeholder:text-iron-faint',
                'focus:border-iron-accent focus:shadow-accent-ring',
                error ? 'border-iron-danger' : 'border-iron-border',
              ].join(' ')}
            />
            {error && (
              <p className="font-mono text-[12px] text-iron-danger">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-iron-border" />
          <span className="font-display text-[10px] uppercase tracking-widest text-iron-faint">or</span>
          <div className="flex-1 h-px bg-iron-border" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className="press w-full h-[52px] bg-iron-surface border border-iron-border rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-text flex items-center justify-center gap-3"
        >
          <IconGoogle />
          Continue with Google
        </button>

      </div>
    </div>
  )
}
