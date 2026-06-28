// aiProvider.js — routes to Gemini, Claude, or mock based on AI_PROVIDER env var

const geminiService = require('./geminiService')
const claudeService = require('./claudeService')

const PROVIDER = process.env.AI_PROVIDER || 'mock'

const aiProvider = {
  async generateWorkout(preferences) {
    if (PROVIDER === 'gemini') {
      try {
        return { ...await geminiService.generateWorkout(preferences), _usedFallback: false }
      } catch (err) {
        console.warn('[AI] Gemini failed, falling back to mock:', err.message)
        return { ...mockGenerateWorkout(preferences), _usedFallback: true }
      }
    }
    if (PROVIDER === 'claude') {
      try {
        return { ...await claudeService.generateWorkout(preferences), _usedFallback: false }
      } catch (err) {
        console.warn('[AI] Claude failed, falling back to mock:', err.message)
        return { ...mockGenerateWorkout(preferences), _usedFallback: true }
      }
    }
    return { ...mockGenerateWorkout(preferences), _usedFallback: false }
  },
}

// ─── Exercise library ─────────────────────────────────────────────────────────

const EX = {
  push: {
    gym: [
      { name: 'Barbell Bench Press',    sets: 4, reps: '6-8',   rest: '2 min',  coachingNote: 'Control the descent for 2-3 seconds. Drive feet into floor at lockout.' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10',  rest: '90s',    coachingNote: 'Set bench to 30°. Keep shoulder blades retracted throughout.' },
      { name: 'Overhead Press',         sets: 3, reps: '8-10',  rest: '90s',    coachingNote: 'Brace your core. Avoid hyperextending the lower back at lockout.' },
      { name: 'Cable Lateral Raises',   sets: 3, reps: '12-15', rest: '60s',    coachingNote: 'Lead with your elbow, not your hand. Slight forward lean helps isolate the deltoid.' },
      { name: 'Tricep Rope Pushdown',   sets: 3, reps: '12-15', rest: '60s',    coachingNote: 'Spread the rope at the bottom. Keep elbows pinned to your sides.' },
    ],
    bw: [
      { name: 'Push-Ups',              sets: 4, reps: '12-16',  rest: '60s',    coachingNote: 'Full ROM — chest to floor. Core braced the entire set.' },
      { name: 'Pike Push-Ups',         sets: 3, reps: '10-12',  rest: '60s',    coachingNote: 'Hips high in an inverted V. Targets anterior deltoids and upper chest.' },
      { name: 'Diamond Push-Ups',      sets: 3, reps: '10',     rest: '75s',    coachingNote: 'Hands form a diamond under chest. Primary tricep isolation movement.' },
      { name: 'Wide-Grip Push-Ups',    sets: 3, reps: '12-15',  rest: '60s',    coachingNote: 'Wider hand placement shifts emphasis to chest over triceps.' },
      { name: 'Chair Dips',            sets: 3, reps: '10-12',  rest: '75s',    coachingNote: 'Keep elbows tracking back, not flaring. Lower until 90° bend at elbow.' },
    ],
  },
  pull: {
    gym: [
      { name: 'Barbell Bent-Over Row',  sets: 4, reps: '6-8',   rest: '2 min',  coachingNote: 'Hinge to 45°. Pull the bar to your lower chest — squeeze shoulder blades at the top.' },
      { name: 'Lat Pulldown',           sets: 3, reps: '8-10',  rest: '90s',    coachingNote: 'Slight lean back. Pull to upper chest — never behind the neck.' },
      { name: 'Seated Cable Row',       sets: 3, reps: '10-12', rest: '75s',    coachingNote: 'Keep chest tall. Pull elbows back and hold the contraction for 1 second.' },
      { name: 'Face Pulls',             sets: 3, reps: '15-20', rest: '60s',    coachingNote: 'Pull to eye level and externally rotate. Critical for long-term shoulder health.' },
      { name: 'EZ-Bar Curls',           sets: 3, reps: '10-12', rest: '60s',    coachingNote: 'Supinate fully at the top. No swinging — strict elbow positioning.' },
    ],
    bw: [
      { name: 'Pull-Ups',              sets: 4, reps: '5-8 (max)', rest: '2 min',  coachingNote: 'Dead hang to start. Engage lats before pulling. Chin clears the bar.' },
      { name: 'Chin-Ups',             sets: 3, reps: '5-8',      rest: '90s',    coachingNote: 'Supinated grip adds bicep involvement. Full ROM each rep.' },
      { name: 'Inverted Rows',        sets: 3, reps: '10-12',    rest: '75s',    coachingNote: 'Body rigid as a plank. Chest to bar. Use a table or low bar.' },
      { name: 'Hammer Curls (DB)',    sets: 3, reps: '10 each',  rest: '60s',    coachingNote: 'Neutral grip. Trains brachialis for overall arm thickness.' },
    ],
  },
  legs_quad: {
    gym: [
      { name: 'Barbell Back Squat',    sets: 4, reps: '6-8',   rest: '2-3 min',  coachingNote: 'Break parallel. Knees track over toes. Maintain a tall chest throughout.' },
      { name: 'Leg Press',             sets: 3, reps: '10-12', rest: '90s',      coachingNote: 'Foot placement dictates emphasis. Never lock knees out at the top.' },
      { name: 'Walking Lunges',        sets: 3, reps: '10 each', rest: '75s',    coachingNote: 'Long stride. Front knee stays behind toes. Torso stays upright.' },
      { name: 'Leg Extension',         sets: 3, reps: '12-15', rest: '60s',      coachingNote: 'Full extension. Pause and squeeze at the top. Slow 3-second eccentric.' },
      { name: 'Standing Calf Raises',  sets: 4, reps: '15-20', rest: '60s',      coachingNote: 'Full stretch at the bottom. Hold the peak contraction for 1 second.' },
    ],
    bw: [
      { name: 'Bodyweight Squats',           sets: 4, reps: '20-25',   rest: '60s', coachingNote: '3-second descent. Pause at the bottom for maximum time under tension.' },
      { name: 'Bulgarian Split Squats',      sets: 3, reps: '12 each', rest: '75s', coachingNote: 'Rear foot elevated. Front knee tracks over toes. Core tight throughout.' },
      { name: 'Jump Squats',                 sets: 3, reps: '12',       rest: '60s', coachingNote: 'Land softly — absorb impact through ankles, knees, and hips.' },
      { name: 'Lateral Lunges',              sets: 3, reps: '10 each', rest: '60s', coachingNote: 'Push hips back on the working side. Keep the chest tall and neutral spine.' },
      { name: 'Wall Sit',                    sets: 3, reps: '45-60s',   rest: '60s', coachingNote: '90° at knee and hip. Isometric hold — breathe steadily.' },
    ],
  },
  legs_hip: {
    gym: [
      { name: 'Romanian Deadlift',    sets: 4, reps: '8-10',  rest: '90s',    coachingNote: 'Push hips back, not down. Feel a deep hamstring stretch. Neutral spine always.' },
      { name: 'Leg Curl',             sets: 3, reps: '10-12', rest: '75s',    coachingNote: 'Pause and squeeze at the top. 3-second eccentric for maximum stimulus.' },
      { name: 'Barbell Hip Thrust',   sets: 3, reps: '10-12', rest: '90s',    coachingNote: 'Bar pad on hip crease. Drive through heels. Full hip extension at the top.' },
      { name: 'Good Mornings',        sets: 3, reps: '12-15', rest: '75s',    coachingNote: 'Soft bend in knees. Hinge until torso is parallel to the floor.' },
      { name: 'Seated Calf Raises',   sets: 4, reps: '15-20', rest: '60s',    coachingNote: 'Full range of motion. The seated position targets the soleus more deeply.' },
    ],
    bw: [
      { name: 'Glute Bridges',              sets: 4, reps: '20',      rest: '60s', coachingNote: 'Drive through heels. Squeeze glutes maximally at the top. 1-second hold.' },
      { name: 'Single-Leg Glute Bridge',    sets: 3, reps: '15 each', rest: '60s', coachingNote: 'Non-working leg straight. Keep hips level — do not let them drop.' },
      { name: 'Sumo Squat (BW)',            sets: 3, reps: '15-20',   rest: '60s', coachingNote: 'Wide stance, toes out 45°. Targets inner thighs and glutes.' },
      { name: 'Donkey Kicks',               sets: 3, reps: '15 each', rest: '45s', coachingNote: 'Keep knee bent 90°. Squeeze glute at the top. Avoid rotating the hips.' },
    ],
  },
  core: [
    { name: 'Plank Hold',            sets: 3, reps: '45-60s', rest: '45s', coachingNote: 'Neutral spine. Brace like you are about to be punched. Breathe steadily.' },
    { name: 'Dead Bug',              sets: 3, reps: '10 each', rest: '45s', coachingNote: 'Lower back pressed flat into the floor. Opposite arm and leg extend slowly.' },
    { name: 'Hanging Leg Raises',    sets: 3, reps: '10-12',  rest: '60s', coachingNote: 'No swinging. Posterior pelvic tilt at the top for full rectus engagement.' },
    { name: 'Ab Wheel Rollout',      sets: 3, reps: '8-10',   rest: '60s', coachingNote: 'Only extend as far as you can maintain a neutral spine. No hyperextension.' },
    { name: 'Bicycle Crunches',      sets: 3, reps: '20',     rest: '45s', coachingNote: 'Slow and controlled. Elbow to opposite knee — full rotation each rep.' },
  ],
  warmup: { name: 'Dynamic Warm-Up', sets: 1, reps: '5 min', rest: '—', coachingNote: 'Arm circles, leg swings, hip circles, and 5 min light cardio to elevate heart rate.' },
  cooldown: { name: 'Cool-Down Stretch', sets: 1, reps: '5 min', rest: '—', coachingNote: 'Static stretches for the muscles worked. Hold each stretch 20-30 seconds.' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pool(type, equipment) {
  const useGym = ['Commercial Gym', 'Home Gym', 'Dumbbells Only'].includes(equipment)
  const lib = EX[type]
  if (!lib) return []
  if (Array.isArray(lib)) return lib  // core is a flat array
  return useGym ? lib.gym : lib.bw
}

// Apply training style rep/rest overrides to an exercise list
function applyStyle(exercises, style) {
  const overrides = {
    Heavy:       { repsMain: '3-5',   repsAcc: '4-6',   restMain: '3-5 min', restAcc: '2-3 min', setsMain: 5 },
    Moderate:    { repsMain: '6-8',   repsAcc: '10-12', restMain: '90s',     restAcc: '75s',      setsMain: 4 },
    'High Volume':{ repsMain: '12-15', repsAcc: '15-20', restMain: '60s',     restAcc: '45s',      setsMain: 4 },
    Functional:  { repsMain: '8-12',  repsAcc: '12-15', restMain: '75s',     restAcc: '60s',      setsMain: 4 },
  }
  const o = overrides[style] || overrides['Moderate']

  return exercises.map((ex, i) => ({
    ...ex,
    sets: i === 0 ? o.setsMain : ex.sets,
    reps: i === 0 ? o.repsMain : (i <= 2 ? o.repsAcc : ex.reps),
    rest: i === 0 ? o.restMain : (i <= 2 ? o.restAcc : ex.rest),
  }))
}

function pick(arr, count) {
  return arr.slice(0, count)
}

function day(label, dayName, focus, exercises) {
  return { label, day: dayName, focus, exercises: [EX.warmup, ...exercises, EX.cooldown] }
}

// ─── Schedule builders by split ───────────────────────────────────────────────

function buildFullBody(n, eq, style) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const variants = [
    { focus: 'Full Body — Squat & Push Emphasis',  exs: [...pick(pool('legs_quad', eq), 2), ...pick(pool('push', eq), 2), ...pick(pool('pull', eq), 1), ...pick(EX.core, 1)] },
    { focus: 'Full Body — Hinge & Pull Emphasis',  exs: [...pick(pool('legs_hip',  eq), 2), ...pick(pool('pull', eq), 2), ...pick(pool('push', eq), 1), ...pick(EX.core, 1)] },
    { focus: 'Full Body — Volume & Conditioning',  exs: [...pick(pool('push', eq), 2), ...pick(pool('pull', eq), 2), ...pick(pool('legs_quad', eq), 1), ...pick(EX.core, 1)] },
  ]
  return Array.from({ length: n }, (_, i) => {
    const v = variants[i % 3]
    return day(`Day ${i + 1}`, days[i], v.focus, applyStyle(v.exs, style))
  })
}

function buildUpperLower(n, eq, style) {
  const schedule = [
    { d: 'Monday',    f: 'Upper Body — Push Focus',       exs: [...pick(pool('push', eq), 4), ...pick(EX.core, 1)] },
    { d: 'Tuesday',   f: 'Lower Body — Quad Dominant',    exs: [...pick(pool('legs_quad', eq), 4), ...pick(EX.core, 1)] },
    { d: 'Thursday',  f: 'Upper Body — Pull Focus',       exs: [...pick(pool('pull', eq), 4), ...pick(EX.core, 1)] },
    { d: 'Friday',    f: 'Lower Body — Posterior Chain',  exs: [...pick(pool('legs_hip',  eq), 4), ...pick(EX.core, 1)] },
    { d: 'Saturday',  f: 'Upper Body — Hypertrophy',      exs: [...pick(pool('push', eq), 2), ...pick(pool('pull', eq), 2), ...pick(EX.core, 1)] },
    { d: 'Sunday',    f: 'Lower Body — Total Legs',       exs: [...pick(pool('legs_quad', eq), 2), ...pick(pool('legs_hip', eq), 2), ...pick(EX.core, 1)] },
  ]
  return schedule.slice(0, n).map((s, i) =>
    day(`Day ${i + 1}`, s.d, s.f, applyStyle(s.exs, style))
  )
}

function buildPPL(n, eq, style) {
  const cycle = [
    { d: 'Monday',    f: 'Push — Chest, Shoulders & Triceps', exs: pick(pool('push', eq), 5) },
    { d: 'Tuesday',   f: 'Pull — Back & Biceps',              exs: pick(pool('pull', eq), 5) },
    { d: 'Wednesday', f: 'Legs — Quads, Hamstrings & Calves', exs: [...pick(pool('legs_quad', eq), 3), ...pick(pool('legs_hip', eq), 2)] },
    { d: 'Thursday',  f: 'Push — Hypertrophy Focus',          exs: [...pick(pool('push', eq).slice(2), 3), ...pick(pool('push', eq), 2)] },
    { d: 'Friday',    f: 'Pull — Hypertrophy Focus',          exs: [...pick(pool('pull', eq).slice(2), 3), ...pick(pool('pull', eq), 2)] },
    { d: 'Saturday',  f: 'Legs — Power & Conditioning',       exs: [...pick(pool('legs_hip', eq), 3), ...pick(pool('legs_quad', eq), 2)] },
  ]
  return cycle.slice(0, n).map((s, i) =>
    day(`Day ${i + 1}`, s.d, s.f, applyStyle(s.exs, style))
  )
}

function buildArnold(n, eq, style) {
  const cycle = [
    { d: 'Monday',    f: 'Chest & Back',           exs: [...pick(pool('push', eq), 3), ...pick(pool('pull', eq), 3)] },
    { d: 'Tuesday',   f: 'Shoulders & Arms',       exs: [pool('push', eq)[2], ...pick(pool('pull', eq).slice(3), 2), ...pick(EX.core, 1)] },
    { d: 'Wednesday', f: 'Legs',                   exs: [...pick(pool('legs_quad', eq), 3), ...pick(pool('legs_hip', eq), 2)] },
    { d: 'Thursday',  f: 'Chest & Back (Volume)',  exs: [...pick(pool('push', eq).slice(1), 3), ...pick(pool('pull', eq).slice(1), 3)] },
    { d: 'Friday',    f: 'Shoulders & Arms (Volume)', exs: [pool('push', eq)[3], pool('pull', eq)[4], ...pick(EX.core, 2)] },
    { d: 'Saturday',  f: 'Legs (Hypertrophy)',     exs: [...pick(pool('legs_hip', eq), 3), ...pick(pool('legs_quad', eq), 2)] },
  ]
  return cycle.slice(0, n).map((s, i) =>
    day(`Day ${i + 1}`, s.d, s.f, applyStyle(s.exs.filter(Boolean), style))
  )
}

function recommendSplit(days) {
  if (days <= 3) return 'Full Body'
  if (days === 4) return 'Upper/Lower'
  if (days === 5) return 'Upper/Lower'
  return 'Push Pull Legs'
}

// ─── Text generators ──────────────────────────────────────────────────────────

function makeName(name, goal, split, days) {
  const prefix = name && name !== 'Athlete' ? `${name}'s ` : ''
  return `${prefix}${days}-Day ${split} Program — ${goal}`
}

function makePhilosophy(goal, style, exp) {
  const phils = {
    'Build Muscle':
      `This program applies progressive overload through controlled volume accumulation — the most evidence-backed driver of hypertrophy. Compound lifts anchor each session, supplemented by isolation work to fully develop individual muscle groups. As a ${exp.toLowerCase()}, ${style === 'Heavy' ? 'heavier loads and lower reps are used to recruit high-threshold motor units.' : style === 'High Volume' ? 'higher rep ranges and moderate loads maximize time under tension and metabolic stress.' : 'moderate loads and rep ranges balance mechanical tension with muscle damage for optimal growth.'}`,
    'Lose Fat':
      `This program preserves lean muscle mass while creating a caloric expenditure environment conducive to fat loss. Higher rep ranges and shorter rest periods elevate the metabolic cost of each session without sacrificing muscle-building stimulus. Compound movements are prioritized for their superior hormonal and cardiovascular response.`,
    'Strength':
      `This program follows a strength-focused model built around the major barbell movements. Progressive overload through load increases is the primary driver, with rep ranges kept low to build maximum neuromuscular efficiency and motor unit recruitment. Accessory work addresses weak points and builds structural integrity.`,
    'Athletic Performance':
      `This program develops the physical qualities that transfer directly to sport: power output, movement efficiency, and structural resilience. Training is organized to develop fast-twitch fiber recruitment and joint stability simultaneously, with an emphasis on movement quality over absolute load.`,
  }
  return phils[goal] || phils['Build Muscle']
}

function makeRecovery(days, cardio) {
  const tips = [
    'Sleep 7-9 hours per night — this is when the majority of muscle protein synthesis and tissue repair occurs.',
    `Aim for 8,000-10,000 steps on rest days. Low-intensity movement accelerates recovery without adding training stress.`,
    'Prioritize post-workout nutrition: 30-40g protein and moderate carbs within 90 minutes of finishing your session.',
    cardio !== 'None' ? 'Keep cardio sessions at low-to-moderate intensity on rest days to avoid interfering with strength adaptations.' : 'On rest days, consider 10-15 min of light stretching or foam rolling on the muscles trained the day prior.',
    days >= 5 ? 'With a high training frequency, deload every 4-6 weeks: reduce volume by 40% while maintaining intensity.' : 'Take at least 1-2 full rest days per week. Muscles grow during recovery, not during training.',
  ]
  return tips.slice(0, 3)
}

function makeProgression(goal, style) {
  const plans = {
    Heavy:        'Add 5 lbs to upper body lifts and 10 lbs to lower body lifts each week you successfully complete all prescribed sets and reps. When you stall for 2+ consecutive weeks on a lift, drop the load by 10% and rebuild — this is normal and expected.',
    Moderate:     'Use double progression: once you hit the top of the rep range for all sets, increase the weight by the smallest increment available on the next session. Track every workout — what gets measured gets improved.',
    'High Volume': 'Add one set per exercise every 2 weeks across a 4-week block. In week 5, reduce volume back to baseline and increase load by 5-10%. This wave loading keeps progress continuous without accumulating excessive fatigue.',
    Functional:   'Progress by improving movement quality first, then adding load. Film your sets periodically to audit form. Once technique is dialed, increase load by 5% every 2 weeks on compound movements.',
  }
  return plans[style] || plans['Moderate']
}

function makeNutrition(goal) {
  const n = {
    'Build Muscle':         'Target 0.8-1g of protein per pound of bodyweight daily to fuel muscle protein synthesis. Eat in a modest caloric surplus of 200-350 calories above maintenance — enough to support muscle growth without excessive fat gain. Prioritize protein at each meal and ensure adequate carbohydrate intake around training sessions.',
    'Lose Fat':             'Aim for 0.8-1g of protein per pound of bodyweight to protect muscle mass while in a caloric deficit. A moderate deficit of 300-500 calories per day leads to sustainable fat loss of 0.5-1 lb per week. Do not slash calories too aggressively — it will impair training performance and increase muscle loss.',
    'Strength':             'Strength athletes perform best when fueled adequately. Eat at or slightly above maintenance calories with 0.8-1g protein per pound of bodyweight. Prioritize complex carbohydrates before training sessions to ensure maximal glycogen availability for high-intensity lifting.',
    'Athletic Performance': 'Fuel your training with quality carbohydrates before sessions and lean protein after. Hydration is critical — even mild dehydration reduces power output by 5-10%. Aim for 0.7-0.9g protein per pound of bodyweight and do not neglect dietary fat, which supports joint health and hormone production.',
  }
  return n[goal] || n['Build Muscle']
}

// ─── Main mock function ───────────────────────────────────────────────────────

function mockGenerateWorkout(prefs = {}) {
  const {
    name          = 'Athlete',
    goal          = 'Build Muscle',
    experience    = 'Intermediate',
    daysPerWeek   = 4,
    split         = 'Upper/Lower',
    duration      = '60 min',
    equipment     = 'Commercial Gym',
    cardio        = 'Moderate',
    trainingStyle = 'Moderate',
  } = prefs

  const effectiveSplit = split === 'AI Recommend' ? recommendSplit(daysPerWeek) : split

  let schedule
  if (effectiveSplit === 'Push Pull Legs')  schedule = buildPPL(daysPerWeek, equipment, trainingStyle)
  else if (effectiveSplit === 'Arnold')     schedule = buildArnold(daysPerWeek, equipment, trainingStyle)
  else if (effectiveSplit === 'Upper/Lower') schedule = buildUpperLower(daysPerWeek, equipment, trainingStyle)
  else                                       schedule = buildFullBody(daysPerWeek, equipment, trainingStyle)

  return {
    name:            makeName(name, goal, effectiveSplit, daysPerWeek),
    description:     `A ${daysPerWeek}-day ${effectiveSplit} program designed to help you ${goal.toLowerCase()} using ${equipment.toLowerCase()}. Each session runs approximately ${duration}.`,
    philosophy:      makePhilosophy(goal, trainingStyle, experience),
    level:           experience,
    daysPerWeek,
    duration,
    trainingStyle,
    split:           effectiveSplit,
    weeklySchedule:  schedule,
    recoveryTips:    makeRecovery(daysPerWeek, cardio),
    progressionPlan: makeProgression(goal, trainingStyle),
    nutritionReminder: makeNutrition(goal),
  }
}

module.exports = aiProvider
