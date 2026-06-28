// validateResponse.js
// Validates and sanitizes every AI response before it reaches the frontend.
// Fills safe defaults for any missing or malformed fields so the app never crashes
// due to an unexpected AI output shape.

// ─── Defaults ────────────────────────────────────────────────────────────────

const EXERCISE_DEFAULTS = { name: 'Exercise', sets: 3, reps: '10', rest: '60s', coachingNote: '' }
const WORKOUT_DEFAULTS  = {
  name: 'AI Generated Workout', description: '', philosophy: '',
  level: 'Intermediate', daysPerWeek: 3, duration: '60 min',
  trainingStyle: 'Moderate', split: 'Full Body',
  weeklySchedule: [], recoveryTips: [], progressionPlan: '', nutritionReminder: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function str(val, fallback = '') {
  return typeof val === 'string' && val.trim() ? val.trim() : fallback
}

function num(val, fallback) {
  return typeof val === 'number' && val > 0 ? val : fallback
}

function arr(val) {
  return Array.isArray(val) ? val : []
}

// ─── Validators ──────────────────────────────────────────────────────────────

function validateExercise(raw) {
  if (!raw || typeof raw !== 'object') return null
  const name = str(raw.name)
  if (!name) return null           // exercise with no name is useless — drop it
  return {
    name,
    sets:         num(raw.sets, EXERCISE_DEFAULTS.sets),
    reps:         str(raw.reps, EXERCISE_DEFAULTS.reps),
    rest:         str(raw.rest, EXERCISE_DEFAULTS.rest),
    coachingNote: str(raw.coachingNote),
  }
}

function validateDay(raw, index) {
  if (!raw || typeof raw !== 'object') return null
  const exercises = arr(raw.exercises)
    .map(validateExercise)
    .filter(Boolean)
  return {
    day:       str(raw.day,   `Day ${index + 1}`),
    label:     str(raw.label, `Day ${index + 1}`),
    focus:     str(raw.focus, 'Full Body'),
    exercises,
  }
}

// Validates a full workout object — fills every missing field with safe defaults
function validateWorkout(raw) {
  if (!raw || typeof raw !== 'object') return { ...WORKOUT_DEFAULTS }

  const weeklySchedule = arr(raw.weeklySchedule)
    .map((d, i) => validateDay(d, i))
    .filter(Boolean)

  const recoveryTips = arr(raw.recoveryTips)
    .filter(t => typeof t === 'string' && t.trim())

  return {
    name:             str(raw.name,             WORKOUT_DEFAULTS.name),
    description:      str(raw.description),
    philosophy:       str(raw.philosophy),
    level:            str(raw.level,            WORKOUT_DEFAULTS.level),
    daysPerWeek:      num(raw.daysPerWeek,      WORKOUT_DEFAULTS.daysPerWeek),
    duration:         str(raw.duration,         WORKOUT_DEFAULTS.duration),
    trainingStyle:    str(raw.trainingStyle,    WORKOUT_DEFAULTS.trainingStyle),
    split:            str(raw.split,            WORKOUT_DEFAULTS.split),
    weeklySchedule,
    recoveryTips,
    progressionPlan:  str(raw.progressionPlan),
    nutritionReminder: str(raw.nutritionReminder),
  }
}

// Validates a coach agent response — ensures all fields exist and are the right type
function validateCoachResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      response: 'I processed your request but had trouble formatting the response. Please try again.',
      updatedWorkout: null,
      reasoning: '',
      recommendations: [],
    }
  }

  let updatedWorkout = null
  if (raw.updatedWorkout && typeof raw.updatedWorkout === 'object') {
    updatedWorkout = validateWorkout(raw.updatedWorkout)
    // If validation produced an empty schedule, log it but keep the object
    if (!updatedWorkout.weeklySchedule.length) {
      console.warn('[validateResponse] updatedWorkout has empty weeklySchedule after validation')
    }
  }

  return {
    response: str(raw.response, 'I processed your request. Please ask for more details if needed.'),
    updatedWorkout,
    reasoning:       str(raw.reasoning),
    recommendations: arr(raw.recommendations).filter(r => typeof r === 'string' && r.trim()),
  }
}

module.exports = { validateWorkout, validateCoachResponse }
