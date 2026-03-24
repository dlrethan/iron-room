# IronRoom

Track. Progress. Dominate.

A mobile-first PWA for workout tracking, nutrition logging, and coach-client program management.

**Live:** [ironroom.app](https://ironroom.app)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS v4 |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Email | Resend (`noreply@ironroom.app`) |
| Hosting | Vercel + Cloudflare |
| PWA | vite-plugin-pwa + Workbox |

---

## Features

### Athlete
- **Workout Logger** — sets / reps / RPE, rest timer, backdown weight calculator, auto-backdown fill, edit completed sets
- **Meal Tracking** — toggle meals eaten, custom entries, grocery list view, prep view, macro targets (calories, protein, fat, carbs)
- **Progress** — weight chart, PR tracking, 1RM estimator (Epley), delete entries
- **Plans** — 15-week program timeline, accordion day viewer, JSON import
- **Dashboard** — today's workout card, macro rings, current program day
- **Program Scheduling** — day-based (not weekday): Day 1 Push, Day 2 Pull, Day 3 Legs, Day 4 Upper, Days 5–7 Rest

### Coach
- **Client Roster** — invite clients by email (branded Resend email with magic link), pending/active status
- **Plan Assignment** — assign workout + meal plans to clients; clients see coach's plan via RLS
- **Weight Overrides** — set per-exercise starting weights for clients; pre-fills all sets in client's workout logger
- **Desktop Layout** — sidebar nav on md+ screens, two-column client roster + detail panel

### Auth
- Email + password sign up / sign in / forgot password / reset password
- Google OAuth
- Coach invite via magic link → password setup on first login
- Profile onboarding (name + role picker) on first login
- Role-based UI: Athlete (6 tabs), Coach (3 tabs), Both (7 tabs)
- Admin mode switcher for previewing all role UIs

### PWA
- Installable on iOS and Android
- Offline asset caching via Workbox
- Google Fonts cached via service worker

---

## Architecture

```
src/
├── context/
│   └── AppContext.jsx       # Global state — loads Supabase data on mount, seeds on first launch
├── lib/
│   ├── supabase.js          # Supabase client singleton
│   └── db.js               # Async CRUD + coach RPCs (normalizes DB ↔ JS shapes)
├── utils/
│   └── planUtils.js        # Pure computation — getProgramDay, getTodaysWorkout, etc.
├── data/
│   └── seedData.js         # Default 15-week workout block + 7-day meal rotation
└── pages/
    ├── Auth.jsx
    ├── Onboarding.jsx
    ├── UpdatePassword.jsx
    ├── Dashboard.jsx
    ├── Workout.jsx
    ├── Meals.jsx
    ├── Progress.jsx
    ├── Plans.jsx
    ├── CoachDashboard.jsx
    └── Settings.jsx

supabase/
└── functions/
    └── invite-client/      # Generates magic link, sends Resend email, upserts coach_clients

email-templates/
├── confirm-signup.html     # → Supabase Auth → Confirm signup template
├── reset-password.html     # → Supabase Auth → Reset password template
└── magic-link.html         # → Supabase Auth → Magic link template
```

All writes are optimistic — state updates immediately in the UI, Supabase write fires in the background.

---

## Database

**Supabase Project ID:** `uztmqmblzmqpwrwqqnml`

### Tables

| Table | Notes |
|---|---|
| `user_profile` | PK: user_id. display_name, role, onboarded, is_admin, macro targets, active plan IDs |
| `workout_plans` | JSONB. RLS: owner OR assigned client |
| `meal_plans` | JSONB. RLS: owner OR assigned client |
| `workout_logs` | Unique: user_id + date + day_name |
| `meal_logs` | Unique: user_id + date |
| `weight_log` | Unique: user_id + date |
| `coach_clients` | coach_id, client_email, client_id (null until accepted), status: pending/active |
| `plan_assignments` | coach_id → client_id → workout_plan_id + meal_plan_id |
| `exercise_weight_overrides` | coach_id → client_id → exercise_name → weight_lbs |

### SECURITY DEFINER RPCs

| Function | Purpose |
|---|---|
| `auto_link_client()` | Links pending coach_clients rows when client first logs in |
| `get_coach_clients_with_profiles()` | Coach reads client names/roles across RLS boundary |
| `assign_plan_to_client(client_id, workout_plan_id, meal_plan_id)` | Updates plan_assignments + client's user_profile |
| `upsert_weight_override(client_id, exercise_name, weight_lbs)` | Coach sets per-exercise weight for a client |
| `delete_weight_override(client_id, exercise_name)` | Removes a weight override |

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

4. Start the dev server
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

## Roadmap

### Done
- [x] Workout logger (sets, reps, RPE, rest timer, backdown calc)
- [x] Meal tracking (toggle eaten, custom entries, grocery list, prep view)
- [x] Progress tracking (weight chart, PRs, 1RM estimator)
- [x] Plans viewer + JSON import
- [x] Dashboard (workout card, macro rings, program day)
- [x] Supabase Auth — email/password + Google OAuth + password reset
- [x] Profile onboarding + role-based UI (Athlete / Coach / Both)
- [x] Admin mode switcher
- [x] PWA — installable, offline caching, iOS meta tags
- [x] Coach dashboard + client invite (Resend branded email)
- [x] Plan assignment (coach assigns workout + meal plans to clients)
- [x] Weight overrides (coach sets per-exercise weights, pre-fills client's logger)
- [x] Desktop layout — sidebar nav, two-column coach dashboard

### Up Next
- [ ] **Meal Plan Sharing UI** — coach pushes meal plans to clients (DB already wired)
- [ ] **Client Progress View** — coach sees client's weight history, PRs, and session logs
- [ ] **AI Meal Plan Generation** — Claude API via Supabase Edge Function
- [ ] **Food Search / Logging** — Nutritionix API integration
