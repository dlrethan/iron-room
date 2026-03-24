import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

// ─── Icons ─────────────────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 3.5A1.5 1.5 0 0110.5 2h3A1.5 1.5 0 0115 3.5V5H9V3.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 17l5-6 4 3 5-7 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Invite form ───────────────────────────────────────────────────────────────

function InviteClient() {
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState(null) // null | 'sending' | 'sent' | 'error'
  const [errMsg,  setErrMsg]  = useState('')

  const handleInvite = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('sending')
    setErrMsg('')

    const res = await supabase.functions.invoke('invite-client', {
      body: { clientEmail: trimmed },
    })

    if (res.error || res.data?.error) {
      setErrMsg(res.error?.message ?? res.data?.error ?? 'Something went wrong')
      setStatus('error')
      return
    }

    setStatus('sent')
    setEmail('')
  }

  const reset = () => { setStatus(null); setErrMsg('') }

  // ── Sent state ──────────────────────────────────────────────────────────────
  if (status === 'sent') {
    return (
      <div className="bg-iron-surface border border-iron-border rounded-iron p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-iron-success/10 border border-iron-success/30 flex items-center justify-center text-iron-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-display font-black text-iron-text text-sm uppercase tracking-wider">
              Invite sent
            </span>
            <span className="font-mono text-[12px] text-iron-muted leading-relaxed">
              Your client will receive a styled invite email with a magic link to join IronRoom.
            </span>
            <button
              onClick={reset}
              className="press mt-3 self-start font-display text-[10px] uppercase tracking-widest text-iron-accent border-0 bg-transparent p-0"
            >
              Invite another →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
      <div className="px-4 py-3 border-b border-iron-border bg-iron-bg flex items-center gap-3">
        <span className="text-iron-accent"><IconMail /></span>
        <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">
          Invite a Client
        </h2>
      </div>
      <div className="px-4 py-4">
        <p className="font-mono text-[12px] text-iron-muted leading-relaxed mb-4">
          Enter your client's email. They'll receive a branded invite with a magic link — no password needed.
        </p>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              Client email
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="client@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (status === 'error') reset() }}
              className={[
                'w-full h-[52px] bg-iron-bg border rounded-iron',
                'font-mono text-base text-iron-text px-4',
                'placeholder:text-iron-faint',
                'focus:border-iron-accent focus:shadow-accent-ring',
                status === 'error' ? 'border-iron-danger' : 'border-iron-border',
              ].join(' ')}
            />
            {status === 'error' && (
              <p className="font-mono text-[12px] text-iron-danger">{errMsg}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'sending' || !email.trim()}
            className="press w-full h-[52px] bg-iron-accent text-iron-bg font-display font-black text-sm uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Coming soon card ──────────────────────────────────────────────────────────

function ComingSoonCard({ icon, title, description }) {
  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-iron-accent/10 border border-iron-accent/20 flex items-center justify-center text-iron-accent">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-display font-black text-iron-text text-sm uppercase tracking-wider">
          {title}
        </span>
        <span className="font-mono text-[12px] text-iron-muted leading-relaxed">
          {description}
        </span>
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-accent/60 mt-1">
          Coming soon
        </span>
      </div>
    </div>
  )
}

// ─── Coach Dashboard ───────────────────────────────────────────────────────────

export default function CoachDashboard() {
  const { profile } = useApp()
  const name = profile?.displayName || 'Coach'

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      <header className="px-4 pt-5 pb-4 border-b border-iron-border">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-iron-muted mb-0.5">
          Coach Dashboard
        </p>
        <h1
          className="font-display font-black text-iron-text uppercase leading-none"
          style={{ fontSize: 'clamp(2rem, 9vw, 2.8rem)' }}
        >
          Hey, {name}
        </h1>
      </header>

      <div className="flex flex-col gap-4 p-4">

        {/* Live: invite form */}
        <InviteClient />

        {/* Stubs */}
        <ComingSoonCard
          icon={<IconUsers />}
          title="Client Roster"
          description="See all your clients in one place — their current program day, last session, and active plan."
        />
        <ComingSoonCard
          icon={<IconClipboard />}
          title="Assign Programs"
          description="Push workout and meal plans to clients. Override specific exercise weights per client."
        />
        <ComingSoonCard
          icon={<IconChart />}
          title="Client Progress"
          description="View weight history, PR tracking, and session logs for each of your clients."
        />

      </div>
    </main>
  )
}
