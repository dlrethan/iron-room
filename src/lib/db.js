import { supabase } from './supabase'

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session.user.id
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function rowToProfile(row) {
  return {
    displayName:         row.display_name ?? null,
    role:                row.role ?? 'athlete',
    onboarded:           row.onboarded ?? false,
    isAdmin:             row.is_admin ?? false,
    startingWeight:      row.starting_weight,
    calorieTarget:       row.calorie_target,
    proteinTarget:       row.protein_target,
    fatTarget:           row.fat_target,
    carbsTarget:         row.carbs_target,
    programStartDate:    row.program_start_date,
    activeWorkoutPlanId: row.active_workout_plan_id,
    activeMealPlanId:    row.active_meal_plan_id,
  }
}

function profileToRow(p, userId) {
  return {
    user_id:                 userId,
    display_name:            p.displayName ?? null,
    role:                    p.role ?? 'athlete',
    onboarded:               p.onboarded ?? false,
    is_admin:                p.isAdmin ?? false,
    starting_weight:         p.startingWeight,
    calorie_target:          p.calorieTarget,
    protein_target:          p.proteinTarget,
    fat_target:              p.fatTarget,
    carbs_target:            p.carbsTarget,
    program_start_date:      p.programStartDate,
    active_workout_plan_id:  p.activeWorkoutPlanId ?? null,
    active_meal_plan_id:     p.activeMealPlanId ?? null,
  }
}

// Plans: stored as { id, plan_name, created_at, data: { all other fields } }
// JS shape: { id, planName, planType, createdAt, weeks/days/dailyTargets... }
function rowToPlan(row) {
  return { id: row.id, ...row.data }
}

function planToRow(plan, userId) {
  const { id, ...data } = plan
  return { id, user_id: userId, plan_name: data.planName, data }
}

function rowToWorkoutLog(row) {
  return {
    date:        row.date,
    dayName:     row.day_name,
    completedAt: row.completed_at ?? undefined,
    exercises:   row.exercises ?? [],
  }
}

function workoutLogToRow(log, userId) {
  return {
    user_id:      userId,
    date:         log.date,
    day_name:     log.dayName,
    completed_at: log.completedAt ?? null,
    exercises:    log.exercises ?? [],
  }
}

function rowToMealLog(row) {
  return {
    date:          row.date,
    meals:         row.meals ?? [],
    customEntries: row.custom_entries ?? [],
  }
}

function mealLogToRow(log, userId) {
  return {
    user_id:        userId,
    date:           log.date,
    meals:          log.meals ?? [],
    custom_entries: log.customEntries ?? [],
  }
}

function rowToWeightEntry(row) {
  return { date: row.date, weightLbs: row.weight_lbs }
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function fetchProfile() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const { data } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle()
  return data ? rowToProfile(data) : null
}

export async function upsertProfile(profile) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('user_profile')
    .upsert(profileToRow(profile, userId), { onConflict: 'user_id' })
  if (error) throw error
}

// ─── Workout Plans ────────────────────────────────────────────────────────────

export async function fetchWorkoutPlans() {
  const { data, error } = await supabase.from('workout_plans').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToPlan)
}

export async function upsertWorkoutPlan(plan) {
  const userId = await getUserId()
  const { error } = await supabase.from('workout_plans').upsert(planToRow(plan, userId))
  if (error) throw error
}

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export async function fetchMealPlans() {
  const { data, error } = await supabase.from('meal_plans').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToPlan)
}

export async function upsertMealPlan(plan) {
  const userId = await getUserId()
  const { error } = await supabase.from('meal_plans').upsert(planToRow(plan, userId))
  if (error) throw error
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function fetchWorkoutLogs() {
  const { data, error } = await supabase.from('workout_logs').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToWorkoutLog)
}

export async function upsertWorkoutLog(log) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('workout_logs')
    .upsert(workoutLogToRow(log, userId), { onConflict: 'user_id,date,day_name' })
  if (error) throw error
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export async function fetchMealLogs() {
  const { data, error } = await supabase.from('meal_logs').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToMealLog)
}

export async function upsertMealLog(log) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('meal_logs')
    .upsert(mealLogToRow(log, userId), { onConflict: 'user_id,date' })
  if (error) throw error
}

// ─── Weight Log ───────────────────────────────────────────────────────────────

export async function fetchWeightLog() {
  const { data, error } = await supabase.from('weight_log').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToWeightEntry)
}

export async function upsertWeightEntry(entry) {
  const userId = await getUserId()
  const { error } = await supabase
    .from('weight_log')
    .upsert({ user_id: userId, date: entry.date, weight_lbs: entry.weightLbs }, { onConflict: 'user_id,date' })
  if (error) throw error
}

export async function deleteWeightEntry(date) {
  const { error } = await supabase.from('weight_log').delete().eq('date', date)
  if (error) throw error
}

// ─── Reset (danger zone) ──────────────────────────────────────────────────────

export async function deleteAllUserData() {
  const userId = await getUserId()
  await Promise.all([
    supabase.from('workout_logs').delete().eq('user_id', userId),
    supabase.from('meal_logs').delete().eq('user_id', userId),
    supabase.from('weight_log').delete().eq('user_id', userId),
    supabase.from('workout_plans').delete().eq('user_id', userId),
    supabase.from('meal_plans').delete().eq('user_id', userId),
    supabase.from('user_profile').delete().eq('user_id', userId),
  ])
}
