// ─── Pure utility functions ───────────────────────────────────────────────────
// These functions accept data directly instead of reading from storage.

// Days 1–4 of each 7-day program week are training days, 5–7 are rest.
const TRAINING_DAY_NAMES = ['Push', 'Pull', 'Legs', 'Upper']

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Returns { day, week } (1-based) relative to program start date.
 * Returns null if program hasn't started yet.
 */
export function getProgramDay(today = new Date(), programStartDate) {
  const start = new Date(programStartDate + 'T00:00:00')
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffMs = todayMidnight - start
  if (diffMs < 0) return null
  const dayNumber  = Math.floor(diffMs / 86_400_000) + 1
  const weekNumber = Math.ceil(dayNumber / 7)
  return { day: dayNumber, week: weekNumber }
}

/**
 * Returns the active workout plan from the plans array + active IDs.
 */
export function getActiveWorkoutPlan(workoutPlans, activeWorkoutPlanId) {
  if (!activeWorkoutPlanId) return null
  return workoutPlans.find(p => p.id === activeWorkoutPlanId) ?? null
}

/**
 * Returns the active meal plan from the plans array + active IDs.
 */
export function getActiveMealPlan(mealPlans, activeMealPlanId) {
  if (!activeMealPlanId) return null
  return mealPlans.find(p => p.id === activeMealPlanId) ?? null
}

/**
 * Returns today's workout from the active plan based on program day offset,
 * or null if it's a rest day (days 5–7 of each 7-day cycle) or no plan loaded.
 */
export function getTodaysWorkout(today = new Date(), workoutPlans, activeWorkoutPlanId, programStartDate) {
  const prog = getProgramDay(today, programStartDate)
  if (!prog) return null

  // Within each 7-day cycle: days 1–4 train, days 5–7 rest
  const dayInCycle = ((prog.day - 1) % 7) + 1
  if (dayInCycle > 4) return null

  const dayName = TRAINING_DAY_NAMES[dayInCycle - 1]

  const plan = getActiveWorkoutPlan(workoutPlans, activeWorkoutPlanId)
  if (!plan) return null

  const week = plan.weeks.find(w => w.weekNumber === prog.week)
  if (!week) return null

  const day = week.days.find(d => d.dayName === dayName)
  return day ? { ...day, rpeTarget: week.rpeTarget, isDeload: week.isDeload } : null
}

/**
 * Returns today's meals from the active meal plan, or null.
 */
export function getTodaysMeals(today = new Date(), mealPlans, activeMealPlanId) {
  const plan = getActiveMealPlan(mealPlans, activeMealPlanId)
  if (!plan) return null
  const dayName = DAY_NAMES[today.getDay()]
  return plan.days.find(d => d.dayOfWeek === dayName) ?? null
}

/**
 * Returns all workout logs for a given date string.
 */
export function getWorkoutLogForDate(workoutLogs, dateStr) {
  return workoutLogs.filter(l => l.date === dateStr)
}

/**
 * Returns the most recent log for a given workout day name before a date.
 */
export function getPreviousLogForDay(workoutLogs, dayName, beforeDate) {
  return workoutLogs
    .filter(l => l.dayName === dayName && l.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0] ?? null
}

/**
 * Returns the meal log for a given date string, or null.
 */
export function getMealLogForDate(mealLogs, dateStr) {
  return mealLogs.find(l => l.date === dateStr) ?? null
}

/**
 * Returns the next scheduled training day after a given date based on program
 * day offset. Returns { workoutName } or null.
 */
export function getNextWorkoutDay(today = new Date(), programStartDate) {
  for (let i = 1; i <= 7; i++) {
    const next = new Date(today)
    next.setDate(today.getDate() + i)
    const prog = getProgramDay(next, programStartDate)
    if (!prog) continue
    const dayInCycle = ((prog.day - 1) % 7) + 1
    if (dayInCycle <= 4) {
      return { workoutName: TRAINING_DAY_NAMES[dayInCycle - 1] }
    }
  }
  return null
}
