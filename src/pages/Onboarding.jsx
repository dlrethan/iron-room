import { useState } from 'react'
import { useApp } from '../context/AppContext'

// ─── Role option card ──────────────────────────────────────────────────────────

function RoleCard({ id, label, description, icon, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={[
        'press w-full text-left flex items-start gap-4 p-4 rounded-iron border transition-colors',
        selected
          ? 'border-iron-accent bg-iron-accent/10'
          : 'border-iron-border bg-iron-surface',
      ].join(' ')}
    >
      {/* Icon circle */}
      <div className={[
        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border',
        selected ? 'border-iron-accent/50 bg-iron-accent/15' : 'border-iron-border bg-iron-bg',
      ].join(' ')}>
        {icon}
      </div>

      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={[
          'font-display font-black text-base uppercase tracking-wider',
          selected ? 'text-iron-accent' : 'text-iron-text',
        ].join(' ')}>
          {label}
        </span>
        <span className="font-mono text-[12px] text-iron-muted leading-snug">
          {description}
        </span>
      </div>

      {/* Selection indicator */}
      <div className={[
        'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
        selected ? 'border-iron-accent bg-iron-accent' : 'border-iron-border',
      ].join(' ')}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5L19 7" stroke="#0D0D0D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}

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
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Onboarding page ───────────────────────────────────────────────────────────

const ROLES = [
  {
    id:          'athlete',
    label:       'Athlete',
    description: 'Track your own workouts, nutrition, and progress',
    icon:        <IconDumbbell />,
  },
  {
    id:          'coach',
    label:       'Coach',
    description: 'Manage clients, assign programs, and track their progress',
    icon:        <IconUsers />,
  },
  {
    id:          'both',
    label:       'Both',
    description: 'Train yourself and coach clients at the same time',
    icon:        <IconStar />,
  },
]

export default function Onboarding() {
  const { saveProfile } = useApp()

  const [name,    setName]    = useState('')
  const [role,    setRole]    = useState('athlete')
  const [saving,  setSaving]  = useState(false)
  const [nameErr, setNameErr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameErr('Enter your name to continue.'); return }

    setSaving(true)
    await saveProfile({ displayName: trimmed, role, onboarded: true })
    // AppContext will re-render App with profile.onboarded = true → main app loads
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg px-6 overflow-y-auto">
      <div className="w-full max-w-[360px] py-10">

        {/* Logo */}
        <div className="text-center mb-8">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              Your name
            </label>
            <input
              type="text"
              autoComplete="given-name"
              placeholder="First name or nickname"
              value={name}
              onChange={e => { setName(e.target.value); setNameErr('') }}
              className={[
                'w-full h-[52px] bg-iron-surface border rounded-iron',
                'font-mono text-base text-iron-text px-4',
                'placeholder:text-iron-faint',
                'focus:border-iron-accent focus:shadow-accent-ring',
                nameErr ? 'border-iron-danger' : 'border-iron-border',
              ].join(' ')}
            />
            {nameErr && (
              <p className="font-mono text-[12px] text-iron-danger">{nameErr}</p>
            )}
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              I am a…
            </span>
            <div className="flex flex-col gap-2">
              {ROLES.map(r => (
                <RoleCard
                  key={r.id}
                  id={r.id}
                  label={r.label}
                  description={r.description}
                  icon={r.icon}
                  selected={role === r.id}
                  onSelect={setRole}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
          >
            {saving ? 'Setting up…' : 'Get Started'}
          </button>

        </form>
      </div>
    </div>
  )
}
