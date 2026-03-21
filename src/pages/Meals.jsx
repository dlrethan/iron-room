import { useState, useCallback, useMemo } from 'react'
import {
  getTodaysMeals,
  getMealLogForDate,
  saveMealLog,
  getUserProfile,
  getActiveMealPlan,
} from '../utils/storage'

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSundayISO(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - d.getDay()) // getDay: 0=Sun, 1=Mon …
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sumMacros(mealPlanDay, mealLog) {
  const eatenNames = new Set(
    (mealLog?.meals ?? []).filter(m => m.eaten).map(m => m.mealName)
  )

  const fromMeals = (mealPlanDay?.meals ?? []).reduce((acc, meal) => {
    if (!eatenNames.has(meal.mealName)) return acc
    return {
      calories: acc.calories + meal.macros.calories,
      proteinG: acc.proteinG + meal.macros.proteinG,
      fatG:     acc.fatG     + meal.macros.fatG,
      carbsG:   acc.carbsG   + meal.macros.carbsG,
    }
  }, { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 })

  const fromCustom = (mealLog?.customEntries ?? []).reduce((acc, e) => ({
    calories: acc.calories + (Number(e.calories) || 0),
    proteinG: acc.proteinG + (Number(e.proteinG) || 0),
    fatG:     acc.fatG     + (Number(e.fatG)     || 0),
    carbsG:   acc.carbsG   + (Number(e.carbsG)   || 0),
  }), { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 })

  return {
    calories: fromMeals.calories + fromCustom.calories,
    proteinG: fromMeals.proteinG + fromCustom.proteinG,
    fatG:     fromMeals.fatG     + fromCustom.fatG,
    carbsG:   fromMeals.carbsG   + fromCustom.carbsG,
  }
}

// ─── Grocery parsing helpers ──────────────────────────────────────────────────

const PROTEIN_KEYWORDS = ['chicken', 'beef', 'turkey', 'shrimp', 'whey', 'salmon', 'tuna', 'fish', 'pork', 'rotisserie']
const CARB_KEYWORDS    = ['rice', 'potato', 'bread', 'pasta', 'oat', 'quinoa', 'tortilla', 'sweet potato']
const VEG_KEYWORDS     = ['broccoli', 'zucchini', 'bok choy', 'green beans', 'peppers', 'asparagus', 'snap peas', 'pico', 'spinach', 'kale', 'cabbage', 'onion']

const GROCERY_CATEGORIES = ['Proteins', 'Carbs', 'Vegetables', 'Pantry & Sauces']

function classifyIngredient(name) {
  const lower = name.toLowerCase()
  if (PROTEIN_KEYWORDS.some(k => lower.includes(k))) return 'Proteins'
  if (CARB_KEYWORDS.some(k => lower.includes(k))) return 'Carbs'
  if (VEG_KEYWORDS.some(k => lower.includes(k))) return 'Vegetables'
  return 'Pantry & Sauces'
}

function parseIngredientItem(raw) {
  // Strip preparation method in parens: "chicken breast (air fryer)" → "chicken breast"
  const clean = raw.trim().replace(/\([^)]+\)/g, '').trim()
  // Match: [number] [optional unit] [name]
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(oz|cups?|scoops?|tbsp|tsp|lb)?\s+(.+)/i)
  if (match) {
    const rawUnit = (match[2] || '').toLowerCase()
    const unit = rawUnit.replace(/^cups$/, 'cup').replace(/^scoops$/, 'scoop') || null
    return { qty: parseFloat(match[1]), unit, name: match[3].trim() }
  }
  return { qty: null, unit: null, name: clean }
}

function formatQty(qty, unit) {
  if (qty === null) return ''
  const n = Math.round(qty * 10) / 10
  if (!unit) return `${n}`
  if (unit === 'cup')   return `${n} ${n === 1 ? 'cup' : 'cups'}`
  if (unit === 'scoop') return `${n} ${n === 1 ? 'scoop' : 'scoops'}`
  return `${n}${unit}` // e.g. "56oz"
}

function buildGroceryList(mealPlan) {
  const map = {}

  ;(mealPlan?.days ?? []).forEach(day => {
    ;(day.meals ?? []).forEach(meal => {
      // Parse food items
      meal.foods.split(' + ').forEach(raw => {
        const { qty, unit, name } = parseIngredientItem(raw)
        const key = name.toLowerCase()
        if (map[key]) {
          if (qty !== null && map[key].qty !== null) map[key].qty += qty
        } else {
          map[key] = { qty, unit, name, category: classifyIngredient(name) }
        }
      })
      // Sauces → Pantry & Sauces
      if (meal.sauce) {
        const key = `__sauce__${meal.sauce.toLowerCase()}`
        if (!map[key]) {
          map[key] = { qty: null, unit: null, name: meal.sauce, category: 'Pantry & Sauces' }
        }
      }
    })
  })

  return Object.values(map)
}

// ─── Macro progress bar ───────────────────────────────────────────────────────

function MacroBar({ label, logged, target, unit = 'g' }) {
  const pct  = target > 0 ? Math.min(logged / target, 1) : 0
  const over = logged > target

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-iron-muted">
          {label}
        </span>
        <span className="font-mono text-[12px] leading-none">
          <span className={over ? 'text-iron-danger font-bold' : 'text-iron-text font-bold'}>
            {logged}
          </span>
          <span className="text-iron-muted"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-[5px] bg-iron-surface2 rounded-full overflow-hidden">
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            over ? 'bg-iron-danger' : 'bg-iron-accent',
          ].join(' ')}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  )
}

// ─── Tab toggle ───────────────────────────────────────────────────────────────

function ViewToggle({ active, onChange }) {
  const tabs = [
    { id: 'today',   label: 'Today'   },
    { id: 'grocery', label: 'Grocery' },
    { id: 'prep',    label: 'Prep'    },
  ]
  return (
    <div className="flex gap-1 p-1 bg-iron-surface rounded-iron border border-iron-border">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            'press flex-1 h-[32px] rounded-iron border-0 font-display font-bold text-[11px] uppercase tracking-[0.1em]',
            active === id
              ? 'bg-iron-accent text-iron-bg'
              : 'bg-transparent text-iron-muted',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Meal card ────────────────────────────────────────────────────────────────

function MealCard({ meal, isEaten, onToggle }) {
  const macroItems = [
    { label: 'P',    value: meal.macros.proteinG, unit: 'g', accent: true  },
    { label: 'C',    value: meal.macros.carbsG,   unit: 'g', accent: false },
    { label: 'F',    value: meal.macros.fatG,      unit: 'g', accent: false },
    { label: 'kcal', value: meal.macros.calories,  unit: '',  accent: false },
  ]

  return (
    <div className={[
      'rounded-iron border overflow-hidden transition-colors duration-300',
      isEaten
        ? 'bg-iron-eaten border-iron-success/30'
        : 'bg-iron-surface border-iron-border',
    ].join(' ')}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-black text-iron-text uppercase leading-none" style={{ fontSize: 'clamp(1.5rem, 6.5vw, 2rem)' }}>
            {meal.mealName}
          </h3>
          {isEaten && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-iron border border-iron-success/50 bg-iron-success/10">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L19 7" stroke="#44FF88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-iron-success">
                Eaten
              </span>
            </span>
          )}
        </div>

        <p className="font-mono text-[13px] text-iron-text leading-snug mb-1">
          {meal.foods}
        </p>

        {meal.sauce && (
          <p className="font-mono text-[11px] text-iron-muted mb-3">
            Sauce: <span className="text-iron-accent">{meal.sauce}</span>
          </p>
        )}

        <div className="grid grid-cols-4 gap-2 py-3 border-t border-b border-iron-border mb-4">
          {macroItems.map(({ label, value, unit, accent }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-iron-muted">
                {label}
              </span>
              <span className={[
                'font-mono text-base font-bold leading-none',
                accent ? 'text-iron-accent' : 'text-iron-text',
              ].join(' ')}>
                {value}
                <span className="text-iron-muted text-[10px] font-normal">{unit}</span>
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onToggle}
          disabled={isEaten}
          className={[
            'press w-full h-[56px] rounded-iron border font-display font-black text-base uppercase tracking-[0.1em]',
            isEaten
              ? 'bg-iron-success/10 border-iron-success/40 text-iron-success cursor-default opacity-80'
              : 'bg-iron-accent border-iron-accent text-iron-bg glow-accent',
            'disabled:opacity-80',
          ].join(' ')}
        >
          {isEaten ? (
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Eaten
            </span>
          ) : (
            'Mark Eaten'
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Custom entry display card ────────────────────────────────────────────────

function CustomEntryCard({ entry, index, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-iron-surface border border-iron-border rounded-iron px-4 py-3">
      <div className="flex-1">
        <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
          Custom entry {index + 1}
        </span>
        <div className="flex gap-4 mt-1">
          <span className="font-mono text-[12px] text-iron-accent font-bold">{entry.proteinG}g P</span>
          <span className="font-mono text-[12px] text-iron-text">{entry.calories} cal</span>
          <span className="font-mono text-[12px] text-iron-muted">{entry.fatG}g F</span>
          <span className="font-mono text-[12px] text-iron-muted">{entry.carbsG}g C</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="press flex items-center justify-center w-[40px] h-[40px] rounded-iron border border-iron-border text-iron-muted"
        aria-label="Remove custom entry"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Custom macro sheet ───────────────────────────────────────────────────────

function CustomMacroSheet({ onAdd, onClose }) {
  const [form, setForm] = useState({ calories: '', proteinG: '', fatG: '', carbsG: '' })

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAdd = () => {
    const entry = {
      calories: Number(form.calories) || 0,
      proteinG: Number(form.proteinG) || 0,
      fatG:     Number(form.fatG)     || 0,
      carbsG:   Number(form.carbsG)   || 0,
      addedAt:  new Date().toISOString(),
    }
    onAdd(entry)
    onClose()
  }

  const hasAnyValue = Object.values(form).some(v => v !== '')

  const inputClass = [
    'w-full h-[56px] bg-iron-bg border border-iron-border rounded-iron',
    'font-mono text-base text-iron-text text-center',
    'placeholder:text-iron-faint',
    'focus:border-iron-accent focus:shadow-accent-ring',
  ].join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75" />
      <div
        className="relative w-full max-w-[430px] mx-auto bg-iron-surface border-t border-iron-border rounded-t-[12px] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[3px] rounded-full bg-iron-border2" />
        </div>

        <div className="px-4 pb-6 pt-2">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display font-black text-iron-text text-2xl uppercase">Add Custom</h3>
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              Off-plan entry
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <label className="block font-display text-[10px] uppercase tracking-widest text-iron-muted mb-1.5">
                Calories
              </label>
              <input
                type="number" inputMode="numeric" placeholder="kcal"
                value={form.calories} onChange={set('calories')}
                className={inputClass} autoFocus
              />
            </div>
            <div>
              <label className="block font-display text-[10px] uppercase tracking-widest text-iron-accent mb-1.5">
                Protein
              </label>
              <input
                type="number" inputMode="decimal" placeholder="g"
                value={form.proteinG} onChange={set('proteinG')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-display text-[10px] uppercase tracking-widest text-iron-muted mb-1.5">
                Fat
              </label>
              <input
                type="number" inputMode="decimal" placeholder="g"
                value={form.fatG} onChange={set('fatG')}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-display text-[10px] uppercase tracking-widest text-iron-muted mb-1.5">
                Carbs
              </label>
              <input
                type="number" inputMode="decimal" placeholder="g"
                value={form.carbsG} onChange={set('carbsG')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="press flex-1 h-[56px] bg-transparent border border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-wider text-iron-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!hasAnyValue}
              className={[
                'press flex-1 h-[56px] rounded-iron border-0 font-display font-black text-base uppercase tracking-[0.1em]',
                hasAnyValue
                  ? 'bg-iron-accent text-iron-bg glow-accent'
                  : 'bg-iron-surface2 text-iron-faint',
              ].join(' ')}
            >
              Add Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Grocery list view ────────────────────────────────────────────────────────

function GroceryListView({ mealPlan }) {
  const sundayISO  = getSundayISO(todayISO())
  const storageKey = `groceryChecked_${sundayISO}`

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') }
    catch { return {} }
  })
  const [copied, setCopied] = useState(false)

  const items = useMemo(() => buildGroceryList(mealPlan), [mealPlan])

  const toggleItem = (key) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  const copyList = () => {
    const lines = []
    GROCERY_CATEGORIES.forEach(cat => {
      const catItems = items.filter(i => i.category === cat)
      if (!catItems.length) return
      lines.push(cat.toUpperCase())
      catItems.forEach(item => {
        const qty = formatQty(item.qty, item.unit)
        const tick = checked[item.name.toLowerCase()] ? '[x]' : '[ ]'
        lines.push(`${tick} ${qty ? qty + ' ' : ''}${item.name}`)
      })
      lines.push('')
    })
    navigator.clipboard?.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // "Week of Mar 15"
  const weekLabel = new Date(sundayISO + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const totalItems  = items.length
  const checkedCount = Object.values(checked).filter(Boolean).length

  if (!mealPlan) {
    return (
      <div className="p-4">
        <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
          <p className="font-mono text-[13px] text-iron-muted">No meal plan loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4">

      {/* List header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
            Week of {weekLabel}
          </span>
          <div className="font-mono text-[12px] text-iron-muted mt-0.5">
            <span className="text-iron-accent font-bold">{checkedCount}</span>
            <span> / {totalItems} items</span>
          </div>
        </div>
        <button
          onClick={copyList}
          className={[
            'press h-[36px] px-4 rounded-iron border font-display font-bold text-[11px] uppercase tracking-[0.08em]',
            copied
              ? 'bg-iron-success/10 border-iron-success/50 text-iron-success'
              : 'bg-transparent border-iron-border2 text-iron-muted',
          ].join(' ')}
        >
          {copied ? '✓ Copied' : 'Copy List'}
        </button>
      </div>

      {/* Category sections */}
      {GROCERY_CATEGORIES.map(cat => {
        const catItems = items.filter(i => i.category === cat)
        if (!catItems.length) return null
        return (
          <section key={cat}>
            <h3 className="font-display font-bold text-iron-text uppercase text-sm tracking-wider mb-2">
              {cat}
            </h3>
            <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
              {catItems.map((item, idx) => {
                const key     = item.name.toLowerCase()
                const isDone  = checked[key] ?? false
                const qty     = formatQty(item.qty, item.unit)
                return (
                  <button
                    key={key}
                    onClick={() => toggleItem(key)}
                    className={[
                      'press w-full flex items-center gap-3 px-4 py-3 border-0 text-left',
                      idx < catItems.length - 1 ? 'border-b border-iron-border' : '',
                      isDone ? 'bg-iron-bg/50' : 'bg-transparent',
                    ].join(' ')}
                  >
                    {/* Checkbox */}
                    <span className={[
                      'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      isDone
                        ? 'bg-iron-accent border-iron-accent'
                        : 'bg-transparent border-iron-border2',
                    ].join(' ')}>
                      {isDone && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12l5 5L19 7" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    {/* Item label */}
                    <span className={[
                      'font-mono text-[13px] flex-1 leading-snug',
                      isDone ? 'line-through text-iron-faint' : 'text-iron-text',
                    ].join(' ')}>
                      {item.name}
                    </span>

                    {/* Quantity */}
                    {qty && (
                      <span className={[
                        'font-mono text-[12px] flex-shrink-0',
                        isDone ? 'text-iron-faint' : 'text-iron-muted',
                      ].join(' ')}>
                        {qty}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ─── Prep view ────────────────────────────────────────────────────────────────

const PREP_CARDS = [
  {
    id: 'sunday',
    day: 'Sunday Prep',
    subtitle: 'Batch cook for Mon / Tue / Wed',
    steps: [
      'Cook 3 lbs chicken breast in air fryer at 400°F for 18–20 min. Season half plain, half with gochujang marinade (gochujang + soy sauce + sesame oil).',
      'Brown 2 lbs 96% lean ground beef in a large skillet. Drain fat. Season with salt, pepper, and garlic powder.',
      'Cook 6 cups dry jasmine rice (rice cooker or 1:1.5 ratio stovetop). Once cool, portion into 6 × 1.5 cup containers.',
      'Steam broccoli florets (3 lbs) for 5–6 min — keep slightly firm. Season at reheating, not now.',
      'Roast zucchini: slice into half-moons, toss with olive oil + salt, 400°F for 15 min.',
      'Mix gochujang mayo: 2 tbsp gochujang + 3 tbsp mayo + 1 tsp lime juice. Store in small jar.',
      'Prep salsa verde (or open store-bought jar). Portion into small containers.',
      'Label all containers with the day (Mon / Tue / Wed) and contents. Refrigerate.',
    ],
  },
  {
    id: 'wednesday',
    day: 'Wednesday Prep',
    subtitle: 'Batch cook for Thu / Fri / Sat / Sun',
    steps: [
      'Cook 2 lbs shrimp in air fryer at 400°F for 8–10 min. Season with garlic powder + smoked paprika + salt.',
      'Brown 1.5 lbs ground turkey in skillet. Add 2 tbsp taco seasoning + ¼ cup water. Simmer 3 min until absorbed.',
      'Cook 5 cups dry jasmine rice. Portion into containers.',
      'Roast sweet potatoes: cube into 1-inch pieces, toss with olive oil + salt + cinnamon, 425°F for 25 min.',
      'Roast asparagus + snap peas together: 400°F for 12–14 min with olive oil + salt.',
      'Mix chimichurri: 1 cup fresh parsley + 4 garlic cloves + ¼ cup olive oil + 2 tbsp red wine vinegar + salt. Blend or finely chop.',
      'Mix teriyaki glaze: ¼ cup soy sauce + 2 tbsp honey + 1 tbsp mirin + 1 tsp fresh grated ginger. Simmer 3 min to thicken.',
      'Label all containers Thu / Fri / Sat / Sun. Refrigerate up to 5 days.',
    ],
  },
]

function PrepCard({ card, activeSauces }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-iron-surface border border-iron-border rounded-iron overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="press w-full flex items-center justify-between px-4 py-4 border-0 bg-transparent text-left"
        aria-expanded={open}
      >
        <div>
          <div className="font-display font-black text-iron-text uppercase text-xl leading-none">
            {card.day}
          </div>
          <div className="font-mono text-[11px] text-iron-muted mt-1">
            {card.subtitle}
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          className={`flex-shrink-0 text-iron-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-iron-border px-4 pb-5">
          {/* Active sauces chip row */}
          {activeSauces.length > 0 && (
            <div className="pt-4 pb-3">
              <span className="font-display text-[9px] uppercase tracking-widest text-iron-muted mr-2">
                Sauces:
              </span>
              {activeSauces.map(sauce => (
                <span
                  key={sauce}
                  className="inline-block mr-1.5 mb-1.5 px-2 py-0.5 rounded-iron border border-iron-accent/30 bg-iron-accent/5 font-mono text-[11px] text-iron-accent"
                >
                  {sauce}
                </span>
              ))}
            </div>
          )}

          {/* Step list */}
          <ol className="flex flex-col gap-3 mt-2">
            {card.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="font-mono text-sm font-bold text-iron-accent flex-shrink-0 w-5 text-right leading-snug mt-0.5">
                  {i + 1}
                </span>
                <span className="font-mono text-[13px] text-iron-text leading-snug">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function PrepView({ mealPlan }) {
  // Derive sauces per prep window (Sun covers days 0–2, Wed covers days 3–6)
  const days = mealPlan?.days ?? []
  const saucesForWindow = (dayIndices) => {
    const set = new Set()
    dayIndices.forEach(i => {
      ;(days[i]?.meals ?? []).forEach(m => { if (m.sauce) set.add(m.sauce) })
    })
    return [...set]
  }
  const sundaySauces    = saucesForWindow([0, 1, 2])
  const wednesdaySauces = saucesForWindow([3, 4, 5, 6])

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="font-mono text-[12px] text-iron-muted leading-snug">
        Tap a card to expand the full cook sequence. Prep each batch in one session to save time during the week.
      </p>
      <PrepCard card={PREP_CARDS[0]} activeSauces={sundaySauces} />
      <PrepCard card={PREP_CARDS[1]} activeSauces={wednesdaySauces} />
    </div>
  )
}

// ─── Main Meals Component ─────────────────────────────────────────────────────

export default function Meals() {
  const dateStr = todayISO()

  const [activeView, setActiveView] = useState('today')

  // Plan data
  const mealPlanDay = getTodaysMeals()
  const profile     = getUserProfile()
  const activePlan  = getActiveMealPlan()

  // Targets — prefer meal plan's dailyTargets, fall back to user profile
  const targets = {
    calories: activePlan?.dailyTargets?.calories ?? profile.calorieTarget,
    proteinG: activePlan?.dailyTargets?.proteinG ?? profile.proteinTarget,
    fatG:     activePlan?.dailyTargets?.fatG     ?? profile.fatTarget,
    carbsG:   activePlan?.dailyTargets?.carbsG   ?? 200,
  }

  // Meal log state
  const [mealLog, setMealLog] = useState(
    () => getMealLogForDate(dateStr) ?? { date: dateStr, meals: [], customEntries: [] }
  )
  const [showCustomSheet, setShowCustomSheet] = useState(false)

  const persist = useCallback((nextLog) => { saveMealLog(nextLog) }, [])

  const toggleMeal = useCallback((mealName) => {
    setMealLog(prev => {
      const meals = (mealPlanDay?.meals ?? []).map(m => {
        const existing = prev.meals.find(ml => ml.mealName === m.mealName)
        if (m.mealName === mealName) {
          return { mealName: m.mealName, eaten: !(existing?.eaten ?? false) }
        }
        return existing ?? { mealName: m.mealName, eaten: false }
      })
      const next = { ...prev, meals }
      persist(next)
      return next
    })
  }, [mealPlanDay, persist])

  const addCustomEntry = useCallback((entry) => {
    setMealLog(prev => {
      const next = { ...prev, customEntries: [...(prev.customEntries ?? []), entry] }
      persist(next)
      return next
    })
  }, [persist])

  const removeCustomEntry = useCallback((index) => {
    setMealLog(prev => {
      const customEntries = (prev.customEntries ?? []).filter((_, i) => i !== index)
      const next = { ...prev, customEntries }
      persist(next)
      return next
    })
  }, [persist])

  const totals        = sumMacros(mealPlanDay, mealLog)
  const customEntries = mealLog.customEntries ?? []

  return (
    <main className="flex flex-col flex-1 overflow-y-auto pb-24">

      {/* ── Sticky header: title + tabs + macro bars (Today only) ── */}
      <div className="sticky top-0 z-20 bg-iron-bg border-b border-iron-border">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-baseline justify-between mb-2.5">
            <h1 className="font-display font-black text-iron-text uppercase" style={{ fontSize: 'clamp(1.8rem, 8vw, 2.4rem)', lineHeight: 1 }}>
              Meals
            </h1>
            <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
          <ViewToggle active={activeView} onChange={setActiveView} />
        </div>

        {/* Macro bars — only shown on Today tab when plan is loaded */}
        {activeView === 'today' && mealPlanDay && (
          <div className="px-4 pb-3 flex flex-col gap-2.5">
            <MacroBar label="Calories" logged={totals.calories} target={targets.calories} unit="" />
            <MacroBar label="Protein"  logged={totals.proteinG} target={targets.proteinG} unit="g" />
            <MacroBar label="Fat"      logged={totals.fatG}     target={targets.fatG}     unit="g" />
            <MacroBar label="Carbs"    logged={totals.carbsG}   target={targets.carbsG}   unit="g" />
          </div>
        )}
      </div>

      {/* ── Today view ────────────────────────────────────────────── */}
      {activeView === 'today' && (
        <>
          {!mealPlanDay ? (
            <div className="p-4">
              <div className="bg-iron-surface border border-iron-border rounded-iron p-4">
                <p className="font-mono text-[13px] text-iron-muted">No meal plan loaded for today.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {mealPlanDay.meals.map(meal => {
                const logEntry = mealLog.meals.find(m => m.mealName === meal.mealName)
                return (
                  <MealCard
                    key={meal.mealName}
                    meal={meal}
                    isEaten={logEntry?.eaten ?? false}
                    onToggle={() => toggleMeal(meal.mealName)}
                  />
                )
              })}

              {customEntries.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-display text-[10px] uppercase tracking-widest text-iron-muted">
                    Custom entries
                  </span>
                  {customEntries.map((entry, i) => (
                    <CustomEntryCard
                      key={entry.addedAt ?? i}
                      entry={entry}
                      index={i}
                      onRemove={() => removeCustomEntry(i)}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowCustomSheet(true)}
                className="press w-full h-[52px] bg-transparent border border-dashed border-iron-border2 rounded-iron font-display font-bold text-sm uppercase tracking-[0.1em] text-iron-muted"
              >
                + Add Custom Entry
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Grocery view ──────────────────────────────────────────── */}
      {activeView === 'grocery' && (
        <GroceryListView mealPlan={activePlan} />
      )}

      {/* ── Prep view ─────────────────────────────────────────────── */}
      {activeView === 'prep' && (
        <PrepView mealPlan={activePlan} />
      )}

      {/* Custom macro sheet */}
      {showCustomSheet && (
        <CustomMacroSheet
          onAdd={addCustomEntry}
          onClose={() => setShowCustomSheet(false)}
        />
      )}

    </main>
  )
}
