import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import * as db from '../lib/db'

// ─── Icons ─────────────────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className="font-display text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border"
      style={{
        color:       isActive ? '#E8FF47' : '#888',
        borderColor: isActive ? 'rgba(232,255,71,0.3)' : 'rgba(255,255,255,0.1)',
        background:  isActive ? 'rgba(232,255,71,0.06)' : 'transparent',
      }}
    >
      {isActive ? 'Active' : 'Pending'}
    </span>
  )
}

// ─── Invite form ───────────────────────────────────────────────────────────────

function InviteClient({ onInvited }) {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'
  const [errMsg, setErrMsg] = useState('')

  const handleInvite = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('sending')
    setErrMsg('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await supabase.functions.invoke('invite-client', {
      body: { clientEmail: trimmed },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })

    if (res.error || res.data?.error) {
      setErrMsg(res.error?.message ?? res.data?.error ?? 'Something went wrong')
      setStatus('error')
      return
    }

    setStatus('sent')
    setEmail('')
    onInvited?.()
  }

  const reset = () => { setStatus(null); setErrMsg('') }

  if (status === 'sent') {
    return (
      <div className="flex items-start gap-3 p-4 bg-iron-success/5 border border-iron-success/20 rounded-iron">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-iron-success/10 border border-iron-success/30 flex items-center justify-center text-iron-success mt-0.5">
          <IconCheck />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-display font-black text-iron-text text-sm uppercase tracking-wider">Invite sent</span>
          <span className="font-mono text-[12px] text-iron-muted">Client will receive a magic link email.</span>
          <button onClick={reset} className="press mt-2 self-start font-display text-[10px] uppercase tracking-widest text-iron-accent border-0 bg-transparent p-0">
            Invite another →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
      <div className="px-4 py-3 border-b border-iron-border bg-iron-bg flex items-center gap-2">
        <span className="text-iron-accent"><IconMail /></span>
        <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">Invite a Client</h2>
      </div>
      <div className="px-4 py-4">
        <form onSubmit={handleInvite} className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="client@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (status === 'error') reset() }}
              className={[
                'w-full h-[44px] bg-iron-bg border rounded-iron',
                'font-mono text-sm text-iron-text px-3',
                'placeholder:text-iron-faint',
                'focus:border-iron-accent',
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
            className="press h-[44px] px-4 bg-iron-accent text-iron-bg font-display font-black text-xs uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50 flex-shrink-0"
          >
            {status === 'sending' ? '…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Weight override row ───────────────────────────────────────────────────────

function WeightOverrideRow({ clientId, override, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await db.deleteWeightOverride({ clientId, exerciseName: override.exerciseName })
    onDelete(override.exerciseName)
  }

  return (
    <div className="flex items-center gap-2 py-2 border-b border-iron-border last:border-0">
      <span className="font-mono text-sm text-iron-text flex-1 truncate">{override.exerciseName}</span>
      <span className="font-mono text-sm text-iron-accent font-bold flex-shrink-0">{override.weightLbs} lbs</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="press text-iron-muted hover:text-iron-danger border-0 bg-transparent p-1 flex-shrink-0 disabled:opacity-40"
        aria-label={`Remove override for ${override.exerciseName}`}
      >
        <IconTrash />
      </button>
    </div>
  )
}

// ─── Add weight override form ─────────────────────────────────────────────────

function AddWeightOverride({ clientId, onAdded }) {
  const [exercise, setExercise] = useState('')
  const [weight, setWeight]     = useState('')
  const [saving, setSaving]     = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = exercise.trim()
    const lbs  = parseFloat(weight)
    if (!name || isNaN(lbs) || lbs <= 0) return
    setSaving(true)
    await db.upsertWeightOverride({ clientId, exerciseName: name, weightLbs: lbs })
    onAdded({ exerciseName: name, weightLbs: lbs })
    setExercise('')
    setWeight('')
    setSaving(false)
  }

  return (
    <form onSubmit={handleAdd} className="flex gap-2 mt-3">
      <input
        type="text"
        placeholder="Exercise name"
        value={exercise}
        onChange={e => setExercise(e.target.value)}
        className="flex-1 h-[38px] bg-iron-bg border border-iron-border rounded-iron font-mono text-sm text-iron-text px-3 placeholder:text-iron-faint focus:border-iron-accent min-w-0"
      />
      <input
        type="number"
        placeholder="lbs"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        min="0"
        step="2.5"
        className="w-20 h-[38px] bg-iron-bg border border-iron-border rounded-iron font-mono text-sm text-iron-text px-3 placeholder:text-iron-faint focus:border-iron-accent flex-shrink-0"
      />
      <button
        type="submit"
        disabled={saving || !exercise.trim() || !weight}
        className="press h-[38px] px-3 bg-iron-accent text-iron-bg font-display font-black text-xs uppercase tracking-wider rounded-iron border-0 glow-accent disabled:opacity-50 flex-shrink-0 flex items-center gap-1"
      >
        <IconPlus /> Add
      </button>
    </form>
  )
}

// ─── Plan assignment section ───────────────────────────────────────────────────

function PlanAssignment({ clientId, workoutPlans, mealPlans }) {
  const [assignment, setAssignment] = useState(null)
  const [workoutPlanId, setWorkoutPlanId] = useState('')
  const [mealPlanId, setMealPlanId]       = useState('')
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch current assignment for this client from our coach's view
      const { data } = await supabase
        .from('plan_assignments')
        .select('workout_plan_id, meal_plan_id')
        .eq('client_id', clientId)
        .maybeSingle()
      if (data) {
        setAssignment(data)
        setWorkoutPlanId(data.workout_plan_id ?? '')
        setMealPlanId(data.meal_plan_id ?? '')
      }
    }
    if (clientId) load()
  }, [clientId])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await db.assignPlanToClient({
      clientId,
      workoutPlanId: workoutPlanId || null,
      mealPlanId:    mealPlanId    || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
            Workout Plan
          </label>
          <select
            value={workoutPlanId}
            onChange={e => setWorkoutPlanId(e.target.value)}
            className="h-[40px] bg-iron-bg border border-iron-border rounded-iron font-mono text-sm text-iron-text px-3 focus:border-iron-accent"
          >
            <option value="">— None —</option>
            {workoutPlans.map(p => (
              <option key={p.id} value={p.id}>{p.planName}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
            Meal Plan
          </label>
          <select
            value={mealPlanId}
            onChange={e => setMealPlanId(e.target.value)}
            className="h-[40px] bg-iron-bg border border-iron-border rounded-iron font-mono text-sm text-iron-text px-3 focus:border-iron-accent"
          >
            <option value="">— None —</option>
            {mealPlans.map(p => (
              <option key={p.id} value={p.id}>{p.planName}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="press mt-3 h-[40px] px-5 bg-iron-accent text-iron-bg font-display font-black text-xs uppercase tracking-[0.1em] rounded-iron border-0 glow-accent disabled:opacity-50"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Assign Plans'}
      </button>
    </div>
  )
}

// ─── Client detail panel ───────────────────────────────────────────────────────

function ClientDetail({ client, workoutPlans, mealPlans, onBack }) {
  const [overrides, setOverrides] = useState([])

  useEffect(() => {
    async function load() {
      if (!client.clientId) return
      const data = await db.fetchWeightOverridesForClient(client.clientId)
      setOverrides(data)
    }
    load()
  }, [client.clientId])

  const handleOverrideAdded = (o) => {
    setOverrides(prev => {
      const idx = prev.findIndex(x => x.exerciseName === o.exerciseName)
      return idx >= 0
        ? prev.map((x, i) => i === idx ? o : x)
        : [...prev, o]
    })
  }

  const handleOverrideDeleted = (exerciseName) => {
    setOverrides(prev => prev.filter(x => x.exerciseName !== exerciseName))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-iron-border flex-shrink-0">
        <button
          onClick={onBack}
          className="press md:hidden text-iron-muted border-0 bg-transparent p-1 -ml-1 flex-shrink-0"
          aria-label="Back to roster"
        >
          <IconChevronLeft />
        </button>
        <div className="w-10 h-10 rounded-full bg-iron-accent/10 border border-iron-accent/20 flex items-center justify-center text-iron-accent flex-shrink-0">
          <IconUser />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-black text-iron-text uppercase text-base truncate">
              {client.displayName || client.clientEmail}
            </h2>
            <StatusBadge status={client.status} />
          </div>
          <p className="font-mono text-[12px] text-iron-muted truncate">{client.clientEmail}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 flex flex-col gap-6">

          {/* Plan assignment */}
          <section>
            <h3 className="font-display font-bold text-iron-text uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-iron-accent inline-block" />
              Assign Plans
            </h3>
            {client.clientId ? (
              <PlanAssignment
                clientId={client.clientId}
                workoutPlans={workoutPlans}
                mealPlans={mealPlans}
              />
            ) : (
              <p className="font-mono text-[12px] text-iron-muted">
                Client hasn't accepted their invite yet. Plans can be assigned once they join.
              </p>
            )}
          </section>

          {/* Weight overrides */}
          {client.clientId && (
            <section>
              <h3 className="font-display font-bold text-iron-text uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-iron-accent inline-block" />
                Weight Overrides
                <span className="font-mono text-[10px] text-iron-muted normal-case tracking-normal font-normal">
                  pre-fills top set in workout logger
                </span>
              </h3>

              {overrides.length > 0 ? (
                <div className="bg-iron-bg border border-iron-border rounded-iron px-3">
                  {overrides.map(o => (
                    <WeightOverrideRow
                      key={o.exerciseName}
                      clientId={client.clientId}
                      override={o}
                      onDelete={handleOverrideDeleted}
                    />
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[12px] text-iron-muted">
                  No overrides set. Add one below to pre-fill a starting weight.
                </p>
              )}

              <AddWeightOverride clientId={client.clientId} onAdded={handleOverrideAdded} />
            </section>
          )}

          {/* Invited info */}
          <section>
            <h3 className="font-display font-bold text-iron-text uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-iron-accent inline-block" />
              Info
            </h3>
            <div className="flex flex-col gap-1.5 font-mono text-[12px] text-iron-muted">
              <div className="flex gap-2">
                <span className="text-iron-faint w-20 flex-shrink-0">Invited</span>
                <span>{new Date(client.invitedAt).toLocaleDateString()}</span>
              </div>
              {client.linkedAt && (
                <div className="flex gap-2">
                  <span className="text-iron-faint w-20 flex-shrink-0">Joined</span>
                  <span>{new Date(client.linkedAt).toLocaleDateString()}</span>
                </div>
              )}
              {client.role && (
                <div className="flex gap-2">
                  <span className="text-iron-faint w-20 flex-shrink-0">Role</span>
                  <span className="capitalize">{client.role}</span>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

// ─── Client list item ──────────────────────────────────────────────────────────

function ClientRow({ client, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(client)}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 border-b border-iron-border',
        'bg-transparent border-x-0 border-t-0 text-left press',
        isSelected ? 'bg-iron-accent/5' : 'hover:bg-iron-surface',
      ].join(' ')}
    >
      <div className="w-9 h-9 rounded-full bg-iron-bg border border-iron-border flex items-center justify-center text-iron-muted flex-shrink-0">
        <IconUser />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-iron-text text-sm uppercase truncate">
            {client.displayName || client.clientEmail.split('@')[0]}
          </span>
          <StatusBadge status={client.status} />
        </div>
        <p className="font-mono text-[11px] text-iron-muted truncate">{client.clientEmail}</p>
      </div>
      <span className="text-iron-muted flex-shrink-0"><IconChevronRight /></span>
    </button>
  )
}

// ─── Coach Dashboard ───────────────────────────────────────────────────────────

export default function CoachDashboard() {
  const { profile, workoutPlans, mealPlans } = useApp()
  const name = profile?.displayName || 'Coach'

  const [clients, setClients]           = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)

  const loadClients = useCallback(async () => {
    setLoadingClients(true)
    try {
      const data = await db.fetchCoachClients()
      setClients(data)
    } catch (err) {
      console.error('fetchCoachClients:', err)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  // On desktop: auto-select first active client
  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      const first = clients.find(c => c.status === 'active') ?? clients[0]
      // Only auto-select on desktop (md+) — check window width
      if (window.innerWidth >= 768) setSelectedClient(first)
    }
  }, [clients, selectedClient])

  const handleInvited = () => {
    // Refresh client list after invite
    setTimeout(loadClients, 1500)
  }

  // Mobile: if a client is selected, show detail pane
  const showDetail  = selectedClient !== null
  const showRoster  = !showDetail // on mobile; on desktop both show

  return (
    <main className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: 0 }}>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <header className="px-5 pt-5 pb-4 border-b border-iron-border flex-shrink-0">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-iron-muted mb-0.5">
          Coach Dashboard
        </p>
        <h1
          className="font-display font-black text-iron-text uppercase leading-none"
          style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)' }}
        >
          Hey, {name}
        </h1>
      </header>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Left panel: roster + invite ── */}
        <div
          className={[
            'flex flex-col border-r border-iron-border flex-shrink-0',
            // Mobile: full width when no client selected, hidden when one is
            showDetail ? 'hidden md:flex' : 'flex',
            // Desktop: fixed width sidebar
            'md:w-[300px] lg:w-[340px]',
            // Mobile: full width
            'w-full',
          ].join(' ')}
        >
          {/* Invite form */}
          <div className="p-4 border-b border-iron-border flex-shrink-0">
            <InviteClient onInvited={handleInvited} />
          </div>

          {/* Client list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 border-b border-iron-border flex items-center justify-between">
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
                Clients ({clients.length})
              </span>
              <button
                onClick={loadClients}
                className="press font-display text-[10px] uppercase tracking-widest text-iron-accent border-0 bg-transparent p-0"
              >
                Refresh
              </button>
            </div>

            {loadingClients ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="w-6 h-6 rounded-full border-2 border-iron-border border-t-iron-accent"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : clients.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="font-mono text-[13px] text-iron-muted leading-relaxed">
                  No clients yet. Send an invite above.
                </p>
              </div>
            ) : (
              clients.map(client => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isSelected={selectedClient?.id === client.id}
                  onSelect={setSelectedClient}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: client detail ── */}
        <div
          className={[
            'flex-1 flex flex-col min-w-0',
            // Mobile: full width, only shown when client selected
            showDetail ? 'flex' : 'hidden md:flex',
          ].join(' ')}
        >
          {selectedClient ? (
            <ClientDetail
              client={selectedClient}
              workoutPlans={workoutPlans}
              mealPlans={mealPlans}
              onBack={() => setSelectedClient(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-14 h-14 rounded-full bg-iron-surface border border-iron-border flex items-center justify-center text-iron-muted">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M21 20c0-2.761-1.343-5-3-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-display font-bold text-iron-muted uppercase text-sm tracking-wider">
                Select a client
              </p>
              <p className="font-mono text-[12px] text-iron-faint max-w-[240px]">
                Click a client from the roster to view their details and assign plans.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
