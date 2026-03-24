import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  getTodaysWorkout,
  getProgramDay,
  getPreviousLogForDay,
  getWorkoutLogForDate,
} from '../utils/planUtils'

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatRest(seconds) {
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} min`
  if (seconds > 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${seconds}s`
}

function emptySet() {
  return { weight: '', reps: '', rpe: null, completed: false }
}

function roundToNearest2_5(weight) {
  return Math.round(weight / 2.5) * 2.5
}

// ─── RPE Guide data ───────────────────────────────────────────────────────────

const RPE_EXPLANATIONS = [
  { rpe: 7,  rir: 3, color: '#888888', label: 'Comfortable', desc: 'Bar speed is solid. You have 3 clear reps in the tank. Use this weight to establish your baseline.' },
  { rpe: 8,  rir: 2, color: '#D4FF00', label: 'Working Hard', desc: 'Noticeably challenging. 2 reps left. Form stays clean. This is your bread-and-butter training zone.' },
  { rpe: 9,  rir: 1, color: '#FF8C00', label: 'Near Limit',   desc: '1 rep left. Max effort, you had to grind. Form may start to slip. Don\'t chase this every set.' },
  { rpe: 10, rir: 0, color: '#FF4444', label: 'True Failure', desc: 'You could not do another rep. Complete mechanical failure. Reserve for final sets, final week only.' },
]

// ─── RPE Guide Sheet ──────────────────────────────────────────────────────────

function RPEGuideSheet({ onClose }) {
  // Close on backdrop tap
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[430px] mx-auto bg-iron-surface border-t border-iron-border rounded-t-[12px] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-[3px] rounded-full bg-iron-border2" />
        </div>

        <div className="px-4 pb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display font-black text-iron-text text-2xl uppercase">RPE Guide</h3>
            <span className="font-display text-[11px] uppercase tracking-widest text-iron-muted">Rate of Perceived Exertion</span>
          </div>

          <div className="flex flex-col gap-3">
            {RPE_EXPLANATIONS.map(({ rpe, rir, color, label, desc }) => (
              <div key={rpe} className="flex gap-3 p-3 bg-iron-bg rounded-iron border border-iron-border">
                {/* RPE number */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-10">
                  <span className="font-mono font-bold text-xl leading-none" style={{ color }}>
                    {rpe}
                  </span>
                  <span className="font-display text-[9px] uppercase tracking-wider text-iron-muted mt-0.5">
                    {rir} RIR
                  </span>
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm uppercase tracking-wider mb-1" style={{ color }}>
                    {label}
                  </p>
                  <p className="font-mono text-[12px] text-iron-muted leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Backdown Calculator Sheet ───────────────────────────────────────────────

const BACKDOWN_PCTS = [
  { label: '85%',   value: 0.85  },
  { label: '87.5%', value: 0.875 },
  { label: '90%',   value: 0.90  },
]

function BackdownSheet({ topWeight, onUseWeight, onClose }) {
  const [pct, setPct]               = useState(0.875)
  const [manualWeight, setManualWeight] = useState('')

  const calculated    = roundToNearest2_5(topWeight * pct)
  const displayWeight = manualWeight !== '' ? Number(manualWeight) : calculated

  const inputClass = [
    'w-full h-[52px] bg-iron-bg border border-iron-border rounded-iron',
    'font-mono text-base text-iron-text text-center',
    'placeholder:text-iron-faint',
    'focus:border-iron-accent focus:shadow-accent-ring',
  ].join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-[430px] mx-auto bg-iron-surface border-t border-iron-border rounded-t-[12px] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-[3px] rounded-full bg-iron-border2" />
        </div>

        <div className="px-4 pb-6 pt-1">
          {/* Title row */}
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="font-display font-black text-iron-text text-2xl uppercase">
              Backdown Calc
            </h3>
            <span className="font-mono text-[12px] text-iron-muted">
              Top set: <span className="text-iron-text font-bold">{topWeight} lb</span>
            </span>
          </div>

          {/* Percentage selector */}
          <div className="mb-4">
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted block mb-2">
              Percentage
            </span>
            <div className="flex gap-2">
              {BACKDOWN_PCTS.map(({ label, value }) => {
                const active = pct === value && manualWeight === ''
                return (
                  <button
                    key={value}
                    onClick={() => { setPct(value); setManualWeight('') }}
                    className={[
                      'press flex-1 h-[48px] rounded-iron border font-display font-bold text-sm uppercase tracking-wider',
                      active
                        ? 'bg-iron-accent border-iron-accent text-iron-bg glow-accent'
                        : 'bg-transparent border-iron-border2 text-iron-muted',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result display */}
          <div className="bg-iron-bg border border-iron-border rounded-iron py-5 px-4 mb-4 text-center">
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted block mb-2">
              Backdown Weight
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span
                className="font-mono font-bold text-iron-accent"
                style={{ fontSize: 'clamp(2.8rem, 14vw, 4rem)', lineHeight: 1 }}
              >
                {displayWeight}
              </span>
              <span className="font-display font-black text-iron-muted text-xl uppercase">lb</span>
            </div>
          </div>

          {/* Manual override */}
          <div className="mb-5">
            <label className="font-display text-[10px] uppercase tracking-widest text-iron-muted block mb-1.5">
              Override weight
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Enter custom weight…"
              value={manualWeight}
              onChange={e => { setManualWeight(e.target.value); setPct(null) }}
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="press flex-1 h-[56px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => { onUseWeight(displayWeight); onClose() }}
              className="press flex-[2] h-[56px] bg-iron-accent text-iron-bg rounded-iron border-0 font-display font-black text-sm uppercase tracking-[0.08em] glow-accent"
            >
              Use This Weight
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({ setNum, set, onChange, onComplete, onUncomplete, disabled }) {
  const weightRef = useRef(null)
  const canComplete = set.weight !== '' && set.reps !== '' && set.rpe !== null

  // Auto-focus weight input for new incomplete sets
  useEffect(() => {
    if (!set.completed && !disabled && set.weight === '' && setNum === 1) {
      weightRef.current?.focus()
    }
  }, [])

  if (set.completed) {
    return (
      <div className="relative flex items-center gap-3 px-3 py-2.5 bg-iron-surface rounded-iron overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-iron-accent" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-iron-accent ml-0.5" aria-hidden="true">
          <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted flex-shrink-0 w-9">
          Set {setNum}
        </span>
        <span className="font-mono text-sm text-iron-text flex-1">
          {set.weight} <span className="text-iron-muted text-xs">lb</span>
          {' · '}
          {set.reps} <span className="text-iron-muted text-xs">reps</span>
          {' · '}
          <span className="text-iron-accent">RPE {set.rpe}</span>
        </span>
        <button
          onClick={onUncomplete}
          className="press flex-shrink-0 flex items-center justify-center w-[32px] h-[32px] rounded-iron border border-iron-border2 text-iron-faint"
          aria-label={`Edit set ${setNum}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-iron-bg rounded-iron border border-iron-border">
      {/* Row 1: set label + inputs + check */}
      <div className="flex items-center gap-2">
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted flex-shrink-0 w-9">
          Set {setNum}
        </span>

        {/* Weight */}
        <div className="flex-1 relative">
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            placeholder="lbs"
            value={set.weight}
            onChange={e => onChange('weight', e.target.value)}
            disabled={disabled}
            className={[
              'w-full h-[48px] bg-iron-surface border border-iron-border rounded-iron',
              'font-mono text-base text-iron-text text-center',
              'focus:border-iron-accent focus:shadow-accent-ring',
              'placeholder:text-iron-faint',
              'disabled:opacity-40',
            ].join(' ')}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-display text-[9px] uppercase tracking-wider text-iron-faint pointer-events-none">
            lb
          </span>
        </div>

        {/* Reps */}
        <div className="relative w-[64px]">
          <input
            type="number"
            inputMode="numeric"
            placeholder="reps"
            value={set.reps}
            onChange={e => onChange('reps', e.target.value)}
            disabled={disabled}
            className={[
              'w-full h-[48px] bg-iron-surface border border-iron-border rounded-iron',
              'font-mono text-base text-iron-text text-center',
              'focus:border-iron-accent focus:shadow-accent-ring',
              'placeholder:text-iron-faint',
              'disabled:opacity-40',
            ].join(' ')}
          />
        </div>

        {/* Checkmark */}
        <button
          onClick={onComplete}
          disabled={!canComplete || disabled}
          aria-label={`Complete set ${setNum}`}
          className={[
            'press flex-shrink-0 flex items-center justify-center',
            'w-[48px] h-[48px] rounded-iron border',
            canComplete
              ? 'bg-iron-accent/10 border-iron-accent text-iron-accent'
              : 'bg-transparent border-iron-border text-iron-faint',
            'disabled:opacity-30',
          ].join(' ')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Row 2: RPE pills */}
      <div className="flex items-center gap-2 pl-11">
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted mr-1 flex-shrink-0">
          RPE
        </span>
        <div className="flex gap-1.5 flex-1">
          {[7, 8, 9, 10].map(r => {
            const active = set.rpe === r
            return (
              <button
                key={r}
                onClick={() => onChange('rpe', r)}
                disabled={disabled}
                aria-label={`RPE ${r}`}
                aria-pressed={active}
                className={[
                  'press flex-1 h-[40px] rounded-iron border font-mono text-sm font-bold',
                  active
                    ? 'bg-iron-accent border-iron-accent text-iron-bg glow-accent'
                    : 'bg-transparent border-iron-border2 text-iron-muted',
                  'disabled:opacity-30',
                ].join(' ')}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, exLog, prevSets, isExpanded, onToggle, onUpdateSet, onCompleteSet, onUncompleteSet, onAddSet, onUpdateNotes, onOpenBackdown }) {
  const completedCount = exLog.sets.filter(s => s.completed).length
  const allComplete = completedCount === exercise.sets && completedCount > 0

  // Best previous weight for this exercise
  const prevBest = prevSets?.length
    ? prevSets.filter(s => s.weight).reduce((best, s) => (!best || Number(s.weight) > Number(best.weight) ? s : best), null)
    : null

  // Last completed set weight (for backdown calc)
  const completedSets = exLog.sets.filter(s => s.completed && s.weight)
  const topWeight = completedSets.length ? Number(completedSets[completedSets.length - 1].weight) : 0

  return (
    <div className={[
      'bg-iron-surface border rounded-iron overflow-hidden',
      allComplete ? 'border-iron-accent/40' : 'border-iron-border',
    ].join(' ')}>
      {/* Card header — always visible, tappable */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3.5 bg-transparent border-0 rounded-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Exercise name */}
            <h3 className="font-display font-black text-iron-text leading-tight uppercase" style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)' }}>
              {exercise.name}
            </h3>

            {/* Spec row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span className="font-mono text-[12px] text-iron-accent font-bold">
                {exercise.sets} × {exercise.repRangeMin}–{exercise.repRangeMax}
              </span>
              <span className="font-mono text-[11px] text-iron-muted">
                {formatRest(exercise.restSeconds)} rest
              </span>
            </div>

            {/* Notes */}
            {exercise.notes && (
              <p className="font-mono text-[11px] text-iron-muted mt-0.5 leading-snug">
                {exercise.notes}
              </p>
            )}

            {/* Last session */}
            {prevBest && (
              <p className="font-mono text-[11px] text-iron-faint mt-1">
                Last: <span className="text-iron-muted">{prevBest.weight}lb × {prevBest.reps}</span>
              </p>
            )}

            {/* Backdown trigger — appears after first set is logged */}
            {topWeight > 0 && (
              <button
                onClick={e => { e.stopPropagation(); onOpenBackdown(topWeight) }}
                className="press mt-1.5 inline-flex items-center gap-1.5 h-[24px] px-2.5 bg-iron-accent/5 border border-iron-accent/30 rounded-iron"
              >
                <span className="font-display text-[9px] uppercase tracking-[0.1em] font-bold text-iron-accent leading-none">
                  Backdown
                </span>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Right side: set dots + chevron */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Chevron */}
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              className={`text-iron-muted transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Set completion dots */}
            <div className="flex gap-1">
              {Array.from({ length: exercise.sets }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'w-[7px] h-[7px] rounded-full',
                    exLog.sets[i]?.completed ? 'bg-iron-accent' : 'bg-iron-border2',
                  ].join(' ')}
                />
              ))}
              {/* Extra sets added beyond plan */}
              {exLog.sets.slice(exercise.sets).map((s, i) => (
                <div key={`extra-${i}`} className={`w-[7px] h-[7px] rounded-full ${s.completed ? 'bg-iron-success' : 'bg-iron-border'}`} />
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded logging panel */}
      {isExpanded && (
        <div className="border-t border-iron-border">
          {/* Set rows */}
          <div className="flex flex-col gap-2 p-3">
            {exLog.sets.map((set, i) => (
              <SetRow
                key={i}
                setNum={i + 1}
                set={set}
                onChange={(field, value) => onUpdateSet(i, field, value)}
                onComplete={() => onCompleteSet(i)}
                onUncomplete={() => onUncompleteSet(i)}
                disabled={false}
              />
            ))}
          </div>

          {/* ADD SET */}
          <div className="px-3 pb-3">
            <button
              onClick={onAddSet}
              className="press w-full h-[44px] bg-transparent border border-dashed border-iron-border2 rounded-iron font-display text-[11px] uppercase tracking-widest text-iron-muted"
            >
              + Add Set
            </button>
          </div>

          {/* Notes */}
          <div className="px-3 pb-3 border-t border-iron-border pt-3">
            <textarea
              rows={2}
              placeholder="Exercise notes…"
              value={exLog.notes}
              onChange={e => onUpdateNotes(e.target.value)}
              className={[
                'w-full bg-iron-bg border border-iron-border rounded-iron',
                'p-3 font-mono text-[13px] text-iron-text',
                'placeholder:text-iron-faint resize-none',
                'focus:border-iron-accent focus:shadow-accent-ring',
              ].join(' ')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Workout Header ───────────────────────────────────────────────────────────

function WorkoutHeader({ workout, progWeek, totalPlanned, totalCompleted, onRPEGuide }) {
  const monthNum = Math.ceil(progWeek / 5)
  const weekInMonth = ((progWeek - 1) % 5) + 1

  return (
    <header className="sticky top-0 z-30 bg-iron-bg border-b border-iron-border px-4 pt-4 pb-3">
      <div className="flex items-start justify-between gap-2">
        {/* Workout name */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-iron-text leading-none uppercase" style={{ fontSize: 'clamp(1.8rem, 8vw, 2.5rem)' }}>
            {workout.dayName} Day
          </h1>
          {/* RPE badge — tappable */}
          <button
            onClick={onRPEGuide}
            className="press inline-flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-iron-surface border border-iron-border2 rounded-iron"
            aria-label="View RPE guide"
          >
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              M{monthNum} W{weekInMonth}
            </span>
            <span className="w-px h-3 bg-iron-border2" />
            <span className="font-mono text-[11px] font-bold text-iron-accent">
              {workout.rpeTarget.split(' (')[0]}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-iron-muted" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Set counter */}
        <div className="text-right flex-shrink-0">
          <p className="font-mono font-bold leading-none">
            <span className="text-iron-accent" style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)' }}>{totalCompleted}</span>
            <span className="text-iron-muted text-sm"> / {totalPlanned}</span>
          </p>
          <p className="font-display text-[10px] uppercase tracking-widest text-iron-muted mt-0.5">Sets</p>
        </div>
      </div>
    </header>
  )
}

// ─── Rest Timer Bar ───────────────────────────────────────────────────────────

function RestTimerBar({ remaining, total, onDismiss }) {
  const pct   = total > 0 ? remaining / total : 0
  const mins  = Math.floor(remaining / 60)
  const secs  = remaining % 60
  const label = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`
  const done  = remaining === 0

  return (
    <div className="fixed bottom-[56px] left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-3 pb-2">
      <div className={[
        'rounded-iron border overflow-hidden',
        done ? 'bg-iron-success/10 border-iron-success/50' : 'bg-iron-surface border-iron-border',
      ].join(' ')}>
        {/* Countdown progress bar */}
        <div className="h-[3px] bg-iron-border2">
          <div
            className={['h-full rounded-full', done ? 'bg-iron-success' : 'bg-iron-accent'].join(' ')}
            style={{ width: `${pct * 100}%`, transition: 'width 1s linear' }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted flex-shrink-0">
            Rest
          </span>
          <span
            className={['font-mono font-bold flex-1 leading-none', done ? 'text-iron-success' : 'text-iron-accent'].join(' ')}
            style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)' }}
          >
            {done ? 'Go!' : label}
          </span>
          <button
            onClick={onDismiss}
            className="press flex-shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-iron border border-iron-border2 text-iron-muted"
            aria-label="Dismiss rest timer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Program Not Started View ─────────────────────────────────────────────────

function ProgramNotStartedView({ programStartDate, onNavigate }) {
  const dateStr = new Date(programStartDate + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <main className="flex flex-col flex-1 pb-24">
      <header className="px-4 pt-5 pb-4 border-b border-iron-border">
        <h1 className="font-display font-black text-iron-text leading-none uppercase" style={{ fontSize: 'clamp(2rem, 9vw, 3rem)' }}>
          Not Started
        </h1>
        <p className="font-display text-iron-muted text-sm uppercase tracking-widest mt-1">
          Program begins {dateStr}
        </p>
      </header>
      <div className="flex flex-col gap-4 p-4">
        <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
          <p className="font-mono text-[13px] text-iron-muted leading-relaxed">
            Your program starts on {dateStr}. Come back then to begin training.
          </p>
          <p className="font-mono text-[12px] text-iron-faint mt-2">
            You can update your start date in Settings.
          </p>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="press w-full h-[56px] bg-iron-surface border border-iron-border rounded-iron font-display font-bold uppercase tracking-wider text-iron-muted"
        >
          Go to Settings
        </button>
      </div>
    </main>
  )
}

// ─── Rest Day View ────────────────────────────────────────────────────────────

function RestDayView({ onNavigate }) {
  return (
    <main className="flex flex-col flex-1 pb-24">
      <header className="px-4 pt-5 pb-4 border-b border-iron-border">
        <h1 className="font-display font-black text-iron-text leading-none uppercase" style={{ fontSize: 'clamp(2rem, 9vw, 3rem)' }}>
          Rest Day
        </h1>
        <p className="font-display text-iron-muted text-sm uppercase tracking-widest mt-1">
          No training scheduled
        </p>
      </header>
      <div className="flex flex-col gap-4 p-4">
        <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
          <p className="font-mono text-[13px] text-iron-muted leading-relaxed">
            Eat your protein. Hydrate. Let the muscle repair. Growth happens during recovery.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="press w-full h-[56px] bg-iron-surface border border-iron-border rounded-iron font-display font-bold uppercase tracking-wider text-iron-muted"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  )
}

// ─── Workout Complete Banner ──────────────────────────────────────────────────

function CompleteBanner({ totalCompleted, dayName, onNavigate }) {
  return (
    <div className="mx-4 mt-4 p-4 bg-iron-success/10 border border-iron-success/50 rounded-iron">
      <div className="flex items-center gap-3 mb-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-iron-success flex-shrink-0" aria-hidden="true">
          <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="font-display font-black text-iron-success uppercase text-xl">
          Workout Complete
        </h3>
      </div>
      <p className="font-mono text-[13px] text-iron-muted">
        {totalCompleted} sets logged · {dayName} Day
      </p>
      <button
        onClick={() => onNavigate('home')}
        className="press mt-3 w-full h-[48px] bg-iron-success/20 border border-iron-success/50 rounded-iron font-display font-bold uppercase tracking-wider text-iron-success text-sm"
      >
        Back to Dashboard
      </button>
    </div>
  )
}

// ─── Main Workout Component ───────────────────────────────────────────────────

export default function Workout({ onNavigate }) {
  const today = new Date()
  const dateStr = todayISO()

  const { profile, workoutPlans, workoutLogs, saveWorkoutLog, weightOverrides } = useApp()

  const workout  = getTodaysWorkout(today, workoutPlans, profile.activeWorkoutPlanId, profile.programStartDate)
  const progDay  = getProgramDay(today, profile.programStartDate)
  const progWeek = progDay?.week ?? 1

  // Load previous session for "LAST:" display
  const prevLog = workout ? getPreviousLogForDay(workoutLogs, workout.dayName, dateStr) : null

  const existingLog = workout
    ? getWorkoutLogForDate(workoutLogs, dateStr).find(l => l.dayName === workout.dayName)
    : null

  // Initialize exercise logs — restore from Supabase if session exists
  const [exerciseLogs, setExerciseLogs] = useState(() => {
    if (!workout) return {}
    const result = {}
    workout.exercises.forEach(ex => {
      if (existingLog) {
        const found = existingLog.exercises?.find(e => e.name === ex.name)
        result[ex.name] = {
          sets:  found?.sets?.length ? found.sets : Array.from({ length: ex.sets }, emptySet),
          notes: found?.notes ?? '',
        }
      } else {
        const overrideWeight = weightOverrides?.[ex.name]
        result[ex.name] = {
          sets: Array.from({ length: ex.sets }, () =>
            overrideWeight != null
              ? { weight: String(overrideWeight), reps: '', rpe: null, completed: false }
              : emptySet()
          ),
          notes: '',
        }
      }
    })
    return result
  })

  const [expandedIdx, setExpandedIdx] = useState(0)
  const [showRPEGuide, setShowRPEGuide]   = useState(false)
  const [backdownSheet, setBackdownSheet] = useState(null) // { exerciseName, topWeight }
  const [isFinished, setIsFinished] = useState(() => existingLog?.completedAt != null)
  const [restTimer, setRestTimer] = useState(null) // { remaining, total }

  // Countdown tick
  useEffect(() => {
    if (!restTimer) return
    if (restTimer.remaining <= 0) {
      const t = setTimeout(() => setRestTimer(null), 1500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setRestTimer(prev => prev ? { ...prev, remaining: prev.remaining - 1 } : null)
    }, 1000)
    return () => clearTimeout(t)
  }, [restTimer])

  // ── Derived counts ──────────────────────────────────────────────────────────

  const totalPlanned   = workout?.exercises.reduce((s, ex) => s + ex.sets, 0) ?? 0
  const totalCompleted = Object.values(exerciseLogs).reduce(
    (s, ex) => s + ex.sets.filter(set => set.completed).length, 0
  )

  // ── Persist helper ──────────────────────────────────────────────────────────

  const persistLog = useCallback((logs, completed = false) => {
    if (!workout) return
    // Fire-and-forget — optimistic update happens in context
    saveWorkoutLog({
      date:        dateStr,
      dayName:     workout.dayName,
      completedAt: completed ? new Date().toISOString() : undefined,
      exercises:   workout.exercises.map(ex => ({
        name:  ex.name,
        sets:  logs[ex.name]?.sets ?? [],
        notes: logs[ex.name]?.notes ?? '',
      })),
    })
  }, [workout, dateStr])

  // ── Set handlers ────────────────────────────────────────────────────────────

  const updateSet = useCallback((exerciseName, setIdx, field, value) => {
    setExerciseLogs(prev => {
      const exLog = prev[exerciseName]
      const sets  = [...exLog.sets]
      sets[setIdx] = { ...sets[setIdx], [field]: value }
      return { ...prev, [exerciseName]: { ...exLog, sets } }
    })
  }, [])

  const completeSet = useCallback((exerciseName, setIdx, restSeconds) => {
    setExerciseLogs(prev => {
      const exLog = prev[exerciseName]
      const sets  = [...exLog.sets]
      sets[setIdx] = { ...sets[setIdx], completed: true }

      // After completing the top set (set 0), auto-fill backdown weight
      // on any remaining sets that don't already have a weight entered.
      if (setIdx === 0 && sets[0].weight !== '') {
        const backdown = String(roundToNearest2_5(Number(sets[0].weight) * 0.875))
        for (let i = 1; i < sets.length; i++) {
          if (!sets[i].completed && sets[i].weight === '') {
            sets[i] = { ...sets[i], weight: backdown }
          }
        }
      }

      const next = { ...prev, [exerciseName]: { ...exLog, sets } }
      persistLog(next)
      return next
    })
    if (restSeconds > 0) {
      setRestTimer({ remaining: restSeconds, total: restSeconds })
    }
  }, [persistLog])

  const uncompleteSet = useCallback((exerciseName, setIdx) => {
    setExerciseLogs(prev => {
      const exLog = prev[exerciseName]
      const sets  = [...exLog.sets]
      sets[setIdx] = { ...sets[setIdx], completed: false }
      const next = { ...prev, [exerciseName]: { ...exLog, sets } }
      persistLog(next)
      return next
    })
  }, [persistLog])

  const addSet = useCallback((exerciseName) => {
    setExerciseLogs(prev => {
      const exLog = prev[exerciseName]
      return { ...prev, [exerciseName]: { ...exLog, sets: [...exLog.sets, emptySet()] } }
    })
  }, [])

  const updateNotes = useCallback((exerciseName, notes) => {
    setExerciseLogs(prev => {
      const next = { ...prev, [exerciseName]: { ...prev[exerciseName], notes } }
      persistLog(next)
      return next
    })
  }, [persistLog])

  const applyBackdownWeight = useCallback((exerciseName, weight) => {
    setExerciseLogs(prev => {
      const exLog = prev[exerciseName]
      if (!exLog) return prev
      const nextIdx = exLog.sets.findIndex(s => !s.completed)
      if (nextIdx === -1) return prev
      const sets = [...exLog.sets]
      sets[nextIdx] = { ...sets[nextIdx], weight: String(weight) }
      return { ...prev, [exerciseName]: { ...exLog, sets } }
    })
    if (workout) {
      const exIdx = workout.exercises.findIndex(ex => ex.name === exerciseName)
      if (exIdx >= 0) setExpandedIdx(exIdx)
    }
  }, [workout])

  // ── Finish workout ──────────────────────────────────────────────────────────

  const finishWorkout = useCallback(() => {
    persistLog(exerciseLogs, true)
    setIsFinished(true)
    // Collapse all cards
    setExpandedIdx(null)
  }, [exerciseLogs, persistLog])

  // ── Rest day / no plan / program not started ────────────────────────────────

  if (!workout) {
    if (!progDay) {
      return <ProgramNotStartedView programStartDate={profile.programStartDate} onNavigate={onNavigate} />
    }
    return <RestDayView onNavigate={onNavigate} />
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      <WorkoutHeader
        workout={workout}
        progWeek={progWeek}
        totalPlanned={totalPlanned}
        totalCompleted={totalCompleted}
        onRPEGuide={() => setShowRPEGuide(true)}
      />

      {/* Complete banner */}
      {isFinished && (
        <CompleteBanner
          totalCompleted={totalCompleted}
          dayName={workout.dayName}
          onNavigate={onNavigate}
        />
      )}

      {/* Exercise list */}
      <div className="flex flex-col gap-3 p-4">
        {workout.exercises.map((ex, idx) => {
          const prevExercise = prevLog?.exercises?.find(e => e.name === ex.name)
          return (
            <ExerciseCard
              key={ex.name}
              exercise={ex}
              exLog={exerciseLogs[ex.name] ?? { sets: Array.from({ length: ex.sets }, emptySet), notes: '' }}
              prevSets={prevExercise?.sets ?? null}
              isExpanded={expandedIdx === idx}
              onToggle={() => setExpandedIdx(prev => prev === idx ? null : idx)}
              onUpdateSet={(setIdx, field, value) => updateSet(ex.name, setIdx, field, value)}
              onCompleteSet={setIdx => completeSet(ex.name, setIdx, ex.restSeconds)}
              onUncompleteSet={setIdx => uncompleteSet(ex.name, setIdx)}
              onAddSet={() => addSet(ex.name)}
              onUpdateNotes={notes => updateNotes(ex.name, notes)}
              onOpenBackdown={(tw) => setBackdownSheet({ exerciseName: ex.name, topWeight: tw })}
            />
          )
        })}
      </div>

      {/* Finish workout — sticky bar above nav */}
      {totalCompleted > 0 && !isFinished && (
        <div className="sticky bottom-0 z-20 px-4 pt-2 pb-3 bg-gradient-to-t from-iron-bg via-iron-bg/95 to-transparent">
          <button
            onClick={finishWorkout}
            className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent"
          >
            Finish Workout — {totalCompleted} Sets
          </button>
        </div>
      )}

      {/* RPE Guide sheet */}
      {showRPEGuide && <RPEGuideSheet onClose={() => setShowRPEGuide(false)} />}

      {/* Backdown Calculator sheet */}
      {backdownSheet && (
        <BackdownSheet
          topWeight={backdownSheet.topWeight}
          onUseWeight={(weight) => applyBackdownWeight(backdownSheet.exerciseName, weight)}
          onClose={() => setBackdownSheet(null)}
        />
      )}

      {/* Rest timer */}
      {restTimer && !isFinished && (
        <RestTimerBar
          remaining={restTimer.remaining}
          total={restTimer.total}
          onDismiss={() => setRestTimer(null)}
        />
      )}

    </main>
  )
}
