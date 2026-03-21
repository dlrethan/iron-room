import { supabase } from './supabase'

// ─── Normalizers ──────────────────────────────────────────────────────────────

function rowToProfile(row) {
  return {
    startingWeight:      row.starting_weight,
    calorieTarget:       row.calorie_target,
    proteinTarget:       row.protein_target,
    fatTarget:           row.fat_target,
    programStartDate:    row.program_start_date,
    activeWorkoutPlanId: row.active_workout_plan_id,
    activeMealPlanId:    row.active_meal_plan_id,
  }
}

function profileToRow(p) {
  return {
    id:                      1,
    starting_weight:         p.startingWeight,
    calorie_target:          p.calorieTarget,
    protein_target:          p.proteinTarget,
    fat_target:              p.fatTarget,
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

function planToRow(plan) {
  const { id, ...data } = plan
  return { id, plan_name: data.planName, data }
}

function rowToWorkoutLog(row) {
  return {
    date:        row.date,
    dayName:     row.day_name,
    completedAt: row.completed_at ?? undefined,
    exercises:   row.exercises ?? [],
  }
}

function workoutLogToRow(log) {
  return {
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

function mealLogToRow(log) {
  return {
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
  const { data } = await supabase.from('user_profile').select('*').eq('id', 1).maybeSingle()
  return data ? rowToProfile(data) : null
}

export async function upsertProfile(profile) {
  const { error } = await supabase.from('user_profile').upsert(profileToRow(profile))
  if (error) throw error
}

// ─── Workout Plans ────────────────────────────────────────────────────────────

export async function fetchWorkoutPlans() {
  const { data, error } = await supabase.from('workout_plans').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToPlan)
}

export async function upsertWorkoutPlan(plan) {
  const { error } = await supabase.from('workout_plans').upsert(planToRow(plan))
  if (error) throw error
}

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export async function fetchMealPlans() {
  const { data, error } = await supabase.from('meal_plans').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(rowToPlan)
}

export async function upsertMealPlan(plan) {
  const { error } = await supabase.from('meal_plans').upsert(planToRow(plan))
  if (error) throw error
}

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export async function fetchWorkoutLogs() {
  const { data, error } = await supabase.from('workout_logs').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToWorkoutLog)
}

export async function upsertWorkoutLog(log) {
  const row = workoutLogToRow(log)
  const { error } = await supabase
    .from('workout_logs')
    .upsert(row, { onConflict: 'date,day_name' })
  if (error) throw error
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export async function fetchMealLogs() {
  const { data, error } = await supabase.from('meal_logs').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToMealLog)
}

export async function upsertMealLog(log) {
  const row = mealLogToRow(log)
  const { error } = await supabase
    .from('meal_logs')
    .upsert(row, { onConflict: 'date' })
  if (error) throw error
}

// ─── Weight Log ───────────────────────────────────────────────────────────────

export async function fetchWeightLog() {
  const { data, error } = await supabase.from('weight_log').select('*').order('date')
  if (error) throw error
  return (data ?? []).map(rowToWeightEntry)
}

export async function upsertWeightEntry(entry) {
  const { error } = await supabase
    .from('weight_log')
    .upsert({ date: entry.date, weight_lbs: entry.weightLbs }, { onConflict: 'date' })
  if (error) throw error
}

// ─── Reset (danger zone) ──────────────────────────────────────────────────────

export async function deleteAllUserData() {
  await Promise.all([
    supabase.from('workout_logs').delete().gte('date', '1970-01-01'),
    supabase.from('meal_logs').delete().gte('date', '1970-01-01'),
    supabase.from('weight_log').delete().gte('date', '1970-01-01'),
    supabase.from('workout_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('meal_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('user_profile').delete().eq('id', 1),
  ])
}
