import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

// ─── Icons ─────────────────────────────────────────────────────────────────────

function IconDumbbell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2"  y="10" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="5"  y="8"  width="2" height="8" rx="1" fill="currentColor" />
      <rect x="17" y="8"  width="2" height="8" rx="1" fill="currentColor" />
      <rect x="19" y="10" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="7"  y="11" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 20c0-2.761-1.343-5-3-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
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

// ─── Role card ─────────────────────────────────────────────────────────────────

function RoleCard({ id, label, description, icon, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={[
        'press w-full text-left flex items-start gap-4 p-4 rounded-iron border transition-colors',
        selected ? 'border-iron-accent bg-iron-accent/10' : 'border-iron-border bg-iron-surface',
      ].join(' ')}
    >
      <div className={[
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border',
        selected ? 'border-iron-accent/50 bg-iron-accent/15' : 'border-iron-border bg-iron-bg',
      ].join(' ')}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={['font-display font-black text-base uppercase tracking-wider', selected ? 'text-iron-accent' : 'text-iron-text'].join(' ')}>
          {label}
        </span>
        <span className="font-mono text-[12px] text-iron-muted leading-snug">{description}</span>
      </div>
      <div className={['flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5', selected ? 'border-iron-accent bg-iron-accent' : 'border-iron-border'].join(' ')}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="#0D0D0D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}

// ─── Password field ────────────────────────────────────────────────────────────

function PasswordField({ label, value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className={[
            'w-full h-[52px] bg-iron-surface border rounded-iron pr-12',
            'font-mono text-base text-iron-text px-4',
            'placeholder:text-iron-faint focus:border-iron-accent',
            error ? 'border-iron-danger' : 'border-iron-border',
          ].join(' ')}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="press absolute right-3 top-1/2 -translate-y-1/2 text-iron-muted border-0 bg-transparent p-1"
        >
          <IconEye open={show} />
        </button>
      </div>
      {error && <p className="font-mono text-[12px] text-iron-danger">{error}</p>}
    </div>
  )
}

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'rounded-full transition-all',
            i === current
              ? 'w-6 h-1.5 bg-iron-accent'
              : i < current
              ? 'w-1.5 h-1.5 bg-iron-accent/50'
              : 'w-1.5 h-1.5 bg-iron-border',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ─── Roles config ─────────────────────────────────────────────────────────────

const ROLES = [
  { id: 'athlete', label: 'Athlete',  description: 'Track your own workouts, nutrition, and progress',          icon: <IconDumbbell /> },
  { id: 'coach',   label: 'Coach',    description: 'Manage clients, assign programs, and track their progress', icon: <IconUsers />    },
  { id: 'both',    label: 'Both',     description: 'Train yourself and coach clients at the same time',          icon: <IconStar />     },
]

// ─── Onboarding ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { user, saveProfile } = useApp()

  // Determine if this user signed in via Google (no password needed)
  const isGoogleUser = user?.app_metadata?.provider === 'google' ||
    user?.identities?.some(i => i.provider === 'google')

  const totalSteps = isGoogleUser ? 1 : 2
  const [step, setStep]       = useState(0) // 0 = profile, 1 = password
  const [name, setName]       = useState('')
  const [role, setRole]       = useState('athlete')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  // ── Step 0: name + role ────────────────────────────────────────────────────

  const handleProfileNext = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setErrors({ name: 'Enter your name to continue.' }); return }

    if (isGoogleUser) {
      // Google users skip password step — save directly
      finalize(trimmed, role, null)
    } else {
      setErrors({})
      setStep(1)
    }
  }

  // ── Step 1: password ───────────────────────────────────────────────────────

  const handlePasswordNext = async (e) => {
    e.preventDefault()
    const errs = {}
    if (password.length < 8) errs.password = 'At least 8 characters'
    if (confirm !== password) errs.confirm  = 'Passwords don't match'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    finalize(name.trim(), role, password)
  }

  const handleSkipPassword = () => {
    finalize(name.trim(), role, null)
  }

  // ── Finalize ───────────────────────────────────────────────────────────────

  const finalize = async (displayName, selectedRole, newPassword) => {
    setSaving(true)
    if (newPassword) {
      await supabase.auth.updateUser({ password: newPassword })
    }
    await saveProfile({ displayName, role: selectedRole, onboarded: true })
    // AppContext re-renders with profile.onboarded = true
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6 overflow-y-auto">
      <div className="w-full max-w-[360px] py-10">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1
            className="font-display font-black text-iron-text uppercase leading-none"
            style={{ fontSize: 'clamp(2.4rem, 10vw, 3.2rem)' }}
          >
            Iron<span className="text-iron-accent">Room</span>
          </h1>
          <p className="font-display text-[11px] uppercase tracking-[0.2em] text-iron-muted mt-2">
            Let's set up your profile
          </p>
        </div>

        {totalSteps > 1 && <StepDots current={step} total={totalSteps} />}

        {/* ── Step 0: Name + Role ── */}
        {step === 0 && (
          <form onSubmit={handleProfileNext} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">Your name</label>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="First name or nickname"
                value={name}
                onChange={e => { setName(e.target.value); setErrors({}) }}
                className={[
                  'w-full h-[52px] bg-iron-surface border rounded-iron',
                  'font-mono text-base text-iron-text px-4',
                  'placeholder:text-iron-faint focus:border-iron-accent',
                  errors.name ? 'border-iron-danger' : 'border-iron-border',
                ].join(' ')}
              />
              {errors.name && <p className="font-mono text-[12px] text-iron-danger">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">I am a…</span>
              <div className="flex flex-col gap-2">
                {ROLES.map(r => (
                  <RoleCard key={r.id} {...r} selected={role === r.id} onSelect={setRole} />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
            >
              {isGoogleUser
                ? (saving ? 'Setting up…' : 'Get Started')
                : 'Next →'}
            </button>
          </form>
        )}

        {/* ── Step 1: Password ── */}
        {step === 1 && (
          <form onSubmit={handlePasswordNext} className="flex flex-col gap-4">
            <div className="mb-2">
              <h2 className="font-display font-black text-iron-text uppercase text-2xl leading-none mb-1">
                Set a password
              </h2>
              <p className="font-mono text-[12px] text-iron-muted leading-relaxed">
                You'll use this to sign back in to IronRoom.
              </p>
            </div>

            <PasswordField
              label="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors({}) }}
              error={errors.password}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors({}) }}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={saving}
              className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50 mt-1"
            >
              {saving ? 'Setting up…' : 'Get Started'}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="press font-display text-[10px] uppercase tracking-widest text-iron-muted border-0 bg-transparent p-0"
              >
                ← Back
              </button>
              <div className="flex-1 h-px bg-iron-border" />
              <button
                type="button"
                onClick={handleSkipPassword}
                disabled={saving}
                className="press font-display text-[10px] uppercase tracking-widest text-iron-muted border-0 bg-transparent p-0 disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>

            <p className="font-mono text-[11px] text-iron-faint text-center leading-relaxed">
              Skipping means you'll need to use Google sign-in or request a new invite link to log back in.
            </p>
          </form>
        )}

      </div>
    </div>
  )
}
