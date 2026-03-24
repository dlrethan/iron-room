import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as db from '../lib/db'
import { seedWorkoutPlan, seedMealPlan, defaultUserProfile, DEFAULT_PROGRAM_START_DATE } from '../data/seedData'

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [loading, setLoading]           = useState(true)
  const [profile, setProfile]           = useState(null)
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [mealPlans, setMealPlans]       = useState([])
  const [workoutLogs, setWorkoutLogs]   = useState([])
  const [mealLogs, setMealLogs]         = useState([])
  const [weightLog, setWeightLog]       = useState([])

  // ── Auth state ────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Load / seed on auth ───────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Signed out — clear all state
      setProfile(null)
      setWorkoutPlans([])
      setMealPlans([])
      setWorkoutLogs([])
      setMealLogs([])
      setWeightLog([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      let prof = await db.fetchProfile()

      if (!prof) {
        // First launch for this user — seed everything
        const workoutPlan = { ...seedWorkoutPlan, id: crypto.randomUUID(), planName: seedWorkoutPlan.planName }
        const mealPlan    = { ...seedMealPlan,    id: crypto.randomUUID(), planName: seedMealPlan.planName }

        await Promise.all([
          db.upsertWorkoutPlan(workoutPlan),
          db.upsertMealPlan(mealPlan),
        ])

        prof = {
          ...defaultUserProfile,
          programStartDate:    DEFAULT_PROGRAM_START_DATE,
          activeWorkoutPlanId: workoutPlan.id,
          activeMealPlanId:    mealPlan.id,
        }
        await db.upsertProfile(prof)
      }

      const [wPlans, mPlans, wLogs, mLogs, wLog] = await Promise.all([
        db.fetchWorkoutPlans(),
        db.fetchMealPlans(),
        db.fetchWorkoutLogs(),
        db.fetchMealLogs(),
        db.fetchWeightLog(),
      ])

      setProfile(prof)
      setWorkoutPlans(wPlans)
      setMealPlans(mPlans)
      setWorkoutLogs(wLogs)
      setMealLogs(mLogs)
      setWeightLog(wLog)
      setLoading(false)
    }

    load()
  }, [user, authLoading])

  // ── Profile mutations ──────────────────────────────────────────────────────

  const saveProfile = useCallback(async (updates) => {
    const next = { ...profile, ...updates }
    setProfile(next)
    await db.upsertProfile(next)
  }, [profile])

  // ── Workout plan mutations ────────────────────────────────────────────────

  const saveWorkoutPlan = useCallback(async (plan) => {
    const withId = plan.id ? plan : { ...plan, id: crypto.randomUUID() }
    setWorkoutPlans(prev => {
      const idx = prev.findIndex(p => p.id === withId.id)
      return idx >= 0 ? prev.map((p, i) => i === idx ? withId : p) : [...prev, withId]
    })
    await db.upsertWorkoutPlan(withId)
    return withId
  }, [])

  // ── Meal plan mutations ───────────────────────────────────────────────────

  const saveMealPlan = useCallback(async (plan) => {
    const withId = plan.id ? plan : { ...plan, id: crypto.randomUUID() }
    setMealPlans(prev => {
      const idx = prev.findIndex(p => p.id === withId.id)
      return idx >= 0 ? prev.map((p, i) => i === idx ? withId : p) : [...prev, withId]
    })
    await db.upsertMealPlan(withId)
    return withId
  }, [])

  const setActivePlanIds = useCallback(async ({ workoutPlanId, mealPlanId }) => {
    await saveProfile({ activeWorkoutPlanId: workoutPlanId, activeMealPlanId: mealPlanId })
  }, [saveProfile])

  // ── Workout log mutations ─────────────────────────────────────────────────

  const saveWorkoutLog = useCallback(async (log) => {
    setWorkoutLogs(prev => {
      const idx = prev.findIndex(l => l.date === log.date && l.dayName === log.dayName)
      return idx >= 0 ? prev.map((l, i) => i === idx ? log : l) : [...prev, log]
    })
    await db.upsertWorkoutLog(log)
  }, [])

  // ── Meal log mutations ────────────────────────────────────────────────────

  const saveMealLog = useCallback(async (log) => {
    setMealLogs(prev => {
      const idx = prev.findIndex(l => l.date === log.date)
      return idx >= 0 ? prev.map((l, i) => i === idx ? log : l) : [...prev, log]
    })
    await db.upsertMealLog(log)
  }, [])

  // ── Weight log mutations ──────────────────────────────────────────────────

  const addWeightEntry = useCallback(async (entry) => {
    setWeightLog(prev => {
      const idx = prev.findIndex(e => e.date === entry.date)
      const next = idx >= 0 ? prev.map((e, i) => i === idx ? entry : e) : [...prev, entry]
      return next.sort((a, b) => a.date.localeCompare(b.date))
    })
    await db.upsertWeightEntry(entry)
  }, [])

  const deleteWeightEntry = useCallback(async (date) => {
    setWeightLog(prev => prev.filter(e => e.date !== date))
    await db.deleteWeightEntry(date)
  }, [])

  // ── Reset all data ────────────────────────────────────────────────────────

  const resetAll = useCallback(async () => {
    await db.deleteAllUserData()
    window.location.reload()
  }, [])

  // ── Sign out ──────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────

  const value = {
    user,
    authLoading,
    loading,
    profile,
    workoutPlans,
    mealPlans,
    workoutLogs,
    mealLogs,
    weightLog,
    saveProfile,
    saveWorkoutPlan,
    saveMealPlan,
    setActivePlanIds,
    saveWorkoutLog,
    saveMealLog,
    addWeightEntry,
    deleteWeightEntry,
    resetAll,
    signOut,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
