import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconEye({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, type, value, onChange, placeholder, error, autoComplete, rightSlot }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">{label}</label>
      <div className="relative">
        <input
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={[
            'w-full h-[52px] bg-iron-surface border rounded-iron',
            'font-mono text-base text-iron-text px-4',
            'placeholder:text-iron-faint',
            'focus:border-iron-accent focus:shadow-accent-ring',
            rightSlot ? 'pr-12' : '',
            error ? 'border-iron-danger' : 'border-iron-border',
          ].join(' ')}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && <p className="font-mono text-[12px] text-iron-danger">{error}</p>}
    </div>
  )
}

// ─── Password field wrapper ───────────────────────────────────────────────────

function PasswordField({ label, value, onChange, error, autoComplete = 'current-password' }) {
  const [show, setShow] = useState(false)
  return (
    <Field
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder="••••••••"
      error={error}
      autoComplete={autoComplete}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="press text-iron-muted border-0 bg-transparent p-1"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <IconEye open={show} />
        </button>
      }
    />
  )
}

// ─── Email sent screen ───────────────────────────────────────────────────────

function EmailSentScreen({ type, email, onBack }) {
  const isReset = type === 'reset'
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6">
      <div className="w-full max-w-[360px] text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-iron-accent/10 border border-iron-accent/30 flex items-center justify-center text-iron-accent">
            <IconMail />
          </div>
        </div>
        <h1
          className="font-display font-black text-iron-text uppercase leading-none mb-3"
          style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)' }}
        >
          {isReset ? 'Check your email' : 'Confirm your email'}
        </h1>
        <p className="font-mono text-[13px] text-iron-muted leading-relaxed mb-2">
          {isReset
            ? 'We sent a password reset link to'
            : 'We sent a confirmation link to'}
        </p>
        <p className="font-mono text-[13px] text-iron-accent font-bold mb-6">{email}</p>
        <p className="font-mono text-[12px] text-iron-muted leading-relaxed mb-8">
          {isReset
            ? 'Click the link in the email to reset your password. It expires in 1 hour.'
            : 'Click the link in the email to activate your account, then sign in.'}
        </p>
        <button
          onClick={onBack}
          className="press font-display text-[11px] uppercase tracking-widest text-iron-muted border-0 bg-transparent"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

export default function Auth() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')

  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [emailSent, setEmailSent] = useState(null) // null | 'confirm' | 'reset'

  const clearErrors = () => setErrors({})

  const switchMode = (next) => {
    setMode(next)
    setPassword('')
    setConfirm('')
    clearErrors()
  }

  // ── Sign in ──────────────────────────────────────────────────────────────────

  const handleSignIn = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!email.trim())    errs.email    = 'Required'
    if (!password)        errs.password = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    clearErrors()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (err) {
      if (err.message.toLowerCase().includes('invalid')) {
        setErrors({ form: 'Incorrect email or password.' })
      } else if (err.message.toLowerCase().includes('confirm')) {
        setErrors({ form: 'Please confirm your email before signing in.' })
      } else {
        setErrors({ form: err.message })
      }
    }
  }

  // ── Sign up ──────────────────────────────────────────────────────────────────

  const handleSignUp = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!email.trim())              errs.email    = 'Required'
    if (password.length < 8)        errs.password = 'At least 8 characters'
    if (confirm !== password)       errs.confirm  = "Passwords don't match"
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    clearErrors()
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)
    if (err) {
      setErrors({ form: err.message })
    } else {
      setEmailSent('confirm')
    }
  }

  // ── Forgot password ───────────────────────────────────────────────────────────

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setErrors({ email: 'Required' }); return }

    setLoading(true)
    clearErrors()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}?reset=1`,
    })
    setLoading(false)
    if (err) {
      setErrors({ form: err.message })
    } else {
      setEmailSent('reset')
    }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    clearErrors()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) setErrors({ form: err.message })
  }

  // ── Email sent screen ─────────────────────────────────────────────────────────

  if (emailSent) {
    return (
      <EmailSentScreen
        type={emailSent}
        email={email}
        onBack={() => { setEmailSent(null); switchMode('signin') }}
      />
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="text-center mb-8">
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

        {/* Mode tabs */}
        {mode !== 'forgot' && (
          <div className="flex mb-6 border-b border-iron-border">
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={[
                  'press flex-1 py-2 font-display text-[11px] uppercase tracking-widest border-0 bg-transparent',
                  'border-b-2 -mb-px transition-colors',
                  mode === m
                    ? 'text-iron-accent border-iron-accent'
                    : 'text-iron-muted border-transparent',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Sign In form ── */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); clearErrors() }}
              error={errors.email}
            />
            <PasswordField
              label="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearErrors() }}
              error={errors.password}
              autoComplete="current-password"
            />
            {errors.form && (
              <p className="font-mono text-[12px] text-iron-danger">{errors.form}</p>
            )}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="press font-display text-[10px] uppercase tracking-widest text-iron-muted border-0 bg-transparent p-0"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Sign Up form ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); clearErrors() }}
              error={errors.email}
            />
            <PasswordField
              label="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearErrors() }}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); clearErrors() }}
              error={errors.confirm}
              autoComplete="new-password"
            />
            {errors.form && (
              <p className="font-mono text-[12px] text-iron-danger">{errors.form}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* ── Forgot Password form ── */}
        {mode === 'forgot' && (
          <>
            <div className="mb-6">
              <h2 className="font-display font-black text-iron-text uppercase text-2xl leading-none mb-1">
                Reset Password
              </h2>
              <p className="font-mono text-[12px] text-iron-muted">
                Enter your email and we'll send a reset link.
              </p>
            </div>
            <form onSubmit={handleForgot} className="flex flex-col gap-3">
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearErrors() }}
                error={errors.email}
              />
              {errors.form && (
                <p className="font-mono text-[12px] text-iron-danger">{errors.form}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="press font-display text-[11px] uppercase tracking-widest text-iron-muted border-0 bg-transparent py-2"
              >
                ← Back to sign in
              </button>
            </form>
          </>
        )}

        {/* Divider + Google (not on forgot) */}
        {mode !== 'forgot' && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-iron-border" />
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-faint">or</span>
              <div className="flex-1 h-px bg-iron-border" />
            </div>
            <button
              onClick={handleGoogle}
              className="press w-full h-[52px] bg-iron-surface border border-iron-border rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-text flex items-center justify-center gap-3"
            >
              <IconGoogle />
              Continue with Google
            </button>
          </>
        )}

      </div>
    </div>
  )
}
