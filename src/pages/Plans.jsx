import { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { getProgramDay, getActiveWorkoutPlan, getActiveMealPlan } from '../utils/planUtils'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_WEEKS  = 15
const DELOAD_WEEKS = new Set([5, 10, 15])

// Weeks per month block (1–5 → M1, 6–10 → M2, 11–15 → M3)
const weekToMonth = w => Math.ceil(w / 5)
const weekInMonth = w => ((w - 1) % 5) + 1

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      className={`flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Program timeline ─────────────────────────────────────────────────────────

function ProgramTimeline({ currentWeek }) {
  const scrollRef   = useRef()
  const activeRef   = useRef()

  // Scroll active week into view on mount
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const el     = activeRef.current
      const parent = scrollRef.current
      const elLeft = el.offsetLeft
      const elW    = el.offsetWidth
      const parentW = parent.offsetWidth
      parent.scrollLeft = elLeft - parentW / 2 + elW / 2
    }
  }, [])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 px-4">
        <h2 className="font-display font-bold text-iron-text uppercase text-lg">Program Timeline</h2>
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
          15 weeks
        </span>
      </div>

      {/* Horizontal scroll */}
      <div ref={scrollRef} className="overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-1.5" style={{ width: 'max-content' }}>
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
            const week    = i + 1
            const month   = weekToMonth(week)
            const wInM    = weekInMonth(week)
            const isActive  = week === currentWeek
            const isPast    = week < currentWeek
            const isDeload  = DELOAD_WEEKS.has(week)

            return (
              <div
                key={week}
                ref={isActive ? activeRef : null}
                className={[
                  'flex flex-col items-center justify-center rounded-iron border select-none',
                  'transition-opacity duration-150',
                  isPast && !isActive ? 'opacity-30' : '',
                ].join(' ')}
                style={{
                  width: 48,
                  height: 56,
                  background:   isActive  ? '#D4FF00' : 'transparent',
                  borderColor:  isActive  ? '#D4FF00'
                              : isDeload  ? '#FF8800'
                              : '#2A2A2A',
                }}
              >
                <span
                  className="font-mono text-xs font-bold leading-none"
                  style={{
                    color: isActive  ? '#0D0D0D'
                         : isDeload  ? '#FF8800'
                         : isPast    ? '#555555'
                         : '#F0F0F0',
                  }}
                >
                  W{week}
                </span>
                <span
                  className="font-display text-[9px] uppercase tracking-wider leading-none mt-0.5"
                  style={{
                    color: isActive  ? '#0D0D0D'
                         : isDeload  ? '#FF8800'
                         : '#555555',
                  }}
                >
                  {isDeload ? 'Deload' : `M${month}W${wInM}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-iron bg-iron-accent" />
          <span className="font-display text-[9px] uppercase tracking-wider text-iron-muted">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-iron border border-iron-warning" />
          <span className="font-display text-[9px] uppercase tracking-wider text-iron-muted">Deload</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-iron bg-iron-faint opacity-40" />
          <span className="font-display text-[9px] uppercase tracking-wider text-iron-muted">Past</span>
        </div>
      </div>
    </div>
  )
}

// ─── Workout plan accordion ───────────────────────────────────────────────────

function ExerciseRow({ ex }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-iron-border last:border-0">
      <span className="font-mono text-[10px] text-iron-faint w-4 flex-shrink-0 mt-0.5">{ex.order}</span>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-iron-text text-sm uppercase leading-tight">{ex.name}</p>
        <p className="font-mono text-[11px] text-iron-muted mt-0.5">
          {ex.sets} × {ex.repRangeMin}–{ex.repRangeMax}
          <span className="text-iron-faint"> · {ex.restSeconds >= 60 ? `${Math.floor(ex.restSeconds/60)}m` : `${ex.restSeconds}s`} rest</span>
        </p>
        {ex.notes && (
          <p className="font-mono text-[10px] text-iron-faint mt-0.5 leading-snug italic">{ex.notes}</p>
        )}
      </div>
    </div>
  )
}

function DayAccordion({ day }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-iron-border last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-transparent border-0 rounded-none text-left"
      >
        <div>
          <span className="font-display font-bold text-iron-text text-sm uppercase tracking-wider">
            {day.dayName} Day
          </span>
          <span className="font-display text-[10px] text-iron-muted uppercase tracking-wider ml-2">
            {day.scheduledDayOfWeek}
          </span>
        </div>
        <div className="flex items-center gap-2 text-iron-muted">
          <span className="font-mono text-[10px]">{day.exercises.length} ex</span>
          <Chevron open={open} />
        </div>
      </button>
      {open && (
        <div className="px-3 pb-2 bg-iron-bg">
          {day.exercises.map(ex => <ExerciseRow key={ex.order} ex={ex} />)}
        </div>
      )}
    </div>
  )
}

function MonthAccordion({ monthNum, weeks }) {
  const [open, setOpen] = useState(false)

  // Use the first non-deload week of this month to get representative exercises
  const repWeek = weeks.find(w => !w.isDeload) ?? weeks[0]
  const totalExercises = repWeek?.days.reduce((s, d) => s + d.exercises.length, 0) ?? 0
  const deloadWeek = weeks.find(w => w.isDeload)

  return (
    <div className="border border-iron-border rounded-iron overflow-hidden">
      {/* Month header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-iron-surface border-0 rounded-none text-left"
      >
        <div>
          <span className="font-display font-black text-iron-text uppercase" style={{ fontSize: '1.2rem' }}>
            Month {monthNum}
          </span>
          <span className="font-display text-[10px] text-iron-muted uppercase tracking-widest ml-3">
            {weeks.length} weeks · {totalExercises} exercises / session
          </span>
        </div>
        <div className="flex items-center gap-2 text-iron-muted">
          <span className="font-display text-[10px] uppercase tracking-wider">
            Weeks {weeks[0]?.weekNumber}–{weeks[weeks.length - 1]?.weekNumber}
          </span>
          <Chevron open={open} />
        </div>
      </button>

      {/* Expanded: RPE schedule + day breakdown */}
      {open && repWeek && (
        <div className="border-t border-iron-border">
          {/* RPE week summary */}
          <div className="grid grid-cols-5 gap-px bg-iron-border">
            {weeks.map(w => (
              <div
                key={w.weekNumber}
                className={[
                  'flex flex-col items-center justify-center py-2 text-center',
                  w.isDeload ? 'bg-iron-bg' : 'bg-iron-surface',
                ].join(' ')}
              >
                <span className="font-display text-[9px] uppercase tracking-wider text-iron-muted">W{w.weekNumber}</span>
                <span className={[
                  'font-mono text-[10px] font-bold leading-tight mt-0.5',
                  w.isDeload ? 'text-iron-warning' : 'text-iron-accent',
                ].join(' ')}>
                  {w.rpeTarget.split(' (')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Day accordions */}
          <div className="bg-iron-surface">
            {repWeek.days.map(day => <DayAccordion key={day.dayName} day={day} />)}
          </div>

          {/* Deload note */}
          {deloadWeek && (
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-iron-border bg-iron-bg">
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-warning">
                Week {deloadWeek.weekNumber}: Deload
              </span>
              <span className="font-mono text-[10px] text-iron-muted">
                — 50% volume · 60% loads · {deloadWeek.rpeTarget}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WorkoutPlanView({ plan }) {
  if (!plan) {
    return (
      <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
        <p className="font-mono text-[13px] text-iron-muted">No workout plan loaded.</p>
      </div>
    )
  }

  // Group weeks into months (5 weeks each)
  const months = [1, 2, 3].map(m => ({
    monthNum: m,
    weeks: plan.weeks.filter(w => weekToMonth(w.weekNumber) === m),
  }))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-display font-bold text-iron-text uppercase text-sm">{plan.planName}</span>
        <span className="font-mono text-[11px] text-iron-muted">
          {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      {months.map(({ monthNum, weeks }) => (
        <MonthAccordion key={monthNum} monthNum={monthNum} weeks={weeks} />
      ))}
    </div>
  )
}

// ─── Meal plan view ───────────────────────────────────────────────────────────

function MealDayAccordion({ dayData }) {
  const [open, setOpen] = useState(false)

  const totalProtein = dayData.meals.reduce((s, m) => s + m.macros.proteinG, 0)
  const totalCals    = dayData.meals.reduce((s, m) => s + m.macros.calories, 0)

  return (
    <div className="border border-iron-border rounded-iron overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-iron-surface border-0 rounded-none text-left"
      >
        <div>
          <span className="font-display font-black text-iron-text uppercase text-base">
            {dayData.dayOfWeek}
          </span>
        </div>
        <div className="flex items-center gap-3 text-iron-muted">
          <span className="font-mono text-[11px]">
            <span className="text-iron-accent font-bold">{totalProtein}g P</span>
            <span className="text-iron-faint"> · {totalCals} cal</span>
          </span>
          <Chevron open={open} />
        </div>
      </button>

      {open && (
        <div className="border-t border-iron-border">
          {dayData.meals.map((meal, i) => (
            <div
              key={meal.mealName}
              className={['px-4 py-3 bg-iron-bg', i < dayData.meals.length - 1 ? 'border-b border-iron-border' : ''].join(' ')}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-display font-bold text-iron-text uppercase text-sm tracking-wide">
                  {meal.mealName}
                </span>
                {meal.sauce && (
                  <span className="font-mono text-[10px] text-iron-accent">{meal.sauce}</span>
                )}
              </div>
              <p className="font-mono text-[12px] text-iron-muted leading-snug mb-2">{meal.foods}</p>
              <div className="flex gap-4">
                <span className="font-mono text-[11px] font-bold text-iron-accent">{meal.macros.proteinG}g P</span>
                <span className="font-mono text-[11px] text-iron-muted">{meal.macros.carbsG}g C</span>
                <span className="font-mono text-[11px] text-iron-muted">{meal.macros.fatG}g F</span>
                <span className="font-mono text-[11px] text-iron-muted">{meal.macros.calories} cal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MealPlanView({ plan }) {
  if (!plan) {
    return (
      <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
        <p className="font-mono text-[13px] text-iron-muted">No meal plan loaded.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display font-bold text-iron-text uppercase text-sm">{plan.planName}</span>
        <span className="font-mono text-[11px] text-iron-muted">7-day rotation</span>
      </div>
      {plan.days.map(day => (
        <MealDayAccordion key={day.dayOfWeek} dayData={day} />
      ))}
    </div>
  )
}

// ─── Import modal ─────────────────────────────────────────────────────────────

function validateImport(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'That doesn\'t look like valid JSON. Check for missing brackets or commas.' }
  }

  if (!parsed.planType) {
    return { ok: false, error: 'Missing "planType" field. Must be "workout" or "meal".' }
  }
  if (!['workout', 'meal'].includes(parsed.planType)) {
    return { ok: false, error: `Unknown planType "${parsed.planType}". Must be "workout" or "meal".` }
  }
  if (parsed.planType === 'workout') {
    if (!Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
      return { ok: false, error: 'Workout plans need a "weeks" array with at least one week.' }
    }
    const firstWeek = parsed.weeks[0]
    if (!Array.isArray(firstWeek?.days)) {
      return { ok: false, error: 'Each week needs a "days" array.' }
    }
    if (!Array.isArray(firstWeek.days[0]?.exercises)) {
      return { ok: false, error: 'Each day needs an "exercises" array.' }
    }
  }
  if (parsed.planType === 'meal') {
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      return { ok: false, error: 'Meal plans need a "days" array with at least one day.' }
    }
    if (!Array.isArray(parsed.days[0]?.meals)) {
      return { ok: false, error: 'Each day needs a "meals" array.' }
    }
  }
  if (!parsed.planName) {
    return { ok: false, error: 'Missing "planName" field.' }
  }

  return { ok: true, plan: parsed }
}

function ImportModal({ onClose, onImported, profile, workoutPlans, mealPlans, saveWorkoutPlan, saveMealPlan, setActivePlanIds }) {
  const [raw, setRaw]         = useState('')
  const [error, setError]     = useState('')
  const [preview, setPreview] = useState(null)
  const [step, setStep]       = useState('paste') // 'paste' | 'confirm'

  const handleValidate = () => {
    const result = validateImport(raw)
    if (!result.ok) { setError(result.error); return }
    setError('')
    setPreview(result.plan)
    setStep('confirm')
  }

  const handleConfirm = useCallback(async () => {
    const plan = { ...preview, id: crypto.randomUUID(), createdAt: preview.createdAt ?? new Date().toISOString() }

    if (plan.planType === 'workout') {
      await saveWorkoutPlan(plan)
      await setActivePlanIds({ workoutPlanId: plan.id, mealPlanId: profile.activeMealPlanId })
    } else {
      await saveMealPlan(plan)
      await setActivePlanIds({ workoutPlanId: profile.activeWorkoutPlanId, mealPlanId: plan.id })
    }
    onImported()
    onClose()
  }, [preview, onImported, onClose, profile, saveWorkoutPlan, saveMealPlan, setActivePlanIds])

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80" />

      <div
        className="relative w-full max-w-[430px] mx-auto bg-iron-surface border-t border-iron-border rounded-t-[12px] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[3px] rounded-full bg-iron-border2" />
        </div>

        <div className="px-4 pb-6 pt-2">
          {step === 'paste' ? (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display font-black text-iron-text uppercase text-2xl">Import Plan</h3>
                <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">Paste JSON</span>
              </div>

              <p className="font-mono text-[12px] text-iron-muted mb-3">
                Generate a plan in Claude, copy the JSON, and paste it here.
                Supports both workout and meal plan formats.
              </p>

              <textarea
                rows={8}
                value={raw}
                onChange={e => { setRaw(e.target.value); setError('') }}
                placeholder={'{\n  "planType": "workout",\n  "planName": "My Plan",\n  ...\n}'}
                className={[
                  'w-full bg-iron-bg border rounded-iron p-3',
                  'font-mono text-[12px] text-iron-text resize-none',
                  'placeholder:text-iron-faint',
                  'focus:border-iron-accent focus:shadow-accent-ring',
                  error ? 'border-iron-danger' : 'border-iron-border',
                ].join(' ')}
              />

              {error && (
                <div className="flex gap-2 mt-2 p-3 bg-iron-danger/10 border border-iron-danger/40 rounded-iron">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-iron-danger mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="font-mono text-[12px] text-iron-danger leading-snug">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="press flex-1 h-[52px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidate}
                  disabled={!raw.trim()}
                  className={[
                    'press flex-1 h-[52px] rounded-iron border-0 font-display font-black text-sm uppercase tracking-[0.08em]',
                    raw.trim() ? 'bg-iron-accent text-iron-bg glow-accent' : 'bg-iron-surface2 text-iron-faint',
                  ].join(' ')}
                >
                  Validate
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display font-black text-iron-text uppercase text-2xl">Confirm Import</h3>
                <button
                  onClick={() => setStep('paste')}
                  className="press font-display text-[10px] uppercase tracking-widest text-iron-muted bg-transparent border-0"
                >
                  ← Edit
                </button>
              </div>

              {/* Plan preview */}
              <div className="bg-iron-bg border border-iron-border rounded-iron p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={[
                    'inline-flex px-2 py-0.5 rounded-iron border font-display text-[10px] font-bold uppercase tracking-wider',
                    preview.planType === 'workout'
                      ? 'border-iron-accent text-iron-accent bg-iron-accent/10'
                      : 'border-iron-success text-iron-success bg-iron-success/10',
                  ].join(' ')}>
                    {preview.planType}
                  </span>
                </div>
                <p className="font-display font-bold text-iron-text text-lg uppercase">{preview.planName}</p>
                <p className="font-mono text-[12px] text-iron-muted mt-1">
                  {preview.planType === 'workout'
                    ? `${preview.weeks?.length ?? 0} weeks · ${preview.weeks?.[0]?.days?.length ?? 0} days/week`
                    : `${preview.days?.length ?? 0} days`
                  }
                </p>
              </div>

              <div className="bg-iron-warning/10 border border-iron-warning/30 rounded-iron px-4 py-3 mb-4">
                <p className="font-mono text-[12px] text-iron-warning">
                  This will replace your current active {preview.planType} plan and set this one as active.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="press flex-1 h-[52px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="press flex-[2] h-[52px] bg-iron-accent text-iron-bg rounded-iron border-0 font-display font-black text-sm uppercase tracking-[0.08em] glow-accent"
                >
                  Import Plan
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Plans Component ─────────────────────────────────────────────────────

export default function Plans() {
  const { profile, workoutPlans, mealPlans, saveWorkoutPlan, saveMealPlan, setActivePlanIds } = useApp()

  const progDay = getProgramDay(new Date(), profile.programStartDate)
  const currentWeek = progDay?.week ?? 1

  const workoutPlan = getActiveWorkoutPlan(workoutPlans, profile.activeWorkoutPlanId)
  const mealPlan    = getActiveMealPlan(mealPlans, profile.activeMealPlanId)

  const [showImport, setShowImport] = useState(false)

  // handleImported is a no-op — context state updates reactively
  const handleImported = useCallback(() => {}, [])

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* Header */}
      <header className="flex items-start justify-between px-4 pt-5 pb-4 border-b border-iron-border">
        <h1 className="font-display font-black text-iron-text uppercase leading-none" style={{ fontSize: 'clamp(2rem, 9vw, 2.8rem)' }}>
          Plans
        </h1>
        <button
          onClick={() => setShowImport(true)}
          className="press flex items-center gap-1.5 px-3 h-[44px] bg-iron-accent text-iron-bg rounded-iron border-0 font-display font-black text-xs uppercase tracking-wider glow-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v12M8 12l4 4 4-4M4 20h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Import
        </button>
      </header>

      <div className="flex flex-col gap-6 py-5">

        {/* Program timeline */}
        <ProgramTimeline currentWeek={currentWeek} />

        <div className="h-px bg-iron-border mx-4" />

        {/* Active workout plan */}
        <section className="px-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-bold text-iron-text uppercase text-lg">Workout Plan</h2>
            {workoutPlan && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-iron-accent" />
                <span className="font-display text-[10px] uppercase tracking-widest text-iron-accent">Active</span>
              </span>
            )}
          </div>
          <WorkoutPlanView plan={workoutPlan} />
        </section>

        <div className="h-px bg-iron-border mx-4" />

        {/* Active meal plan */}
        <section className="px-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-bold text-iron-text uppercase text-lg">Meal Plan</h2>
            {mealPlan && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-iron-accent" />
                <span className="font-display text-[10px] uppercase tracking-widest text-iron-accent">Active</span>
              </span>
            )}
          </div>
          <MealPlanView plan={mealPlan} />
        </section>

      </div>

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
          profile={profile}
          workoutPlans={workoutPlans}
          mealPlans={mealPlans}
          saveWorkoutPlan={saveWorkoutPlan}
          saveMealPlan={saveMealPlan}
          setActivePlanIds={setActivePlanIds}
        />
      )}

    </main>
  )
}
