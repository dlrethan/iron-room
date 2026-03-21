# Iron Room

A mobile-first workout and nutrition tracking app built for serious lifters. Tracks workouts, meals, and body weight across a structured training program with full Supabase persistence.

---

## Features

- **Workout Tracker** — Log sets, reps, and RPE for every exercise. In-workout backdown calculator, previous session reference, and per-exercise notes
- **Meal Tracker** — Daily meal logging with macro totals (protein, calories, fat, carbs). Custom food entries and a weekly grocery list generator
- **Progress** — Weight chart over time, strength PRs across all exercises, and a 1RM estimator (Epley formula)
- **Plans** — Full 15-week program timeline, workout and meal plan viewer, JSON plan import for plans generated externally
- **Settings** — Daily macro targets, program start date, current weight log, and full data reset

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Deployment | Vercel |

## Architecture

```
src/
├── context/
│   └── AppContext.jsx     # Global state — loads Supabase data on mount, seeds on first launch
├── lib/
│   ├── supabase.js        # Supabase client singleton
│   └── db.js              # Async CRUD operations (normalizes DB ↔ JS shapes)
├── utils/
│   └── planUtils.js       # Pure computation — getProgramDay, getTodaysWorkout, etc.
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

## Database Schema

| Table | Description |
|---|---|
| `user_profile` | Single row — targets, program start date, active plan IDs |
| `workout_plans` | Full workout plans stored as JSONB |
| `meal_plans` | Full meal plans stored as JSONB |
| `workout_logs` | One row per session (date + day type) |
| `meal_logs` | One row per day of meal tracking |
| `weight_log` | Weekly weigh-ins |

Row Level Security is enabled on all tables with permissive policies. `user_id` columns are in place on every table, ready for auth to be wired in.

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

4. Apply the database migrations from your Supabase dashboard (SQL editor) or via the Supabase CLI

5. Start the dev server
   ```bash
   npm run dev
   ```

## Deployment

The app is deployed on Vercel. Every push to `main` triggers an automatic deploy.

**Required environment variables in Vercel:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Plan Import

New workout or meal plans can be generated externally (e.g. via Claude) and imported as JSON through the Plans tab. The JSON must include `planType` (`"workout"` or `"meal"`), `planName`, and the appropriate `weeks` or `days` structure.

## Roadmap

- [ ] Supabase Auth (magic link / Google OAuth)
- [ ] Coach and client roles
- [ ] Coach plan assignment to clients
- [ ] Coach dashboard with client progress view
