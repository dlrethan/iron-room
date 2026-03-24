import { useApp } from '../context/AppContext'

// ─── Placeholder card ──────────────────────────────────────────────────────────

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

// ─── Icons ─────────────────────────────────────────────────────────────────────

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

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

// ─── Coach Dashboard ───────────────────────────────────────────────────────────

export default function CoachDashboard() {
  const { profile } = useApp()

  const name = profile?.displayName ? profile.displayName : 'Coach'

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* Header */}
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

        {/* Status banner */}
        <div className="bg-iron-accent/10 border border-iron-accent/30 rounded-iron px-4 py-3">
          <p className="font-display font-bold text-iron-accent text-sm uppercase tracking-wider mb-1">
            Coach features in development
          </p>
          <p className="font-mono text-[12px] text-iron-muted leading-relaxed">
            The coach system is being built. Invite clients, assign programs, and track their progress — all coming in the next phase.
          </p>
        </div>

        {/* Feature previews */}
        <ComingSoonCard
          icon={<IconMail />}
          title="Invite Clients"
          description="Send email invites to clients. They sign up and get linked to your account automatically."
        />
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
