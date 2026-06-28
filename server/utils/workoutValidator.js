// workoutValidator.js
// Content-level validation of AI-generated workouts.
// Catches problems the structural validator (validateResponse.js) cannot:
// push/pull balance, duplicate exercises, equipment mismatches, etc.
// Auto-repairs what it can; flags the rest as warnings for the frontend.

const exerciseEngine = require('./exerciseEngine')

// Movement patterns counted as "push" vs "pull" for balance checking
const PUSH_PATTERNS = ['horizontal_push', 'vertical_push', 'isolation_push']
const PULL_PATTERNS = ['horizontal_pull', 'vertical_pull', 'isolation_pull']
const QUAD_PATTERNS = ['squat', 'lunge']
const HINGE_PATTERNS = ['hip_hinge']

// ─── Duration estimate ────────────────────────────────────────────────────────

function parseRepsToMax(reps) {
  if (typeof reps === 'number') return reps
  if (!reps || String(reps).toUpperCase() === 'AMRAP') return 15
  const match = String(reps).match(/(\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!match) return 10
  return match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)
}

function estimateDayDuration(exercises) {
  return exercises.reduce((total, ex) => {
    const sets    = ex.sets || 3
    const repsMax = parseRepsToMax(ex.reps)
    const restSec = parseInt(String(ex.rest).replace(/[^0-9]/g, '')) || 60
    // ~3 seconds per rep + rest between sets; rough but good enough for a UX estimate
    const minutesPerSet = ((repsMax * 3) + restSec) / 60
    return total + sets * minutesPerSet
  }, 0)
}

// ─── Per-day checks ───────────────────────────────────────────────────────────

function validateDay(day) {
  const issues = []
  const exs    = day.exercises || []

  if (exs.length === 0) {
    issues.push({ type: 'empty', severity: 'error', day: day.label, message: `${day.label} has no exercises.` })
  }

  if (exs.length > 10) {
    issues.push({ type: 'high_volume', severity: 'warning', day: day.label,
      message: `${day.label} has ${exs.length} exercises — optimal is 5-8 per session.` })
  }

  // Duplicates within a day
  const seen = new Set()
  const dupes = []
  for (const ex of exs) {
    const key = ex.name.toLowerCase()
    if (seen.has(key)) dupes.push(ex.name)
    seen.add(key)
  }
  if (dupes.length > 0) {
    issues.push({ type: 'duplicate', severity: 'error', day: day.label, exercises: dupes,
      message: `Duplicate exercises in ${day.label}: ${[...new Set(dupes)].join(', ')}` })
  }

  return issues
}

// ─── Push / pull balance ──────────────────────────────────────────────────────

function checkPushPullBalance(weeklySchedule) {
  let push = 0, pull = 0, quad = 0, hinge = 0

  for (const day of weeklySchedule) {
    for (const ex of (day.exercises || [])) {
      const info = exerciseEngine.getExercise(ex.name)
      if (!info) continue
      const sets = ex.sets || 3
      if (PUSH_PATTERNS.includes(info.movementPattern))  push  += sets
      if (PULL_PATTERNS.includes(info.movementPattern))  pull  += sets
      if (QUAD_PATTERNS.includes(info.movementPattern))  quad  += sets
      if (HINGE_PATTERNS.includes(info.movementPattern)) hinge += sets
    }
  }

  const issues = []
  const uppTotal = push + pull

  if (uppTotal > 0) {
    const ratio = push / uppTotal
    if (ratio > 0.65) {
      issues.push({ type: 'push_dominant', severity: 'warning', pushSets: push, pullSets: pull,
        message: `Upper body is push-dominant (${push} push vs ${pull} pull sets). Adding more pulling work reduces injury risk.` })
    } else if (ratio < 0.35) {
      issues.push({ type: 'pull_dominant', severity: 'warning', pushSets: push, pullSets: pull,
        message: `Upper body is pull-dominant (${pull} pull vs ${push} push sets).` })
    }
  }

  const legTotal = quad + hinge
  if (legTotal > 0) {
    const quadRatio = quad / legTotal
    if (quadRatio > 0.72) {
      issues.push({ type: 'quad_dominant', severity: 'warning', quadSets: quad, hingeSets: hinge,
        message: `Leg work is quad-dominant (${quad} quad vs ${hinge} hinge sets). Add Romanian Deadlifts or Hip Thrusts.` })
    } else if (quadRatio < 0.28) {
      issues.push({ type: 'hinge_dominant', severity: 'warning', quadSets: quad, hingeSets: hinge,
        message: `Leg work is hinge-dominant (${hinge} hinge vs ${quad} quad sets). Add squat or lunge patterns.` })
    }
  }

  return issues
}

// ─── Equipment compatibility ──────────────────────────────────────────────────

function checkEquipment(weeklySchedule, equipmentString) {
  if (!equipmentString) return []
  const resolved = exerciseEngine.resolveEquipment(equipmentString)
  const issues   = []

  for (const day of weeklySchedule) {
    for (const ex of (day.exercises || [])) {
      const info = exerciseEngine.getExercise(ex.name)
      if (!info) continue
      const ok = info.equipment.some(eq => resolved.includes(eq.toLowerCase()))
      if (!ok) {
        issues.push({ type: 'equipment_mismatch', severity: 'error', day: day.label,
          exerciseName: ex.name, required: info.equipment,
          message: `"${ex.name}" requires ${info.equipment.join(' or ')} — not in "${equipmentString}"` })
      }
    }
  }

  return issues
}

// ─── Auto-repair ──────────────────────────────────────────────────────────────

// Remove duplicate exercises within each day; keep first occurrence
function repairDuplicates(schedule) {
  return schedule.map(day => ({
    ...day,
    exercises: day.exercises.filter((ex, i, arr) =>
      arr.findIndex(e => e.name.toLowerCase() === ex.name.toLowerCase()) === i
    ),
  }))
}

// Swap equipment-incompatible exercises for the best available alternative
function repairEquipment(schedule, equipmentString) {
  const resolved = exerciseEngine.resolveEquipment(equipmentString)
  const repairs  = []

  const repairedSchedule = schedule.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => {
      const info = exerciseEngine.getExercise(ex.name)
      if (!info) return ex
      const ok = info.equipment.some(eq => resolved.includes(eq.toLowerCase()))
      if (ok) return ex

      const alternatives = exerciseEngine.findEquivalents(ex.name, { equipment: resolved })
      if (alternatives.length > 0) {
        const sub = alternatives[0]
        repairs.push(`"${ex.name}" → "${sub.name}" (equipment)`)
        return { ...ex, name: sub.name,
          coachingNote: `Substituted for ${ex.name} — not compatible with your equipment.` }
      }
      return ex
    }),
  }))

  return { repairedSchedule, repairs }
}

// ─── Main validator ───────────────────────────────────────────────────────────

// Returns:
// {
//   valid              – true if no errors (warnings are ok)
//   errors             – critical issues (duplicates, equipment, empty days)
//   warnings           – advisory issues (balance, high volume)
//   repairs            – list of auto-fix descriptions applied
//   durationByDay      – [{ label, minutes }]
//   repairedSchedule   – weeklySchedule after all auto-fixes applied
// }
function validateWorkoutSchedule(weeklySchedule, options = {}) {
  const errors   = []
  const warnings = []

  // Per-day checks
  for (const day of weeklySchedule) {
    const dayIssues = validateDay(day)
    errors.push(...dayIssues.filter(i => i.severity === 'error'))
    warnings.push(...dayIssues.filter(i => i.severity === 'warning'))
  }

  // Global checks
  const balanceIssues = checkPushPullBalance(weeklySchedule)
  warnings.push(...balanceIssues)

  if (options.equipment) {
    const equipIssues = checkEquipment(weeklySchedule, options.equipment)
    errors.push(...equipIssues)
  }

  // Duration estimate (runs on original schedule)
  const durationByDay = weeklySchedule.map(day => ({
    label:   day.label,
    minutes: Math.round(estimateDayDuration(day.exercises || [])),
  }))

  // ── Auto-repair ──────────────────────────────────────────────────────────────
  let repairedSchedule = [...weeklySchedule]
  const repairs = []

  const hasDuplicates = errors.some(i => i.type === 'duplicate')
  if (hasDuplicates) {
    repairedSchedule = repairDuplicates(repairedSchedule)
    repairs.push('Removed duplicate exercises')
  }

  const hasEquipmentErrors = errors.some(i => i.type === 'equipment_mismatch')
  if (hasEquipmentErrors && options.equipment) {
    const { repairedSchedule: fixed, repairs: equip } = repairEquipment(repairedSchedule, options.equipment)
    repairedSchedule = fixed
    repairs.push(...equip.map(r => `Substituted ${r}`))
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    repairs,
    durationByDay,
    repairedSchedule,
  }
}

module.exports = { validateWorkoutSchedule, estimateDayDuration }
