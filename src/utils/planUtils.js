// ─── Pure utility functions ───────────────────────────────────────────────────
// These functions accept data directly instead of reading from storage.

const DAY_TO_WORKOUT = {
  Monday:    'Push',
  Wednesday: 'Pull',
  Friday:    'Legs',
  Saturday:  'Upper',
}

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
 * Returns the workout day name ("Push", "Pull", etc.) for a given Date,
 * or null if it's a rest day.
 */
export function getWorkoutDayName(date = new Date()) {
  return DAY_TO_WORKOUT[DAY_NAMES[date.getDay()]] ?? null
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
 * Returns today's workout exercises from the active plan,
 * or null if it's a rest day or no plan loaded.
 */
export function getTodaysWorkout(today = new Date(), workoutPlans, activeWorkoutPlanId, programStartDate) {
  const prog = getProgramDay(today, programStartDate)
  if (!prog) return null

  const dayName = getWorkoutDayName(today)
  if (!dayName) return null

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
 * Returns the next scheduled workout day after a given date.
 * Returns { dayName, workoutName } or null.
 */
export function getNextWorkoutDay(today = new Date()) {
  for (let i = 1; i <= 7; i++) {
    const next = new Date(today)
    next.setDate(today.getDate() + i)
    const dayName = DAY_NAMES[next.getDay()]
    if (DAY_TO_WORKOUT[dayName]) {
      return { dayName, workoutName: DAY_TO_WORKOUT[dayName] }
    }
  }
  return null
}
