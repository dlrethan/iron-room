import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Shared input components ──────────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-iron-muted">
      {children}
    </span>
  )
}

function NumberField({ label, value, onChange, unit, placeholder, min, max }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className={[
            'w-full h-[52px] bg-iron-bg border border-iron-border rounded-iron',
            'font-mono text-base text-iron-text',
            'px-3 pr-10',
            'placeholder:text-iron-faint',
            'focus:border-iron-accent focus:shadow-accent-ring',
          ].join(' ')}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Reset confirmation modal ─────────────────────────────────────────────────

function ResetModal({ onCancel, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/80" />

      <div
        className="relative w-full max-w-[430px] mx-auto bg-iron-surface border-t border-iron-border rounded-t-[12px] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[3px] rounded-full bg-iron-border2" />
        </div>

        <div className="px-4 pb-8 pt-3">
          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-iron-danger/10 border border-iron-danger/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF4444" strokeWidth="2" strokeLinejoin="round" />
                <path d="M12 9v4M12 17h.01" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h3 className="font-display font-black text-iron-text text-2xl uppercase text-center mb-2">
            Reset All Data?
          </h3>
          <p className="font-mono text-[13px] text-iron-muted text-center leading-relaxed mb-6">
            This will permanently erase all workout logs, meal logs, weight history, and settings.
            Your seed data will be restored but all progress will be gone.
            <span className="block mt-2 text-iron-danger font-bold">This cannot be undone.</span>
          </p>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <div
              onClick={() => setConfirmed(v => !v)}
              className={[
                'flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center press',
                confirmed ? 'bg-iron-danger border-iron-danger' : 'bg-transparent border-iron-border2',
              ].join(' ')}
            >
              {confirmed && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5L19 7" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="font-mono text-[12px] text-iron-muted leading-snug">
              I understand this will permanently delete all my progress data
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="press flex-1 h-[52px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmed}
              className={[
                'press flex-[2] h-[52px] rounded-iron border-0 font-display font-black text-sm uppercase tracking-[0.08em]',
                confirmed
                  ? 'bg-iron-danger text-white'
                  : 'bg-iron-surface2 text-iron-faint',
              ].join(' ')}
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Settings ────────────────────────────────────────────────────────────

export default function Settings() {
  const dateStr = todayISO()

  const { profile, weightLog, user, saveProfile, addWeightEntry, resetAll, signOut } = useApp()

  const [form, setForm] = useState(() => ({
    programStartDate: profile.programStartDate,
    calories:         String(profile.calorieTarget  ?? 2000),
    protein:          String(profile.proteinTarget  ?? 180),
    fat:              String(profile.fatTarget       ?? 55),
    carbs:            String(profile.carbsTarget     ?? 200),
    currentWeight:    '',
  }))

  const [saved,      setSaved]      = useState(false)
  const [errors,     setErrors]     = useState({})
  const [showReset,  setShowReset]  = useState(false)

  const set = field => value => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setSaved(false)
  }

  const validate = () => {
    const errs = {}
    const cal   = Number(form.calories)
    const pro   = Number(form.protein)
    const fat   = Number(form.fat)
    const carbs = Number(form.carbs)
    const wt    = form.currentWeight ? Number(form.currentWeight) : null

    if (!form.programStartDate) errs.programStartDate = 'Required'
    if (!form.calories || isNaN(cal)   || cal   < 500 || cal   > 10000) errs.calories = '500–10,000'
    if (!form.protein  || isNaN(pro)   || pro   < 0   || pro   > 1000)  errs.protein  = '0–1,000g'
    if (!form.fat      || isNaN(fat)   || fat   < 0   || fat   > 500)   errs.fat      = '0–500g'
    if (!form.carbs    || isNaN(carbs) || carbs < 0   || carbs > 1500)  errs.carbs    = '0–1,500g'
    if (wt !== null && (isNaN(wt) || wt < 50 || wt > 700))              errs.currentWeight = '50–700 lbs'

    return errs
  }

  const handleSave = useCallback(async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    await saveProfile({
      calorieTarget:    Number(form.calories),
      proteinTarget:    Number(form.protein),
      fatTarget:        Number(form.fat),
      carbsTarget:      Number(form.carbs),
      programStartDate: form.programStartDate,
    })

    if (form.currentWeight) {
      await addWeightEntry({ date: dateStr, weightLbs: Number(form.currentWeight) })
      setForm(prev => ({ ...prev, currentWeight: '' }))
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [form, dateStr, saveProfile, addWeightEntry])

  const handleReset = useCallback(async () => {
    await resetAll()
  }, [resetAll])

  // Today's logged weight for display
  const todayWeight = weightLog.find(e => e.date === dateStr)

  const inputClass = (field) => [
    'w-full h-[52px] bg-iron-bg border rounded-iron',
    'font-mono text-base text-iron-text px-3',
    'placeholder:text-iron-faint',
    'focus:border-iron-accent focus:shadow-accent-ring',
    errors[field] ? 'border-iron-danger' : 'border-iron-border',
  ].join(' ')

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* Header */}
      <header className="px-4 pt-5 pb-4 border-b border-iron-border">
        <h1 className="font-display font-black text-iron-text uppercase leading-none" style={{ fontSize: 'clamp(2rem, 9vw, 2.8rem)' }}>
          Settings
        </h1>
      </header>

      <div className="flex flex-col gap-6 p-4">

        {/* ── Program ─────────────────────────────────────────────────────── */}
        <section className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
          <div className="px-4 py-3 border-b border-iron-border bg-iron-bg">
            <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">Program</h2>
          </div>
          <div className="px-4 py-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Program Start Date</FieldLabel>
              <input
                type="date"
                value={form.programStartDate}
                onChange={e => set('programStartDate')(e.target.value)}
                className={inputClass('programStartDate')}
                style={{ colorScheme: 'dark' }}
              />
              {errors.programStartDate && (
                <span className="font-mono text-[11px] text-iron-danger">{errors.programStartDate}</span>
              )}
              <span className="font-mono text-[11px] text-iron-faint">
                Used to calculate your current day and week in the program
              </span>
            </div>
          </div>
        </section>

        {/* ── Daily targets ────────────────────────────────────────────────── */}
        <section className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
          <div className="px-4 py-3 border-b border-iron-border bg-iron-bg">
            <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">Daily Targets</h2>
          </div>
          <div className="px-4 py-4 flex flex-col gap-4">

            {/* Calories */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Calories</FieldLabel>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.calories}
                  onChange={e => set('calories')(e.target.value)}
                  placeholder="2000"
                  className={inputClass('calories')}
                  style={{ paddingRight: '3.5rem' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">kcal</span>
              </div>
              {errors.calories && <span className="font-mono text-[11px] text-iron-danger">{errors.calories}</span>}
            </div>

            {/* Protein + Fat + Carbs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Protein</FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.protein}
                    onChange={e => set('protein')(e.target.value)}
                    placeholder="180"
                    className={inputClass('protein')}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">g</span>
                </div>
                {errors.protein && <span className="font-mono text-[11px] text-iron-danger">{errors.protein}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Fat</FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.fat}
                    onChange={e => set('fat')(e.target.value)}
                    placeholder="55"
                    className={inputClass('fat')}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">g</span>
                </div>
                {errors.fat && <span className="font-mono text-[11px] text-iron-danger">{errors.fat}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Carbs</FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.carbs}
                    onChange={e => set('carbs')(e.target.value)}
                    placeholder="200"
                    className={inputClass('carbs')}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">g</span>
                </div>
                {errors.carbs && <span className="font-mono text-[11px] text-iron-danger">{errors.carbs}</span>}
              </div>
            </div>

          </div>
        </section>

        {/* ── Current weight ───────────────────────────────────────────────── */}
        <section className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
          <div className="px-4 py-3 border-b border-iron-border bg-iron-bg flex items-baseline justify-between">
            <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">Current Weight</h2>
            {todayWeight && (
              <span className="font-mono text-[11px] text-iron-success">✓ {todayWeight.weightLbs} lb logged today</span>
            )}
          </div>
          <div className="px-4 py-4 flex flex-col gap-1.5">
            <FieldLabel>Weight</FieldLabel>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={form.currentWeight}
                onChange={e => set('currentWeight')(e.target.value)}
                placeholder={todayWeight ? `${todayWeight.weightLbs}` : '280.0'}
                className={inputClass('currentWeight')}
                style={{ paddingRight: '2.5rem' }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-wider text-iron-faint pointer-events-none">lb</span>
            </div>
            {errors.currentWeight && <span className="font-mono text-[11px] text-iron-danger">{errors.currentWeight}</span>}
            <span className="font-mono text-[11px] text-iron-faint">
              Logged to your weight history on save
            </span>
          </div>
        </section>

        {/* ── Save button ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="press w-full h-[56px] bg-iron-accent text-iron-bg font-display font-black text-base uppercase tracking-[0.1em] rounded-iron border-0 glow-accent"
          >
            Save Settings
          </button>

          {/* Confirmation message */}
          {saved && (
            <div className="flex items-center justify-center gap-2 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-iron-success" aria-hidden="true">
                <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-display font-bold text-iron-success text-sm uppercase tracking-wider">
                Settings saved
              </span>
            </div>
          )}
        </div>

        {/* ── Account ──────────────────────────────────────────────────────── */}
        <section className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
          <div className="px-4 py-3 border-b border-iron-border bg-iron-bg">
            <h2 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider">Account</h2>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {profile?.displayName && (
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">Name</span>
                <span className="font-mono text-[13px] text-iron-text">{profile.displayName}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">Role</span>
              <span className="font-mono text-[13px] text-iron-text capitalize">{profile?.role ?? 'athlete'}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">Email</span>
              <span className="font-mono text-[13px] text-iron-text">{user?.email}</span>
            </div>
            <button
              onClick={signOut}
              className="press w-full h-[52px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted mt-1"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* ── Danger zone ──────────────────────────────────────────────────── */}
        <section className="bg-iron-surface border border-iron-danger/30 rounded-iron overflow-hidden">
          <div className="px-4 py-3 border-b border-iron-danger/20 bg-iron-danger/5">
            <h2 className="font-display font-bold text-iron-danger uppercase text-sm tracking-wider">Danger Zone</h2>
          </div>
          <div className="px-4 py-4">
            <p className="font-mono text-[12px] text-iron-muted mb-4 leading-relaxed">
              Permanently deletes all workout logs, meal logs, weight history, and resets settings to defaults. Seed data will be restored.
            </p>
            <button
              onClick={() => setShowReset(true)}
              className="press w-full h-[52px] bg-iron-danger/10 border border-iron-danger/50 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-danger"
            >
              Reset All Data
            </button>
          </div>
        </section>

        {/* App version footer */}
        <p className="font-mono text-[10px] text-iron-faint text-center pb-2">
          Iron Room · v1.0.0
        </p>

      </div>

      {/* Reset confirmation modal */}
      {showReset && (
        <ResetModal
          onCancel={() => setShowReset(false)}
          onConfirm={handleReset}
        />
      )}

    </main>
  )
}
