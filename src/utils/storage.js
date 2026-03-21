import {
  seedWorkoutPlan,
  seedMealPlan,
  defaultUserProfile,
  DEFAULT_PROGRAM_START_DATE,
} from "../data/seedData";

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  workoutPlans:     "workoutPlans",
  mealPlans:        "mealPlans",
  activePlanIds:    "activePlanIds",
  workoutLogs:      "workoutLogs",
  mealLogs:         "mealLogs",
  weightLog:        "weightLog",
  programStartDate: "programStartDate",
  userProfile:      "userProfile",
};

// ─── Raw helpers ──────────────────────────────────────────────────────────────

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Seeding ──────────────────────────────────────────────────────────────────

/**
 * Call once on app startup. If localStorage has no data, seeds everything.
 * Returns true if data was seeded (first launch), false otherwise.
 */
export function seedIfEmpty() {
  if (read(KEYS.workoutPlans) !== null) return false; // already seeded

  const workoutPlan = { ...seedWorkoutPlan, id: crypto.randomUUID() };
  const mealPlan    = { ...seedMealPlan,    id: crypto.randomUUID() };

  write(KEYS.workoutPlans,     [workoutPlan]);
  write(KEYS.mealPlans,        [mealPlan]);
  write(KEYS.activePlanIds,    { workoutPlanId: workoutPlan.id, mealPlanId: mealPlan.id });
  write(KEYS.workoutLogs,      []);
  write(KEYS.mealLogs,         []);
  write(KEYS.weightLog,        []);
  write(KEYS.programStartDate, DEFAULT_PROGRAM_START_DATE);
  write(KEYS.userProfile,      defaultUserProfile);

  return true;
}

// ─── Workout Plans ────────────────────────────────────────────────────────────

export function getWorkoutPlans() {
  return read(KEYS.workoutPlans) ?? [];
}

export function saveWorkoutPlan(plan) {
  const plans = getWorkoutPlans();
  const existing = plans.findIndex((p) => p.id === plan.id);
  if (existing >= 0) {
    plans[existing] = plan;
  } else {
    plans.push({ ...plan, id: plan.id ?? crypto.randomUUID() });
  }
  write(KEYS.workoutPlans, plans);
  return plans;
}

export function getActiveWorkoutPlan() {
  const { workoutPlanId } = getActivePlanIds();
  return getWorkoutPlans().find((p) => p.id === workoutPlanId) ?? null;
}

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export function getMealPlans() {
  return read(KEYS.mealPlans) ?? [];
}

export function saveMealPlan(plan) {
  const plans = getMealPlans();
  const existing = plans.findIndex((p) => p.id === plan.id);
  if (existing >= 0) {
    plans[existing] = plan;
  } else {
    plans.push({ ...plan, id: plan.id ?? crypto.randomUUID() });
  }
  write(KEYS.mealPlans, plans);
  return plans;
}

export function getActiveMealPlan() {
  const { mealPlanId } = getActivePlanIds();
  return getMealPlans().find((p) => p.id === mealPlanId) ?? null;
}

// ─── Active Plan IDs ──────────────────────────────────────────────────────────

export function getActivePlanIds() {
  return read(KEYS.activePlanIds) ?? { workoutPlanId: null, mealPlanId: null };
}

export function setActivePlanIds({ workoutPlanId, mealPlanId }) {
  write(KEYS.activePlanIds, { workoutPlanId, mealPlanId });
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

/**
 * @typedef {{ date: string, dayName: string, exercises: Array<{ name: string, sets: Array<{ weight: number, reps: number, rpe: number }>, notes?: string }> }} WorkoutLog
 */

export function getWorkoutLogs() {
  return read(KEYS.workoutLogs) ?? [];
}

export function saveWorkoutLog(log) {
  const logs = getWorkoutLogs();
  const existing = logs.findIndex((l) => l.date === log.date && l.dayName === log.dayName);
  if (existing >= 0) {
    logs[existing] = log;
  } else {
    logs.push(log);
  }
  write(KEYS.workoutLogs, logs);
}

export function getWorkoutLogForDate(dateStr) {
  return getWorkoutLogs().filter((l) => l.date === dateStr);
}

export function getPreviousLogForDay(dayName, beforeDate) {
  return getWorkoutLogs()
    .filter((l) => l.dayName === dayName && l.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0] ?? null;
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

/**
 * @typedef {{ date: string, meals: Array<{ mealName: string, eaten: boolean, customMacros?: object }> }} MealLog
 */

export function getMealLogs() {
  return read(KEYS.mealLogs) ?? [];
}

export function saveMealLog(log) {
  const logs = getMealLogs();
  const existing = logs.findIndex((l) => l.date === log.date);
  if (existing >= 0) {
    logs[existing] = log;
  } else {
    logs.push(log);
  }
  write(KEYS.mealLogs, logs);
}

export function getMealLogForDate(dateStr) {
  return getMealLogs().find((l) => l.date === dateStr) ?? null;
}

// ─── Weight Log ───────────────────────────────────────────────────────────────

export function getWeightLog() {
  return read(KEYS.weightLog) ?? [];
}

export function addWeightEntry(entry) {
  const log = getWeightLog();
  const existing = log.findIndex((e) => e.date === entry.date);
  if (existing >= 0) {
    log[existing] = entry;
  } else {
    log.push(entry);
  }
  log.sort((a, b) => (a.date < b.date ? -1 : 1));
  write(KEYS.weightLog, log);
}

// ─── Program Start Date ───────────────────────────────────────────────────────

export function getProgramStartDate() {
  return read(KEYS.programStartDate) ?? DEFAULT_PROGRAM_START_DATE;
}

export function setProgramStartDate(dateStr) {
  write(KEYS.programStartDate, dateStr);
}

/**
 * Returns { day, week } (1-based) relative to program start date.
 * Returns null if program hasn't started yet.
 */
export function getProgramDay(today = new Date()) {
  const start = new Date(getProgramStartDate() + "T00:00:00");
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffMs = todayMidnight - start;
  if (diffMs < 0) return null;
  const dayNumber  = Math.floor(diffMs / 86_400_000) + 1;
  const weekNumber = Math.ceil(dayNumber / 7);
  return { day: dayNumber, week: weekNumber };
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function getUserProfile() {
  return read(KEYS.userProfile) ?? defaultUserProfile;
}

export function saveUserProfile(profile) {
  write(KEYS.userProfile, profile);
}

// ─── Utility: today's workout day ────────────────────────────────────────────

const DAY_TO_WORKOUT = {
  Monday:    "Push",
  Wednesday: "Pull",
  Friday:    "Legs",
  Saturday:  "Upper",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Returns the workout day name ("Push", "Pull", etc.) for a given Date,
 * or null if it's a rest day.
 */
export function getWorkoutDayName(date = new Date()) {
  return DAY_TO_WORKOUT[DAY_NAMES[date.getDay()]] ?? null;
}

/**
 * Given a week number (1-based), returns the matching week object
 * from the active workout plan, or null.
 */
export function getWorkoutWeek(weekNumber) {
  const plan = getActiveWorkoutPlan();
  if (!plan) return null;
  return plan.weeks.find((w) => w.weekNumber === weekNumber) ?? null;
}

/**
 * Returns today's workout exercises from the active plan,
 * or null if it's a rest day or no plan loaded.
 */
export function getTodaysWorkout(today = new Date()) {
  const prog = getProgramDay(today);
  if (!prog) return null;

  const dayName = getWorkoutDayName(today);
  if (!dayName) return null;

  const week = getWorkoutWeek(prog.week);
  if (!week) return null;

  const day = week.days.find((d) => d.dayName === dayName);
  return day ? { ...day, rpeTarget: week.rpeTarget, isDeload: week.isDeload } : null;
}

/**
 * Returns today's meals from the active meal plan, or null.
 */
export function getTodaysMeals(today = new Date()) {
  const plan = getActiveMealPlan();
  if (!plan) return null;
  const dayName = DAY_NAMES[today.getDay()];
  return plan.days.find((d) => d.dayOfWeek === dayName) ?? null;
}
