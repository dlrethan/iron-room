import { useState, useRef, useCallback } from 'react'
import {
  getWeightLog,
  addWeightEntry,
  getWorkoutLogs,
  getUserProfile,
} from '../utils/storage'

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Derive strength PRs — best weight × reps per exercise across all logs
function computePRs(logs) {
  const map = {}
  logs.forEach(log => {
    log.exercises?.forEach(ex => {
      ex.sets?.forEach(set => {
        if (!set.completed || !set.weight) return
        const w = Number(set.weight)
        if (w <= 0) return
        if (!map[ex.name] || w > map[ex.name].weight) {
          map[ex.name] = { weight: w, reps: set.reps, date: log.date, dayName: log.dayName }
        }
      })
    })
  })
  return Object.entries(map)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ─── Weight Chart (SVG) ───────────────────────────────────────────────────────

const SVG_W   = 360
const SVG_H   = 200
const PAD     = { top: 14, right: 18, bottom: 28, left: 40 }
const INNER_W = SVG_W - PAD.left - PAD.right
const INNER_H = SVG_H - PAD.top  - PAD.bottom

function WeightChart({ entries, startWeight }) {
  if (!entries.length) return null

  const weights   = entries.map(e => e.weightLbs)
  const rawMin    = Math.min(...weights, startWeight)
  const rawMax    = Math.max(...weights, startWeight)
  const spread    = Math.max(rawMax - rawMin, 10)
  const minW      = rawMin - spread * 0.15
  const maxW      = rawMax + spread * 0.15

  const xPos = i =>
    PAD.left + (entries.length === 1 ? INNER_W / 2 : (i / (entries.length - 1)) * INNER_W)
  const yPos = w =>
    PAD.top + INNER_H - ((w - minW) / (maxW - minW)) * INNER_H

  // Y-axis ticks (every 5 lbs, rounded to nearest 5)
  const tickStep = 5
  const tickStart = Math.ceil(minW / tickStep) * tickStep
  const yTicks = []
  for (let w = tickStart; w <= maxW; w += tickStep) yTicks.push(w)

  const points  = entries.map((e, i) => ({ x: xPos(i), y: yPos(e.weightLbs), e }))
  const linePts = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const refY    = yPos(startWeight)

  // X labels: show all if ≤ 7, else first/last/every 3rd
  const showXLabel = i =>
    entries.length <= 7 || i === 0 || i === entries.length - 1 || i % 3 === 0

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Weight progress chart"
    >
      {/* Y-axis grid lines + labels */}
      {yTicks.map(w => (
        <g key={w}>
          <line
            x1={PAD.left} y1={yPos(w)}
            x2={SVG_W - PAD.right} y2={yPos(w)}
            stroke="#2A2A2A" strokeWidth="1"
          />
          <text
            x={PAD.left - 5} y={yPos(w)}
            textAnchor="end" dominantBaseline="middle"
            fill="#555555" fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            {w}
          </text>
        </g>
      ))}

      {/* Starting weight reference line */}
      <line
        x1={PAD.left} y1={refY}
        x2={SVG_W - PAD.right} y2={refY}
        stroke="#888888" strokeWidth="1" strokeDasharray="5,3"
      />
      <text
        x={SVG_W - PAD.right + 3} y={refY}
        dominantBaseline="middle"
        fill="#888888" fontSize="8"
        fontFamily="JetBrains Mono, monospace"
      >
        {startWeight}
      </text>

      {/* Acid yellow line */}
      {points.length > 1 && (
        <polyline
          points={linePts}
          fill="none"
          stroke="#D4FF00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Area fill under line */}
      {points.length > 1 && (
        <polyline
          points={`${points[0].x.toFixed(1)},${(SVG_H - PAD.bottom).toFixed(1)} ${linePts} ${points[points.length - 1].x.toFixed(1)},${(SVG_H - PAD.bottom).toFixed(1)}`}
          fill="url(#chartGrad)"
          stroke="none"
        />
      )}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4FF00" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D4FF00" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Dots + X labels */}
      {points.map((p, i) => (
        <g key={i}>
          {/* Dot halo */}
          <circle cx={p.x} cy={p.y} r="7" fill="#D4FF00" fillOpacity="0.12" />
          {/* Dot */}
          <circle cx={p.x} cy={p.y} r="4" fill="#D4FF00" />
          {/* X-axis label */}
          {showXLabel(i) && (
            <text
              x={p.x} y={SVG_H - 4}
              textAnchor="middle"
              fill="#555555" fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatDate(p.e.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ─── PR Table ─────────────────────────────────────────────────────────────────

function PRTable({ prs }) {
  if (!prs.length) {
    return (
      <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
        <p className="font-mono text-[13px] text-iron-muted">
          No strength data yet. Complete a workout to see your PRs here.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 border-b border-iron-border bg-iron-bg">
        <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted">Exercise</span>
        <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted text-right">Best</span>
        <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted text-right">Date</span>
      </div>

      {prs.map((pr, i) => (
        <div
          key={pr.name}
          className={[
            'grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-3',
            i < prs.length - 1 ? 'border-b border-iron-border' : '',
          ].join(' ')}
        >
          <span className="font-display font-bold text-iron-text text-sm uppercase leading-tight">
            {pr.name}
          </span>
          <span className="font-mono text-sm text-iron-accent font-bold text-right whitespace-nowrap">
            {pr.weight}<span className="text-iron-muted text-xs font-normal">lb</span>
            {' × '}
            {pr.reps}
          </span>
          <span className="font-mono text-[11px] text-iron-muted text-right whitespace-nowrap">
            {formatDate(pr.date)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Weight Log List ──────────────────────────────────────────────────────────

function WeightLogList({ entries }) {
  if (!entries.length) return null

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
      <div className="px-4 py-2 border-b border-iron-border bg-iron-bg flex items-baseline justify-between">
        <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted">Date</span>
        <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted">Weight</span>
      </div>
      {sorted.map((e, i) => (
        <div
          key={e.date}
          className={[
            'flex items-center justify-between px-4 py-3',
            i < sorted.length - 1 ? 'border-b border-iron-border' : '',
          ].join(' ')}
        >
          <span className="font-mono text-[13px] text-iron-muted">{formatDate(e.date)}</span>
          <span className="font-mono text-base font-bold text-iron-text">
            {e.weightLbs}
            <span className="text-iron-muted text-xs font-normal"> lb</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── 1RM Estimator ────────────────────────────────────────────────────────────

function OneRMEstimator({ exerciseNames, prs }) {
  const [exercise, setExercise] = useState('')
  const [weight, setWeight]     = useState('')
  const [reps, setReps]         = useState('')

  const w = parseFloat(weight)
  const r = parseInt(reps, 10)
  const estimated = (w > 0 && r >= 1)
    ? Math.round((w * (1 + r / 30)) / 2.5) * 2.5
    : null

  // PR for selected exercise — used as context
  const pr = exercise ? prs.find(p => p.name === exercise) : null
  const prEst = pr ? Math.round((pr.weight * (1 + pr.reps / 30)) / 2.5) * 2.5 : null

  const inputClass = [
    'w-full h-[56px] bg-iron-bg border border-iron-border rounded-iron',
    'font-mono text-base text-iron-text text-center',
    'placeholder:text-iron-faint',
    'focus:border-iron-accent focus:shadow-accent-ring',
  ].join(' ')

  return (
    <div className="flex flex-col gap-4">
      {/* Exercise selector */}
      {exerciseNames.length > 0 && (
        <div>
          <label className="block font-display text-[10px] uppercase tracking-widest text-iron-muted mb-1.5">
            Exercise
          </label>
          <div className="relative">
            <select
              value={exercise}
              onChange={e => setExercise(e.target.value)}
              className={[
                'w-full h-[52px] bg-iron-bg border border-iron-border rounded-iron',
                'font-mono text-[13px] text-iron-text pl-3 pr-8',
                'focus:border-iron-accent focus:shadow-accent-ring',
                'appearance-none',
              ].join(' ')}
            >
              <option value="">Select exercise…</option>
              {exerciseNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {/* Chevron */}
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-iron-muted pointer-events-none"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Weight + Reps inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-display text-[10px] uppercase tracking-widest text-iron-accent mb-1.5">
            Weight
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              placeholder="225"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[9px] uppercase tracking-wider text-iron-faint pointer-events-none">
              lb
            </span>
          </div>
        </div>
        <div>
          <label className="block font-display text-[10px] uppercase tracking-widest text-iron-muted mb-1.5">
            Reps
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="5"
            value={reps}
            onChange={e => setReps(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Result */}
      {estimated !== null ? (
        <div className="bg-iron-bg border border-iron-border rounded-iron py-5 px-4 text-center">
          <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted block mb-2">
            Estimated 1RM
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className="font-mono font-bold text-iron-accent"
              style={{ fontSize: 'clamp(2.8rem, 14vw, 4rem)', lineHeight: 1 }}
            >
              {estimated}
            </span>
            <span className="font-display font-black text-iron-muted text-xl uppercase">lb</span>
          </div>
          <p className="font-mono text-[11px] text-iron-faint mt-2">
            {weight} × (1 + {reps}/30) · Epley
          </p>
          {prEst !== null && (
            <p className="font-mono text-[11px] text-iron-muted mt-1">
              PR est: <span className="text-iron-text">{prEst} lb</span>
              {estimated !== prEst && (
                <span className={estimated > prEst ? ' text-iron-success' : ' text-iron-danger'}>
                  {' '}{estimated > prEst ? '+' : ''}{estimated - prEst} lb
                </span>
              )}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-iron-bg border border-dashed border-iron-border rounded-iron p-4 text-center">
          <p className="font-mono text-[13px] text-iron-faint">
            Enter weight and reps to estimate your 1RM
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Progress Component ──────────────────────────────────────────────────

export default function Progress() {
  const dateStr    = todayISO()
  const profile    = getUserProfile()
  const startWeight = profile.startingWeight ?? 280

  const [weightLog, setWeightLog] = useState(() => getWeightLog())
  const [prs]                     = useState(() => computePRs(getWorkoutLogs()))
  const [inputVal, setInputVal]   = useState('')
  const [inputError, setInputError] = useState('')
  const inputRef = useRef()

  const logWeight = useCallback(() => {
    const val = parseFloat(inputVal)
    if (!inputVal || isNaN(val) || val < 50 || val > 700) {
      setInputError('Enter a valid weight between 50–700 lbs.')
      inputRef.current?.focus()
      return
    }
    setInputError('')
    addWeightEntry({ date: dateStr, weightLbs: val })
    setWeightLog(getWeightLog())
    setInputVal('')
  }, [inputVal, dateStr])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') logWeight()
  }

  const sortedEntries = [...weightLog].sort((a, b) => a.date.localeCompare(b.date))
  const todayLogged   = weightLog.find(e => e.date === dateStr)

  // Net change from start
  const latestEntry  = sortedEntries[sortedEntries.length - 1]
  const netChange    = latestEntry ? +(latestEntry.weightLbs - startWeight).toFixed(1) : null

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-iron-border">
        <h1 className="font-display font-black text-iron-text uppercase leading-none" style={{ fontSize: 'clamp(2rem, 9vw, 2.8rem)' }}>
          Progress
        </h1>
        {netChange !== null && (
          <p className="font-mono text-sm mt-1">
            <span className={netChange <= 0 ? 'text-iron-success' : 'text-iron-danger'}>
              {netChange > 0 ? '+' : ''}{netChange} lb
            </span>
            <span className="text-iron-muted"> from {startWeight} lb start</span>
          </p>
        )}
      </header>

      <div className="flex flex-col gap-5 p-4">

        {/* ── Weigh-in input ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-bold text-iron-text uppercase text-lg">
              Weekly Weigh-In
            </h2>
            {todayLogged && (
              <span className="font-mono text-[11px] text-iron-success">
                ✓ {todayLogged.weightLbs} lb logged today
              </span>
            )}
          </div>

          <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
            <div className="flex gap-3 items-center">
              {/* Large weight input */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  placeholder="280.0"
                  value={inputVal}
                  onChange={e => { setInputVal(e.target.value); setInputError('') }}
                  onKeyDown={handleKeyDown}
                  className={[
                    'w-full bg-iron-bg border rounded-iron',
                    'font-mono font-bold text-iron-text text-center placeholder:text-iron-faint',
                    'focus:border-iron-accent focus:shadow-accent-ring',
                    inputError ? 'border-iron-danger' : 'border-iron-border',
                  ].join(' ')}
                  style={{ fontSize: 'clamp(1.5rem, 7vw, 2rem)', height: '64px' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-xs uppercase tracking-widest text-iron-muted pointer-events-none">
                  lb
                </span>
              </div>

              {/* Log button */}
              <button
                onClick={logWeight}
                className="press flex-shrink-0 h-[64px] px-5 bg-iron-accent text-iron-bg font-display font-black text-sm uppercase tracking-wider rounded-iron border-0 glow-accent"
              >
                Log
              </button>
            </div>

            {inputError && (
              <p className="font-mono text-[12px] text-iron-danger mt-2">{inputError}</p>
            )}
          </div>
        </section>

        {/* ── Weight chart ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-display font-bold text-iron-text uppercase text-lg mb-3">
            Weight Over Time
          </h2>

          {sortedEntries.length === 0 ? (
            <div className="bg-iron-surface border border-iron-border rounded-iron p-6 text-center">
              <p className="font-mono text-[13px] text-iron-muted">
                No weigh-ins logged yet. Add your first one above.
              </p>
            </div>
          ) : (
            <div className="bg-iron-surface border border-iron-border rounded-iron p-3">
              <WeightChart entries={sortedEntries} startWeight={startWeight} />
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-iron-border">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-[2px] bg-iron-accent" />
                  <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted">Weight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-[1px] bg-iron-muted" style={{ backgroundImage: 'repeating-linear-gradient(to right, #888 0, #888 4px, transparent 4px, transparent 8px)' }} />
                  <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted">Start ({startWeight} lb)</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent log */}
        {sortedEntries.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-iron-text uppercase text-lg mb-3">
              Recent Entries
            </h2>
            <WeightLogList entries={weightLog} />
          </section>
        )}

        {/* ── Strength PRs ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-bold text-iron-text uppercase text-lg">
              Strength PRs
            </h2>
            {prs.length > 0 && (
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
                {prs.length} exercises
              </span>
            )}
          </div>
          <PRTable prs={prs} />
        </section>

        {/* ── 1RM Estimator ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-bold text-iron-text uppercase text-lg">
              1RM Estimator
            </h2>
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              Epley formula
            </span>
          </div>
          <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
            <OneRMEstimator exerciseNames={prs.map(p => p.name)} prs={prs} />
          </div>
        </section>

      </div>
    </main>
  )
}
