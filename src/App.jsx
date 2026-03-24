import { useState } from 'react'
import { useApp } from './context/AppContext'
import Auth            from './pages/Auth'
import OnboardingPage  from './pages/Onboarding'
import Dashboard       from './pages/Dashboard'
import WorkoutPage     from './pages/Workout'
import MealsPage       from './pages/Meals'
import ProgressPage    from './pages/Progress'
import PlansPage       from './pages/Plans'
import SettingsPage    from './pages/Settings'
import CoachDashboard  from './pages/CoachDashboard'
import UpdatePassword  from './pages/UpdatePassword'

// ─── Icons (20px — tighter for multi-tab nav) ──────────────────────────────────

function IconHome({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12h6v10"
        stroke={active ? '#0D0D0D' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDumbbell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2"  y="10" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="5"  y="8"  width="2" height="8" rx="1" fill="currentColor" />
      <rect x="17" y="8"  width="2" height="8" rx="1" fill="currentColor" />
      <rect x="19" y="10" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="7"  y="11" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function IconFork() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 2v5a3 3 0 006 0V2M11 7v15M16 2c0 4-1 6-1 9s2 4 2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconChart({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17l5-6 4 3 5-7 4 4"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconClipboard({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5" y="3" width="14" height="18" rx="1"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? 'currentColor' : 'none'}
      />
      <path
        d="M9 3.5A1.5 1.5 0 0110.5 2h3A1.5 1.5 0 0115 3.5V5H9V3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={active ? '#0D0D0D' : 'none'}
      />
      <path
        d="M9 10h6M9 14h4"
        stroke={active ? '#0D0D0D' : 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconGear({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12" cy="12" r="3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? 'currentColor' : 'none'}
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill="none"
      />
    </svg>
  )
}

function IconUsers({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="9" cy="7" r="3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        fill={active ? 'currentColor' : 'none'}
      />
      <path
        d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 20c0-2.761-1.343-5-3-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Tab configs ───────────────────────────────────────────────────────────────

const ATHLETE_TABS = [
  { id: 'home',     label: 'Home',     Icon: IconHome      },
  { id: 'workout',  label: 'Workout',  Icon: IconDumbbell  },
  { id: 'meals',    label: 'Meals',    Icon: IconFork      },
  { id: 'progress', label: 'Progress', Icon: IconChart     },
  { id: 'plans',    label: 'Plans',    Icon: IconClipboard },
  { id: 'settings', label: 'Settings', Icon: IconGear      },
]

const COACH_TABS = [
  { id: 'clients',  label: 'Clients',  Icon: IconUsers     },
  { id: 'plans',    label: 'Plans',    Icon: IconClipboard },
  { id: 'settings', label: 'Settings', Icon: IconGear      },
]

// "both" = athlete tabs + clients tab between Plans and Settings
const BOTH_TABS = [
  { id: 'home',     label: 'Home',     Icon: IconHome      },
  { id: 'workout',  label: 'Workout',  Icon: IconDumbbell  },
  { id: 'meals',    label: 'Meals',    Icon: IconFork      },
  { id: 'progress', label: 'Progress', Icon: IconChart     },
  { id: 'plans',    label: 'Plans',    Icon: IconClipboard },
  { id: 'clients',  label: 'Clients',  Icon: IconUsers     },
  { id: 'settings', label: 'Settings', Icon: IconGear      },
]

function getTabsForRole(role) {
  if (role === 'coach') return COACH_TABS
  if (role === 'both')  return BOTH_TABS
  return ATHLETE_TABS
}

function getDefaultTab(role) {
  return role === 'coach' ? 'clients' : 'home'
}

// ─── Page router ───────────────────────────────────────────────────────────────

function ActivePage({ tab, onNavigate }) {
  switch (tab) {
    case 'home':     return <Dashboard       onNavigate={onNavigate} />
    case 'workout':  return <WorkoutPage     onNavigate={onNavigate} />
    case 'meals':    return <MealsPage       onNavigate={onNavigate} />
    case 'progress': return <ProgressPage    onNavigate={onNavigate} />
    case 'plans':    return <PlansPage       onNavigate={onNavigate} />
    case 'clients':  return <CoachDashboard  onNavigate={onNavigate} />
    case 'settings': return <SettingsPage    onNavigate={onNavigate} />
    default:         return <Dashboard       onNavigate={onNavigate} />
  }
}

// ─── Bottom nav (mobile only) ─────────────────────────────────────────────────

function BottomNav({ tabs, active, onSelect }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-iron-surface border-t border-iron-border z-50 pb-safe md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex flex-col items-center justify-center gap-[2px] flex-1',
                'min-h-[56px] py-2 px-0',
                'bg-transparent border-0 rounded-none press',
                isActive ? 'text-iron-accent' : 'text-iron-muted',
              ].join(' ')}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-iron-accent rounded-b glow-accent" />
              )}
              <span className="flex items-center justify-center w-5 h-5">
                <Icon active={isActive} />
              </span>
              <span className={[
                'font-display text-[9px] uppercase tracking-[0.08em] leading-none',
                isActive ? 'font-bold' : 'font-normal',
              ].join(' ')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Sidebar nav (desktop only) ───────────────────────────────────────────────

function SideNav({ tabs, active, onSelect, profile, isAdmin, previewRole, onPreviewRole }) {
  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 bg-iron-surface border-r border-iron-border"
      style={{ width: '220px' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-iron-border">
        <div className="font-display font-black uppercase leading-none" style={{ fontSize: '1.5rem' }}>
          <span style={{ color: '#F0F0F0' }}>Iron</span>
          <span style={{ color: '#E8FF47' }}>Room</span>
        </div>
        {profile?.displayName && (
          <p className="font-mono text-[11px] text-iron-muted mt-1 truncate">{profile.displayName}</p>
        )}
      </div>

      {/* Nav items */}
      <div className="flex flex-col py-3 flex-1">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex items-center gap-3 px-4 py-3 mx-2 rounded-iron',
                'bg-transparent border-0 press text-left',
                isActive ? 'text-iron-accent bg-iron-accent/8' : 'text-iron-muted hover:text-iron-text',
              ].join(' ')}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-iron-accent rounded-r glow-accent" />
              )}
              <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <Icon active={isActive} />
              </span>
              <span className={[
                'font-display uppercase tracking-[0.08em] text-[11px]',
                isActive ? 'font-bold' : 'font-normal',
              ].join(' ')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Admin role switcher */}
      {isAdmin && (
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: 'rgba(245,158,11,0.25)', background: '#120F00' }}
        >
          <p className="font-display uppercase tracking-widest mb-2" style={{ fontSize: '9px', color: '#F59E0B' }}>
            ⚡ Admin View
          </p>
          <div className="flex gap-1 flex-wrap">
            {['athlete', 'coach', 'both'].map(r => (
              <button
                key={r}
                onClick={() => onPreviewRole(r)}
                className="press border rounded"
                style={{
                  fontSize: '9px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '2px 8px',
                  lineHeight: 1.4,
                  background:  previewRole === r ? '#F59E0B' : 'transparent',
                  color:       previewRole === r ? '#0D0D0D' : '#F59E0B',
                  borderColor: previewRole === r ? '#F59E0B' : 'rgba(245,158,11,0.35)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Admin mode switcher ───────────────────────────────────────────────────────

const PREVIEW_ROLES = ['athlete', 'coach', 'both']

function AdminBar({ previewRole, onSet }) {
  return (
    <div
      className="flex items-center gap-2 px-3 border-b"
      style={{
        height: '36px',
        background: '#120F00',
        borderColor: 'rgba(245,158,11,0.25)',
        flexShrink: 0,
      }}
    >
      <span
        className="font-display uppercase tracking-widest"
        style={{ fontSize: '9px', color: '#F59E0B', letterSpacing: '0.14em' }}
      >
        ⚡ Admin · View:
      </span>
      <div className="flex gap-1 ml-1">
        {PREVIEW_ROLES.map(r => (
          <button
            key={r}
            onClick={() => onSet(r)}
            className="press border rounded"
            style={{
              fontSize: '9px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '2px 8px',
              lineHeight: 1.4,
              background:     previewRole === r ? '#F59E0B' : 'transparent',
              color:          previewRole === r ? '#0D0D0D' : '#F59E0B',
              borderColor:    previewRole === r ? '#F59E0B' : 'rgba(245,158,11,0.35)',
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-iron-bg gap-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-iron-border border-t-iron-accent"
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
      <p className="font-display text-[11px] uppercase tracking-widest text-iron-muted">
        Loading…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { authLoading, user, loading, profile, passwordRecovery } = useApp()

  const isAdmin = profile?.isAdmin ?? false
  const realRole = profile?.role ?? 'athlete'

  const [activeTab,   setActiveTab]   = useState('home')
  const [previewRole, setPreviewRole] = useState(realRole)

  if (authLoading) return <LoadingScreen />
  if (!user)       return <Auth />
  if (passwordRecovery) return <UpdatePassword />
  if (loading)     return <LoadingScreen />
  if (!profile?.onboarded) return <OnboardingPage />

  // Admins use previewRole; everyone else uses their real role
  const effectiveRole = isAdmin ? previewRole : realRole
  const tabs          = getTabsForRole(effectiveRole)

  // Ensure the active tab exists in the current tab set
  const validTab = tabs.some(t => t.id === activeTab) ? activeTab : getDefaultTab(effectiveRole)

  const handlePreviewRole = (r) => {
    setPreviewRole(r)
    setActiveTab(getDefaultTab(r))
  }

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Mobile admin bar (top) */}
      {isAdmin && (
        <div className="md:hidden">
          <AdminBar previewRole={previewRole} onSet={handlePreviewRole} />
        </div>
      )}

      {/* Desktop sidebar */}
      <SideNav
        tabs={tabs}
        active={validTab}
        onSelect={setActiveTab}
        profile={profile}
        isAdmin={isAdmin}
        previewRole={previewRole}
        onPreviewRole={handlePreviewRole}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden">
        <ActivePage tab={validTab} onNavigate={setActiveTab} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav tabs={tabs} active={validTab} onSelect={setActiveTab} />
    </div>
  )
}
