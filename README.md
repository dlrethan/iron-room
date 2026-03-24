# Iron Room

A mobile-first workout and nutrition tracking app built for serious lifters. Tracks workouts, meals, and body weight across a structured 15-week training program with full Supabase persistence.

---

## Features

### Workout
- Log sets, reps, and RPE for every exercise
- Auto-fills backdown weight (87.5%) on remaining sets after the top set is completed — skips any sets that already have a coach-preset weight
- Edit any completed set mid-workout to fix accidental submissions
- Rest timer fires automatically after each set using the exercise's programmed rest interval
- Backdown calculator (85% / 87.5% / 90% or manual override) fills the next incomplete set
- Previous session reference shown per exercise
- Per-exercise notes
- Program-day-based scheduling — Day 1 = Push, Day 2 = Pull, Day 3 = Legs, Day 4 = Upper, Days 5–7 = Rest, regardless of calendar day

### Meals
- Daily meal logging with toggle-to-eat per meal
- Full macro tracking: protein, calories, fat, carbs
- Custom macro entries (add any food not in the plan)
- Weekly grocery list auto-generated from the active meal plan, categorized by Proteins / Carbs / Vegetables / Pantry
- Meal prep view

### Progress
- Weekly weigh-in with SVG weight chart (start weight reference line)
- Delete individual weight entries
- Strength PRs auto-computed from all workout logs (best weight × reps per exercise)
- 1RM estimator using the Epley formula, with PR comparison

### Plans
- 15-week scrollable program timeline — highlights current week, deload weeks
- Active workout plan viewer: accordion by month → RPE schedule → training days → exercises
- Active meal plan viewer: accordion by day with full macro breakdown
- JSON plan import (validate → preview → confirm) for plans generated in Claude or externally
- Supports both workout and meal plan formats

### Dashboard
- Today's date, current program day (out of 90)
- Workout card with exercise count and "Start Workout" CTA, or Rest Day card with next session
- Macro rings for Protein, Calories, and Carbs — tracked against daily targets, with fat shown below
- Today's meals with eat-toggle

### Settings
- Program start date
- Daily targets: calories, protein, fat, carbs
- Current weight log entry
- Full data reset with confirmation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Deployment | Vercel |

---

## Architecture

```
src/
├── context/
│   └── AppContext.jsx     # Global state — loads Supabase data on mount, seeds on first launch
├── lib/
│   ├── supabase.js        # Supabase client singleton
│   └── db.js              # Async CRUD operations (normalizes DB ↔ JS shapes)
├── utils/
│   └── planUtils.js       # Pure computation — getProgramDay, getTodaysWorkout, getNextWorkoutDay, etc.
├── data/
│   └── seedData.js        # Default 15-week workout block + 7-day meal rotation
└── pages/
    ├── Dashboard.jsx
    ├── Workout.jsx
    ├── Meals.jsx
    ├── Progress.jsx
    ├── Plans.jsx
    └── Settings.jsx
```

All writes are optimistic — state updates immediately in the UI, Supabase write fires in the background. The app shows a loading screen on first mount while data is fetched.

---

## Database Schema

| Table | Description |
|---|---|
| `user_profile` | Single row — targets (calories, protein, fat, carbs), program start date, active plan IDs |
| `workout_plans` | Full workout plans stored as JSONB |
| `meal_plans` | Full meal plans stored as JSONB |
| `workout_logs` | One row per session (date + day type + exercises + sets) |
| `meal_logs` | One row per day (meals eaten + custom entries) |
| `weight_log` | One row per weigh-in date |

Row Level Security is enabled on all tables with permissive policies. `user_id` columns are in place on every table, ready for auth to be wired in.

---

## Local Development

**Prerequisites:** Node.js 18+, a Supabase project

1. Clone the repo
   ```bash
   git clone https://github.com/dlrethan/iron-room.git
   cd iron-room
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the database migrations in your Supabase SQL editor (or via Supabase CLI)

5. Start the dev server
   ```bash
   npm run dev
   ```

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic deploy.

**Required environment variables in Vercel:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## Plan Import

New workout or meal plans can be generated externally (e.g. via Claude) and imported as JSON through the Plans tab. The JSON must include `planType` (`"workout"` or `"meal"`), `planName`, and the appropriate `weeks` or `days` structure.

---

## Roadmap

### Phase 1 — Authentication ⚠️ Blocking everything else
- [ ] Supabase Auth (magic link + Google OAuth)
- [ ] Role selection on signup (Coach / Client)
- [ ] User profile creation on first login, `user_id` applied to all owned data
- [ ] RLS policies updated from `allow all` to `auth.uid() = user_id`
- [ ] Auth screens (sign in, sign up) and sign out in Settings

### Phase 2 — PWA / Installability
- [ ] `manifest.json` with app name, icons, theme color
- [ ] Service worker for offline support
- [ ] "Add to Home Screen" prompt
- [ ] Splash screen and status bar color on iOS/Android

### Phase 3 — Coach-Client Relationships
- [ ] `coach_clients` table (coach_id, client_id, status: pending/active)
- [ ] Coach invites client by email via Supabase magic link
- [ ] Coach dashboard: all clients with last workout and last weigh-in
- [ ] RLS: coaches can read (not write) client logs

### Phase 4 — Program Assignment
- [ ] `plan_assignments` table (plan_id, plan_type, assigned_to, assigned_by)
- [ ] Coach assigns workout plans to clients
- [ ] `exercise_weight_overrides` table — coach sets recommended starting weights per client per exercise
- [ ] Clients see coach weight targets pre-filled inside the workout logger (auto-backdown skips these)
- [ ] Coach can update weight targets at any time

### Phase 5 — Meal Plan Sharing
- [ ] Coach can optionally attach a meal plan to a client assignment
- [ ] Shared plans are read-only for the client
- [ ] If no plan shared, client falls through to their own meal plan

### Phase 6 — AI Meal Plan Generation
- [ ] Client fills out a form (calories, protein, fat, food preferences/exclusions)
- [ ] App calls Claude API via a Supabase Edge Function
- [ ] Returns a ready-to-import meal plan JSON, dropped straight into the import flow

### Phase 7 — Food Search & Logging (Nutritionix)
- [ ] Integrate Nutritionix API (same food database used by major fitness apps)
- [ ] Search any food by name or scan a barcode, get full macros back
- [ ] Logged entries appear in the client's daily meal log
- [ ] API key stored server-side via Supabase Edge Function
