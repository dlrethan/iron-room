// ─── Workout Plan ────────────────────────────────────────────────────────────

const MONTH1_PUSH = [
  { order: 1, name: "Barbell Bench Press",                  sets: 4, repRangeMin: 6,  repRangeMax: 8,  restSeconds: 180, notes: "Strength anchor — 3-sec eccentric" },
  { order: 2, name: "Incline Dumbbell Press",               sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 120, notes: "Stretch at bottom" },
  { order: 3, name: "Cable Chest Fly (low-to-high)",        sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Squeeze at peak" },
  { order: 4, name: "Cable Lateral Raise",                  sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Lead with elbow" },
  { order: 5, name: "Overhead Triceps Extension (cable/DB)",sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Stretch position — most effective for tri growth" },
];

const MONTH1_PULL = [
  { order: 1, name: "Barbell Row",                  sets: 4, repRangeMin: 6,  repRangeMax: 8,  restSeconds: 180, notes: "Strength anchor — drive elbows back" },
  { order: 2, name: "Lat Pulldown (wide grip)",     sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 120, notes: "Full stretch overhead" },
  { order: 3, name: "Seated Cable Row (neutral grip)",sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90, notes: "No torso swing" },
  { order: 4, name: "Face Pull (rope)",             sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "External rotation at peak" },
  { order: 5, name: "Incline Dumbbell Curl",        sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Arms behind torso = max stretch" },
];

const MONTH1_LEGS = [
  { order: 1, name: "Barbell Back Squat",     sets: 4, repRangeMin: 6,  repRangeMax: 8,  restSeconds: 210, notes: "Strength anchor — full depth" },
  { order: 2, name: "Hack Squat",             sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 150, notes: "Feet low, emphasize quad stretch" },
  { order: 3, name: "Romanian Deadlift (barbell)", sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 150, notes: "Full hamstring stretch every rep" },
  { order: 4, name: "Seated Leg Curl",        sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Hip flexed = hamstring stretched" },
  { order: 5, name: "Standing Calf Raise",    sets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "2-sec pause at full stretch" },
];

const MONTH1_UPPER = [
  { order: 1, name: "Seated Dumbbell Overhead Press", sets: 3, repRangeMin: 8,  repRangeMax: 10, restSeconds: 120, notes: "Shoulder strength anchor" },
  { order: 2, name: "Single-Arm Cable Row",           sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 120, notes: "Full stretch, squeeze scapula" },
  { order: 3, name: "Cable Lateral Raise",            sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Strict form" },
  { order: 4, name: "EZ-Bar Curl",                    sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "3-sec eccentric" },
  { order: 5, name: "Triceps Pushdown (straight bar)",sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Elbows tucked" },
];

const MONTH2_PUSH = [
  { order: 1, name: "Barbell Bench Press",                   sets: 4, repRangeMin: 5,  repRangeMax: 6,  restSeconds: 210, notes: "Heavier than Month 1" },
  { order: 2, name: "Incline Dumbbell Press",                sets: 4, repRangeMin: 10, repRangeMax: 12, restSeconds: 120, notes: "+1 set from Month 1" },
  { order: 3, name: "Cable Chest Fly (low-to-high)",         sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Slow eccentric" },
  { order: 4, name: "Cable Lateral Raise",                   sets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "+1 set" },
  { order: 5, name: "Overhead Triceps Extension (cable)",    sets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "+1 set, heavier" },
  { order: 6, name: "Triceps Pushdown (rope)",               sets: 2, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Pump finisher" },
];

const MONTH2_PULL = [
  { order: 1, name: "Barbell Row",                       sets: 4, repRangeMin: 5,  repRangeMax: 6,  restSeconds: 180, notes: "Heavier than Month 1" },
  { order: 2, name: "Lat Pulldown (underhand grip)",     sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 120, notes: "Grip change = new stimulus" },
  { order: 3, name: "Chest-Supported Dumbbell Row",      sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 120, notes: "No torso fatigue" },
  { order: 4, name: "Face Pull (rope)",                  sets: 3, repRangeMin: 20, repRangeMax: 25, restSeconds: 60,  notes: "High rep for shoulder health" },
  { order: 5, name: "Incline Dumbbell Curl",             sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Increase load from Month 1" },
  { order: 6, name: "Hammer Curl",                       sets: 2, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Brachialis + long head" },
];

const MONTH2_LEGS = [
  { order: 1, name: "Barbell Back Squat",      sets: 4, repRangeMin: 5,  repRangeMax: 6,  restSeconds: 210, notes: "Heavier than Month 1" },
  { order: 2, name: "Leg Press",               sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 150, notes: "Feet low/close for quad emphasis" },
  { order: 3, name: "Romanian Deadlift (barbell)", sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 150, notes: "Increase load from Month 1" },
  { order: 4, name: "Seated Leg Curl",         sets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "+1 set" },
  { order: 5, name: "Hack Squat",              sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 120, notes: "Alternate with leg press" },
  { order: 6, name: "Seated Calf Raise",       sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Different angle than standing" },
];

const MONTH2_UPPER = [
  { order: 1, name: "Seated Dumbbell Overhead Press",  sets: 4, repRangeMin: 8,  repRangeMax: 10, restSeconds: 120, notes: "+1 set from Month 1" },
  { order: 2, name: "Cable Row (wide grip / overhand)",sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Upper back focus" },
  { order: 3, name: "Cable Lateral Raise",             sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Strict — no body English" },
  { order: 4, name: "Preacher Curl (EZ-bar)",          sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90,  notes: "Bottom ROM = max stretch" },
  { order: 5, name: "Overhead DB Triceps Extension",   sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Stretch-mediated" },
];

const MONTH3_PUSH = [
  { order: 1, name: "Barbell Bench Press",                sets: 5, repRangeMin: 4,  repRangeMax: 5,  restSeconds: 240, notes: "PEAK — chase 5-rep PRs" },
  { order: 2, name: "Incline Dumbbell Press",             sets: 4, repRangeMin: 8,  repRangeMax: 10, restSeconds: 120, notes: "Highest load of the block" },
  { order: 3, name: "Cable Chest Fly (low-to-high)",      sets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "+1 set from Month 2" },
  { order: 4, name: "Cable Lateral Raise",                sets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Load increased" },
  { order: 5, name: "Overhead Triceps Extension (cable)", sets: 4, repRangeMin: 10, repRangeMax: 12, restSeconds: 90,  notes: "Heavier than Month 2" },
  { order: 6, name: "Triceps Pushdown (rope)",            sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Pump finisher" },
];

const MONTH3_PULL = [
  { order: 1, name: "Barbell Row",                  sets: 5, repRangeMin: 4,  repRangeMax: 5,  restSeconds: 210, notes: "PEAK — heaviest loads" },
  { order: 2, name: "Lat Pulldown (wide grip)",     sets: 4, repRangeMin: 8,  repRangeMax: 10, restSeconds: 120, notes: "Return to wide, increase load" },
  { order: 3, name: "Chest-Supported DB Row",       sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 120, notes: "Controlled, slow eccentric" },
  { order: 4, name: "Face Pull (rope)",             sets: 3, repRangeMin: 20, repRangeMax: 25, restSeconds: 60,  notes: "Shoulder health — maintain" },
  { order: 5, name: "Incline Dumbbell Curl",        sets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Peak bicep volume" },
  { order: 6, name: "Cable Curl (low pulley)",      sets: 3, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Constant tension" },
];

const MONTH3_LEGS = [
  { order: 1, name: "Barbell Back Squat",      sets: 5, repRangeMin: 4,  repRangeMax: 5,  restSeconds: 240, notes: "PEAK — chase 5-rep PRs" },
  { order: 2, name: "Hack Squat",              sets: 4, repRangeMin: 8,  repRangeMax: 10, restSeconds: 150, notes: "Quad isolation after heavy squat" },
  { order: 3, name: "Leg Press",               sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 150, notes: "Peak quad volume" },
  { order: 4, name: "Romanian Deadlift (barbell)", sets: 3, repRangeMin: 8, repRangeMax: 10, restSeconds: 150, notes: "Heavier than Month 2" },
  { order: 5, name: "Seated Leg Curl",         sets: 4, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Peak hamstring isolation" },
  { order: 6, name: "Standing Calf Raise",     sets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Full stretch, 2-sec pause" },
];

const MONTH3_UPPER = [
  { order: 1, name: "Seated Dumbbell Overhead Press", sets: 4, repRangeMin: 6,  repRangeMax: 8,  restSeconds: 150, notes: "Heavier than Month 2" },
  { order: 2, name: "Single-Arm Cable Row",           sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Full stretch and peak contraction" },
  { order: 3, name: "Cable Lateral Raise",            sets: 4, repRangeMin: 15, repRangeMax: 20, restSeconds: 60,  notes: "Peak side delt volume" },
  { order: 4, name: "Incline Dumbbell Curl",          sets: 3, repRangeMin: 12, repRangeMax: 15, restSeconds: 90,  notes: "Heaviest of block" },
  { order: 5, name: "Preacher Curl (EZ-bar)",         sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90,  notes: "Peak bicep volume" },
  { order: 6, name: "Overhead DB Triceps Extension",  sets: 3, repRangeMin: 10, repRangeMax: 12, restSeconds: 90,  notes: "Heaviest tri loads" },
];

// RPE scheme: repeats every 5 weeks (4 working + 1 deload)
const RPE_SCHEME = [
  { weekInMeso: 1, rpeTarget: "RPE 7 (3 RIR)", isDeload: false },
  { weekInMeso: 2, rpeTarget: "RPE 8 (2 RIR)", isDeload: false },
  { weekInMeso: 3, rpeTarget: "RPE 9 (1 RIR)", isDeload: false },
  { weekInMeso: 4, rpeTarget: "RPE 9–10 (0–1 RIR)", isDeload: false },
  { weekInMeso: 5, rpeTarget: "RPE 5–6 (Deload)", isDeload: true  },
];

function buildWeeks(monthExercises, monthNumber) {
  const weeks = [];
  const startWeek = (monthNumber - 1) * 5 + 1; // Weeks 1–5, 6–10, 11–15
  for (let i = 0; i < 5; i++) {
    const scheme = RPE_SCHEME[i];
    weeks.push({
      weekNumber: startWeek + i,
      rpeTarget: scheme.rpeTarget,
      isDeload: scheme.isDeload,
      days: [
        { dayName: "Push",  scheduledDayOfWeek: "Monday",    exercises: monthExercises.push },
        { dayName: "Pull",  scheduledDayOfWeek: "Wednesday", exercises: monthExercises.pull },
        { dayName: "Legs",  scheduledDayOfWeek: "Friday",    exercises: monthExercises.legs },
        { dayName: "Upper", scheduledDayOfWeek: "Saturday",  exercises: monthExercises.upper },
      ],
    });
  }
  return weeks;
}

export const seedWorkoutPlan = {
  planType: "workout",
  planName: "3-Month Hypertrophy Block",
  createdAt: "2026-03-21T00:00:00.000Z",
  weeks: [
    ...buildWeeks({ push: MONTH1_PUSH, pull: MONTH1_PULL, legs: MONTH1_LEGS, upper: MONTH1_UPPER }, 1),
    ...buildWeeks({ push: MONTH2_PUSH, pull: MONTH2_PULL, legs: MONTH2_LEGS, upper: MONTH2_UPPER }, 2),
    ...buildWeeks({ push: MONTH3_PUSH, pull: MONTH3_PULL, legs: MONTH3_LEGS, upper: MONTH3_UPPER }, 3),
  ],
};

// ─── Meal Plan ───────────────────────────────────────────────────────────────

export const seedMealPlan = {
  planType: "meal",
  planName: "7-Day Lean Bulk Rotation",
  createdAt: "2026-03-21T00:00:00.000Z",
  dailyTargets: {
    calories: 2000,
    proteinG: 180,
    fatG: 55,
    carbsG: 200,
  },
  days: [
    {
      dayOfWeek: "Monday",
      meals: [
        { mealName: "Lunch",  foods: "8oz chicken breast (air fryer) + 1.5 cups jasmine rice + 1.5 cups broccoli", sauce: "Gochujang mayo",    macros: { calories: 695, proteinG: 72, fatG: 10, carbsG: 75 } },
        { mealName: "Dinner", foods: "8oz 96% lean ground beef + 1.5 cups jasmine rice + 1 cup zucchini",          sauce: "Salsa verde",        macros: { calories: 680, proteinG: 68, fatG: 12, carbsG: 72 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                      sauce: "",                    macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Tuesday",
      meals: [
        { mealName: "Lunch",  foods: "8oz ground turkey (taco seasoning) + 2 cups jasmine rice + pico de gallo",   sauce: "Salsa",              macros: { calories: 680, proteinG: 66, fatG: 8,  carbsG: 82 } },
        { mealName: "Dinner", foods: "8oz shrimp (air fryer) + 1.5 cups jasmine rice + 1 cup bok choy",            sauce: "Garlic soy",         macros: { calories: 580, proteinG: 56, fatG: 6,  carbsG: 72 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                      sauce: "",                    macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Wednesday",
      meals: [
        { mealName: "Lunch",  foods: "8oz chicken breast (air fryer) + 1.5 cups sweet potato + 1.5 cups green beans", sauce: "Chimichurri",    macros: { calories: 660, proteinG: 72, fatG: 8,  carbsG: 72 } },
        { mealName: "Dinner", foods: "8oz 96% lean ground beef + 1.5 cups jasmine rice + 1 cup roasted peppers",       sauce: "Cajun",          macros: { calories: 680, proteinG: 68, fatG: 12, carbsG: 72 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                          sauce: "",               macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Thursday",
      meals: [
        { mealName: "Lunch",  foods: "8oz rotisserie chicken (pulled) + 1.5 cups jasmine rice + 1.5 cups broccoli", sauce: "Lemon pepper",     macros: { calories: 650, proteinG: 67, fatG: 9,  carbsG: 72 } },
        { mealName: "Dinner", foods: "8oz ground turkey + 1.5 cups jasmine rice + 1 cup snap peas",                  sauce: "Teriyaki",         macros: { calories: 660, proteinG: 66, fatG: 8,  carbsG: 78 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                        sauce: "",                 macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Friday",
      meals: [
        { mealName: "Lunch",  foods: "8oz chicken breast (air fryer) + 1.5 cups jasmine rice + 1.5 cups asparagus",  sauce: "Za'atar + lemon",          macros: { calories: 660, proteinG: 72, fatG: 8,  carbsG: 72 } },
        { mealName: "Dinner", foods: "8oz 96% lean ground beef + 1.5 cups sweet potato + 1 cup green beans",         sauce: "Smoked paprika + cumin",   macros: { calories: 660, proteinG: 68, fatG: 12, carbsG: 68 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                        sauce: "",                         macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Saturday",
      meals: [
        { mealName: "Lunch",  foods: "8oz shrimp (air fryer) + 1.5 cups jasmine rice + 1.5 cups broccoli",                    sauce: "Gochujang mayo", macros: { calories: 590, proteinG: 56, fatG: 8,  carbsG: 72 } },
        { mealName: "Dinner", foods: "8oz chicken breast (air fryer) + 1.5 cups jasmine rice + 1 cup zucchini + peppers",     sauce: "Chimichurri",    macros: { calories: 660, proteinG: 72, fatG: 8,  carbsG: 72 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                                 sauce: "",               macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
    {
      dayOfWeek: "Sunday",
      meals: [
        { mealName: "Lunch",  foods: "8oz ground turkey + 1.5 cups jasmine rice + 1.5 cups broccoli",            sauce: "Teriyaki",     macros: { calories: 660, proteinG: 66, fatG: 8,  carbsG: 75 } },
        { mealName: "Dinner", foods: "8oz chicken breast (air fryer) + 1.5 cups jasmine rice + 1 cup snap peas", sauce: "Salsa verde",  macros: { calories: 660, proteinG: 72, fatG: 8,  carbsG: 72 } },
        { mealName: "Shake",  foods: "2 scoops whey + water",                                                    sauce: "",             macros: { calories: 260, proteinG: 50, fatG: 3,  carbsG: 8  } },
      ],
    },
  ],
};

// ─── User Profile & Program Start ────────────────────────────────────────────

export const defaultUserProfile = {
  startingWeight: 280,
  calorieTarget: 2000,
  proteinTarget: 180,
  fatTarget: 55,
  carbsTarget: 200,
};

export const DEFAULT_PROGRAM_START_DATE = "2026-03-21";
