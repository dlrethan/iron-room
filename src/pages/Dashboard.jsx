import { useState, useCallback } from 'react'
import {
  getProgramDay,
  getTodaysWorkout,
  getTodaysMeals,
  getMealLogForDate,
  saveMealLog,
  getUserProfile,
  getWorkoutLogForDate,
} from '../utils/storage'

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRAM_TOTAL_DAYS = 90

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatHeaderDate(date) {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return { weekday, monthDay }
}

function programPhase(weekNum) {
  // Weeks 1–5 = Month 1, 6–10 = Month 2, 11–15 = Month 3
  const month = Math.ceil(weekNum / 5)
  const weekInMonth = ((weekNum - 1) % 5) + 1
  const isDeload = weekInMonth === 5
  return { month, weekInMonth, isDeload }
}

function rpeShort(rpeTarget = '') {
  // "RPE 7 (3 RIR)" → "RPE 7"
  return rpeTarget.split(' (')[0]
}

function sumEatenMacros(mealPlanDay, mealLog) {
  const eaten = new Set((mealLog?.meals ?? []).filter(m => m.eaten).map(m => m.mealName))
  return (mealPlanDay?.meals ?? []).reduce(
    (acc, meal) => {
      if (!eaten.has(meal.mealName)) return acc
      return {
        calories: acc.calories + meal.macros.calories,
        protein:  acc.protein  + meal.macros.proteinG,
        fat:      acc.fat      + meal.macros.fatG,
        carbs:    acc.carbs    + meal.macros.carbsG,
      }
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )
}

// ─── Macro Ring ───────────────────────────────────────────────────────────────

function MacroRing({ label, logged, target, unit = 'g' }) {
  const R = 44
  const C = 2 * Math.PI * R
  const pct = target > 0 ? Math.min(logged / target, 1) : 0
  const offset = C * (1 - pct)
  const overTarget = logged > target
  const strokeColor = overTarget ? '#44FF88' : '#D4FF00'

  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      {/* SVG ring */}
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
          {/* Track */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth="6"
            strokeLinecap="butt"
          />
          {/* Progress fill */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={pct === 0 ? C : offset}
            transform="rotate(-90 50 50)"
            className="ring-progress"
          />
        </svg>
        {/* Centre percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[11px] text-iron-muted leading-none">
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>

      {/* Numbers below ring */}
      <div className="text-center">
        <p className="font-mono leading-none">
          <span className="text-[1.4rem] font-bold" style={{ color: overTarget ? '#44FF88' : '#F0F0F0' }}>
            {logged}
          </span>
          <span className="text-iron-muted text-sm">/{target}{unit}</span>
        </p>
        <p className="font-display text-[10px] uppercase tracking-[0.14em] text-iron-muted mt-1.5">
          {label}
        </p>
      </div>
    </div>
  )
}

// ─── Meal Card ────────────────────────────────────────────────────────────────

function MealCard({ meal, isEaten, onToggle }) {
  return (
    <div className={[
      'relative bg-iron-surface rounded-iron overflow-hidden',
      'border',
      isEaten ? 'border-iron-accent/40' : 'border-iron-border',
    ].join(' ')}>
      {/* Yellow left-edge accent when eaten */}
      {isEaten && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-iron-accent" />
      )}

      <div className={['flex items-center gap-3 p-3', isEaten ? 'pl-4' : ''].join(' ')}>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meal label row */}
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-display text-[11px] font-bold uppercase tracking-widest text-iron-muted">
              {meal.mealName}
            </span>
            {meal.sauce && (
              <span className="font-display text-[10px] text-iron-faint uppercase tracking-wider truncate">
                · {meal.sauce}
              </span>
            )}
          </div>

          {/* Food description */}
          <p className="font-mono text-[13px] text-iron-text leading-tight truncate">
            {meal.foods}
          </p>

          {/* Macros row */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="font-mono text-[11px] font-bold text-iron-accent">
              {meal.macros.proteinG}g P
            </span>
            <span className="font-mono text-[11px] text-iron-muted">
              {meal.macros.calories} cal
            </span>
            <span className="font-mono text-[11px] text-iron-muted">
              {meal.macros.fatG}g F
            </span>
            <span className="font-mono text-[11px] text-iron-muted">
              {meal.macros.carbsG}g C
            </span>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={[
            'press flex-shrink-0 flex items-center justify-center',
            'w-[52px] h-[52px] rounded-iron border',
            'font-display text-[11px] font-bold uppercase tracking-wider',
            isEaten
              ? 'bg-iron-accent/10 border-iron-accent text-iron-accent'
              : 'bg-transparent border-iron-border2 text-iron-muted',
          ].join(' ')}
          aria-label={isEaten ? `Mark ${meal.mealName} as not eaten` : `Mark ${meal.mealName} as eaten`}
          aria-pressed={isEaten}
        >
          {isEaten ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            'EAT'
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Workout Card ─────────────────────────────────────────────────────────────

function WorkoutCard({ workout, progWeek, isLogged, onStart }) {
  const { month, weekInMonth } = programPhase(progWeek)
  const rpe = rpeShort(workout.rpeTarget)

  return (
    <div className={[
      'bg-iron-surface border rounded-iron p-4',
      isLogged ? 'border-iron-success/40' : 'border-iron-border',
    ].join(' ')}>
      {/* Deload badge */}
      {workout.isDeload && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-iron border border-iron-warning text-iron-warning font-display text-[10px] font-bold uppercase tracking-widest mb-3">
          Deload Week
        </span>
      )}

      {/* Workout name — massive display type */}
      <h2 className="font-display font-black text-iron-text leading-none mb-1" style={{ fontSize: 'clamp(2.2rem, 10vw, 3rem)' }}>
        {workout.dayName} Day
      </h2>

      {/* Subline */}
      <p className="font-display text-iron-muted text-sm uppercase tracking-widest mb-4">
        Month {month}&nbsp;·&nbsp;Week {weekInMonth}&nbsp;·&nbsp;{rpe}
      </p>

      {/* Exercise count chip */}
      <p className="font-mono text-[12px] text-iron-muted mb-4">
        {workout.exercises.length} exercises&nbsp;
        <span className="text-iron-faint">
          · {workout.exercises.reduce((s, e) => s + e.sets, 0)} total sets
        </span>
      </p>

      {/* CTA */}
      {isLogged ? (
        <div className="flex items-center gap-2 h-[56px] px-4 rounded-iron border border-iron-success/50 bg-iron-success/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5L19 7" stroke="#44FF88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display font-bold text-iron-success uppercase tracking-wider text-sm">
            Workout Logged
          </span>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent"
        >
          Start Workout
        </button>
      )}
    </div>
  )
}

// ─── Rest Day Card ────────────────────────────────────────────────────────────

function RestDayCard() {
  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
      <h2 className="font-display font-black text-iron-text leading-none mb-1" style={{ fontSize: 'clamp(2.2rem, 10vw, 3rem)' }}>
        Rest Day
      </h2>
      <p className="font-display text-iron-muted text-sm uppercase tracking-widest mb-3">
        Recovery is growth
      </p>
      <p className="font-mono text-[13px] text-iron-muted leading-relaxed">
        No training scheduled today. Eat your protein, hydrate, and let the muscle repair.
      </p>
      <div className="mt-4 pt-4 border-t border-iron-border flex items-center gap-2">
        <span className="font-display text-[11px] uppercase tracking-widest text-iron-muted">
          Next session:
        </span>
        <span className="font-display text-[11px] uppercase tracking-widest text-iron-accent">
          Mon · Push Day
        </span>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ onNavigate }) {
  const today = new Date()
  const dateStr = todayISO()

  // Live data from storage
  const profile      = getUserProfile()
  const progDay      = getProgramDay(today)          // { day, week } | null
  const workout      = getTodaysWorkout(today)       // exercises + rpe | null
  const mealPlanDay  = getTodaysMeals(today)         // { dayOfWeek, meals } | null
  const existingLogs = getWorkoutLogForDate(dateStr) // array

  const isWorkoutLogged = existingLogs.length > 0

  // Meal log state (persisted)
  const [mealLog, setMealLog] = useState(
    () => getMealLogForDate(dateStr) ?? { date: dateStr, meals: [] }
  )

  const toggleMealEaten = useCallback((mealName) => {
    setMealLog(prev => {
      const meals = (mealPlanDay?.meals ?? []).map(m => {
        const existing = prev.meals.find(ml => ml.mealName === m.mealName)
        if (m.mealName === mealName) {
          return { mealName: m.mealName, eaten: !(existing?.eaten ?? false) }
        }
        return existing ?? { mealName: m.mealName, eaten: false }
      })
      const next = { date: dateStr, meals }
      saveMealLog(next)
      return next
    })
  }, [mealPlanDay, dateStr])

  // Derived
  const { weekday, monthDay } = formatHeaderDate(today)
  const loggedMacros = sumEatenMacros(mealPlanDay, mealLog)
  const progWeek = progDay?.week ?? 1
  const dayNum = progDay?.day ?? 1

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between px-4 pt-5 pb-4 border-b border-iron-border">
        <div>
          <h1 className="font-display font-black text-iron-text leading-none" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)' }}>
            {weekday}
          </h1>
          <p className="font-display text-iron-muted text-sm uppercase tracking-wider mt-0.5">
            {monthDay}
          </p>
        </div>

        {progDay ? (
          <div className="text-right">
            <p className="font-mono font-bold text-iron-accent leading-none" style={{ fontSize: 'clamp(1.1rem, 5vw, 1.4rem)' }}>
              Day {dayNum}
            </p>
            <p className="font-mono text-iron-muted text-xs mt-0.5">
              of {PROGRAM_TOTAL_DAYS}
            </p>
          </div>
        ) : (
          <span className="font-display text-[11px] uppercase tracking-widest text-iron-muted">
            Not started
          </span>
        )}
      </header>

      <div className="flex flex-col gap-4 p-4">

        {/* ── Workout card ─────────────────────────────────────────────────── */}
        {workout ? (
          <WorkoutCard
            workout={workout}
            progWeek={progWeek}
            isLogged={isWorkoutLogged}
            onStart={() => onNavigate('workout')}
          />
        ) : (
          <RestDayCard />
        )}

        {/* ── Macro rings ──────────────────────────────────────────────────── */}
        <section aria-label="Daily macro progress">
          <h3 className="font-display text-[11px] uppercase tracking-widest text-iron-muted mb-3">
            Today's Macros
          </h3>
          <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
            <div className="flex items-start justify-around gap-2">
              <MacroRing
                label="Protein"
                logged={loggedMacros.protein}
                target={profile.proteinTarget}
                unit="g"
              />
              <div className="w-px self-stretch bg-iron-border mx-2" />
              <MacroRing
                label="Calories"
                logged={loggedMacros.calories}
                target={profile.calorieTarget}
                unit=""
              />
            </div>

            {/* Secondary macros bar */}
            {loggedMacros.calories > 0 && (
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-iron-border">
                <span className="font-mono text-[11px] text-iron-muted">
                  <span className="text-iron-text">{loggedMacros.fat}g</span> fat
                </span>
                <span className="font-mono text-[11px] text-iron-muted">
                  <span className="text-iron-text">{loggedMacros.carbs}g</span> carbs
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Today's meals ─────────────────────────────────────────────────── */}
        <section aria-label="Today's meals">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-[11px] uppercase tracking-widest text-iron-muted">
              Today's Meals
            </h3>
            {mealPlanDay && (
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-faint">
                {mealLog.meals.filter(m => m.eaten).length} / {mealPlanDay.meals.length} eaten
              </span>
            )}
          </div>

          {mealPlanDay ? (
            <div className="flex flex-col gap-2">
              {mealPlanDay.meals.map(meal => {
                const logEntry = mealLog.meals.find(m => m.mealName === meal.mealName)
                return (
                  <MealCard
                    key={meal.mealName}
                    meal={meal}
                    isEaten={logEntry?.eaten ?? false}
                    onToggle={() => toggleMealEaten(meal.mealName)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
              <span className="font-mono text-[13px] text-iron-muted">No meal plan loaded.</span>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
