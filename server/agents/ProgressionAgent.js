// ProgressionAgent.js
// Calculates specific progressions mathematically, then asks Gemini to explain.
//
// Architecture:
//   1. Math engine applies double progression, linear, or volume progression
//      to each exercise in the workout — producing exact numbers.
//   2. Gemini receives the pre-calculated targets and is asked only to write
//      an encouraging, specific explanation.
//
// Gemini never invents the numbers — it only explains numbers the engine chose.

const geminiService = require('../services/geminiService')

// ─── Rep range parser ─────────────────────────────────────────────────────────

function parseRepRange(repsStr) {
  if (typeof repsStr === 'number') return { min: repsStr, max: repsStr }
  const match = String(repsStr || '').match(/(\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!match) return { min: 8, max: 12 }
  const min = parseInt(match[1], 10)
  const max = match[2] ? parseInt(match[2], 10) : min
  return { min, max }
}

// ─── Weight increment logic ───────────────────────────────────────────────────

// Big compound barbell lifts get 5 lb jumps; everything else gets 2.5 lb.
function getIncrement(exerciseName) {
  const name = (exerciseName || '').toLowerCase()
  const isBig = /squat|deadlift|bench press|barbell press|row/.test(name)
  return isBig ? 5 : 2.5
}

// ─── Progression models ───────────────────────────────────────────────────────

// Double Progression: complete top of rep range → add weight, reset to bottom.
// This is the primary model for intermediate lifters doing hypertrophy work.
function doubleProgression(exercise) {
  const { min, max } = parseRepRange(exercise.reps)
  const increment    = getIncrement(exercise.name)

  if (max > min) {
    // Rep range (e.g. 8-12) — assume they hit top of range since they reported completion
    return {
      model:      'double_progression',
      action:     'increase_weight',
      weightDelta: `+${increment} lbs`,
      newReps:    `${min}-${max}`,
      note:       `Completed ${max} reps — add ${increment} lbs and target ${min} reps again next session`,
    }
  } else {
    // Fixed rep target (e.g. 5×5) — just add weight
    return {
      model:      'linear',
      action:     'increase_weight',
      weightDelta: `+${increment} lbs`,
      newReps:    String(max),
      note:       `Linear progression: add ${increment} lbs each session`,
    }
  }
}

// Volume Progression: add a set when the current number of sets is below ceiling.
function volumeProgression(exercise) {
  const sets      = exercise.sets || 3
  const maxSets   = 5
  const { min, max } = parseRepRange(exercise.reps)

  if (sets < maxSets) {
    return {
      model:    'volume_progression',
      action:   'add_set',
      newSets:  sets + 1,
      newReps:  `${min}-${max}`,
      note:     `Add one set (${sets} → ${sets + 1}). Progress volume before increasing weight.`,
    }
  }

  // At max sets — switch to weight increase + reset volume
  const increment = getIncrement(exercise.name)
  return {
    model:       'volume_to_load',
    action:      'increase_weight',
    weightDelta: `+${increment} lbs`,
    newSets:     4,
    newReps:     `${min}-${max}`,
    note:        `Volume ceiling reached (${maxSets} sets). Add ${increment} lbs and reset to 4 sets.`,
  }
}

// ─── Choose model per exercise ────────────────────────────────────────────────

// Compound lifts → double progression  (load is the main variable)
// Isolation work → volume progression  (add sets before adding weight)
function selectModel(exercise) {
  const name = (exercise.name || '').toLowerCase()
  const isCompound = /squat|deadlift|bench|press|row|pull|dip|lunge|thrust/.test(name)
  return isCompound ? doubleProgression(exercise) : volumeProgression(exercise)
}

// ─── Apply progressions to workout ───────────────────────────────────────────

function calculateProgressions(workout) {
  const log = []

  const updatedSchedule = (workout?.weeklySchedule || []).map(day => ({
    ...day,
    exercises: day.exercises.map(ex => {
      const rec    = selectModel(ex)
      const update = {}

      if (rec.action === 'increase_weight') {
        // Append progression note to the coaching note field
        update.coachingNote = `📈 Next week: ${rec.weightDelta} | ${rec.note}${ex.coachingNote ? `  •  ${ex.coachingNote}` : ''}`
      } else if (rec.action === 'add_set') {
        update.sets       = rec.newSets
        update.coachingNote = `📈 Next week: +1 set (now ${rec.newSets}) | ${rec.note}${ex.coachingNote ? `  •  ${ex.coachingNote}` : ''}`
      }

      log.push({
        exercise:   ex.name,
        day:        day.label,
        model:      rec.model,
        action:     rec.action,
        detail:     rec.weightDelta || `+1 set`,
        note:       rec.note,
      })

      return { ...ex, ...update }
    }),
  }))

  const updatedWorkout = workout ? { ...workout, weeklySchedule: updatedSchedule } : null
  return { updatedWorkout, log }
}

// ─── Gemini prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are IronSync's Progression Agent — a strength coach who communicates with precision and enthusiasm.

You will receive mathematically pre-calculated progressions for each exercise. Your job is to explain these numbers in a motivating, specific way — you are the voice, not the calculator.

Your tasks:
1. Celebrate the completion genuinely (this is a real milestone)
2. Focus your explanation on the 2-3 main compound lifts — those matter most
3. Quote exact numbers: "Bench Press: target 140 lbs for 3×8-12 next week"
4. Name the progression model being used ("We're running double progression here…")
5. Give one recovery or nutrition note to support the adaptation

Do NOT invent new numbers. The progressions are pre-calculated and provided to you.

REQUIRED OUTPUT FORMAT (valid JSON only, no markdown fences):
{
  "response": "motivating, specific explanation of next week's targets with exact numbers",
  "updatedWorkout": { /* MUST be the updated workout provided to you — do not alter it */ },
  "reasoning": "progression model applied and why it suits their level and goal",
  "recommendations": ["exact target for primary compound lift", "recovery or nutrition priority"]
}`

const ProgressionAgent = {
  async run({ message, context, conversationHistory }) {
    const { workout, goal, experience } = context

    // ── Step 1: Calculate progressions deterministically ─────────────────────
    const { updatedWorkout, log } = calculateProgressions(workout)

    // ── Step 2: Build summary for Gemini to narrate ──────────────────────────
    // Only show compound lifts to keep the prompt focused
    const compoundLog = log.filter(e => /squat|deadlift|bench|press|row|pull/.test(e.exercise.toLowerCase()))
    const progressionSummary = compoundLog.length > 0
      ? compoundLog.map(e => `${e.exercise} (${e.day}): ${e.detail} — ${e.note}`).join('\n')
      : log.slice(0, 5).map(e => `${e.exercise}: ${e.detail} — ${e.note}`).join('\n')

    const contextMessage = [
      `User message: "${message}"`,
      `Athlete goal: ${goal || 'Build muscle'}`,
      `Experience level: ${experience || 'Intermediate'}`,
      '',
      'Pre-calculated progressions for next week:',
      progressionSummary,
      '',
      'Updated workout (use this exactly as updatedWorkout in your response):',
      JSON.stringify(updatedWorkout, null, 2),
    ].join('\n')

    const history = [
      ...(conversationHistory || []),
      { role: 'user', content: contextMessage },
    ]
    while (history.length && history[0].role === 'assistant') history.shift()
    if (!history.length) history.push({ role: 'user', content: contextMessage })

    const geminiResult = await geminiService.chat(SYSTEM_PROMPT, history)

    // Always return the mathematically computed workout — not whatever Gemini produced
    return { ...geminiResult, updatedWorkout }
  },
}

module.exports = ProgressionAgent
