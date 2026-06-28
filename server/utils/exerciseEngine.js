// exerciseEngine.js
// Deterministic exercise lookup and filtering — no AI involved.
// All coaching decisions about WHICH exercise to use are made here;
// Gemini is only called afterward to explain the choice.

const exercises = require('../data/exercises.json')

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced']

// Build a fast lookup map at startup
const EXERCISE_MAP = new Map(
  exercises.map(e => [e.name.toLowerCase(), e])
)

// ─── Core lookup ─────────────────────────────────────────────────────────────

function getExercise(name) {
  if (!name) return null
  return EXERCISE_MAP.get(name.toLowerCase()) || null
}

function getAllNames() {
  return exercises.map(e => e.name)
}

function findByPattern(pattern) {
  return exercises.filter(e => e.movementPattern === pattern)
}

// ─── Equivalents and progressions ────────────────────────────────────────────

// Find exercises that preserve the same movement pattern.
// options: { equipment?: string[], contraindications?: string[] }
function findEquivalents(exerciseName, options = {}) {
  const base = getExercise(exerciseName)
  if (!base) return []

  let pool = findByPattern(base.movementPattern)
    .filter(e => e.name.toLowerCase() !== exerciseName.toLowerCase())

  if (options.equipment?.length)         pool = filterByEquipment(pool, options.equipment)
  if (options.contraindications?.length) pool = filterByContraindications(pool, options.contraindications)

  // Prefer same difficulty, then fallback to adjacent levels
  const same   = pool.filter(e => e.difficulty === base.difficulty)
  const others = pool.filter(e => e.difficulty !== base.difficulty)
  return [...same, ...others]
}

// Find easier variations of the same movement pattern (lower difficulty only)
function findEasierVariations(exerciseName, options = {}) {
  const base = getExercise(exerciseName)
  if (!base) return []

  const baseIdx = DIFFICULTY_ORDER.indexOf(base.difficulty)

  let pool = findByPattern(base.movementPattern).filter(e => {
    const idx = DIFFICULTY_ORDER.indexOf(e.difficulty)
    return idx < baseIdx && e.name.toLowerCase() !== exerciseName.toLowerCase()
  })

  if (options.equipment?.length)         pool = filterByEquipment(pool, options.equipment)
  if (options.contraindications?.length) pool = filterByContraindications(pool, options.contraindications)
  return pool
}

// Find harder variations of the same movement pattern (higher difficulty only)
function findHarderVariations(exerciseName, options = {}) {
  const base = getExercise(exerciseName)
  if (!base) return []

  const baseIdx = DIFFICULTY_ORDER.indexOf(base.difficulty)

  let pool = findByPattern(base.movementPattern).filter(e => {
    const idx = DIFFICULTY_ORDER.indexOf(e.difficulty)
    return idx > baseIdx && e.name.toLowerCase() !== exerciseName.toLowerCase()
  })

  if (options.equipment?.length)         pool = filterByEquipment(pool, options.equipment)
  if (options.contraindications?.length) pool = filterByContraindications(pool, options.contraindications)
  return pool
}

// ─── Filters ─────────────────────────────────────────────────────────────────

// Keep only exercises that can be done with at least one item of available equipment.
// availableEquipment: string[] e.g. ['barbell', 'dumbbell', 'cable']
function filterByEquipment(exerciseList, availableEquipment) {
  if (!availableEquipment?.length) return exerciseList
  const avail = availableEquipment.map(e => e.toLowerCase())
  return exerciseList.filter(ex =>
    ex.equipment.some(eq => avail.includes(eq.toLowerCase()))
  )
}

// Remove exercises that have any contraindication matching the user's restrictions.
// restrictions: string[] e.g. ['shoulder_pain', 'rotator_cuff']
function filterByContraindications(exerciseList, restrictions) {
  if (!restrictions?.length) return exerciseList
  const lower = restrictions.map(r => r.toLowerCase())
  return exerciseList.filter(ex =>
    !ex.contraindications.some(c => lower.includes(c.toLowerCase()))
  )
}

// Filter by a specific tag (e.g. 'compound', 'isolation', 'bodyweight')
function filterByStyle(exerciseList, style) {
  if (!style) return exerciseList
  const s = style.toLowerCase()
  return exerciseList.filter(ex => ex.tags.some(t => t.toLowerCase() === s))
}

// Remove exercises that require a specific movement pattern (used by RecoveryAgent)
function excludePatterns(exerciseList, patterns) {
  if (!patterns?.length) return exerciseList
  return exerciseList.filter(ex => !patterns.includes(ex.movementPattern))
}

// ─── Equipment string resolver ───────────────────────────────────────────────

// Converts a human-readable equipment description from the form into equipment tag arrays.
// e.g. "Full gym access" → ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', ...]
function resolveEquipment(equipmentString) {
  if (!equipmentString) return ['bodyweight']
  const eq = equipmentString.toLowerCase()

  if (eq.includes('full') || eq.includes('gym')) {
    return ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'band']
  }
  if ((eq.includes('home') && eq.includes('dumbbell')) || eq.includes('limited')) {
    return ['dumbbell', 'bodyweight', 'band', 'kettlebell']
  }
  if (eq.includes('barbell') && eq.includes('dumbbell')) {
    return ['barbell', 'dumbbell', 'bodyweight']
  }
  if (eq.includes('bodyweight') || eq.includes('no equipment') || eq.includes('none')) {
    return ['bodyweight', 'band']
  }
  if (eq.includes('dumbbell')) {
    return ['dumbbell', 'bodyweight']
  }
  if (eq.includes('barbell')) {
    return ['barbell', 'dumbbell', 'bodyweight']
  }
  if (eq.includes('cable') || eq.includes('machine')) {
    return ['cable', 'machine', 'barbell', 'dumbbell', 'bodyweight']
  }
  if (eq.includes('kettlebell')) {
    return ['kettlebell', 'dumbbell', 'bodyweight']
  }
  return ['bodyweight']
}

// ─── Contraindication string resolver ────────────────────────────────────────

// Converts a human-readable injury/limitation string into contraindication tag arrays.
// e.g. "bad shoulder, some knee pain" → ['shoulder_pain', 'shoulder_impingement', 'rotator_cuff', 'knee_pain']
function resolveContraindications(injuryString) {
  if (!injuryString) return []
  const inj = injuryString.toLowerCase()
  const tags = new Set()

  if (/shoulder|rotator|impingement/.test(inj)) {
    tags.add('shoulder_pain')
    tags.add('shoulder_impingement')
    tags.add('rotator_cuff')
  }
  if (/knee|patellar|meniscus/.test(inj)) {
    tags.add('knee_pain')
  }
  if (/\bback\b|lumbar|spine|disc|herniat/.test(inj)) {
    tags.add('lower_back_pain')
  }
  if (/wrist/.test(inj)) {
    tags.add('wrist_pain')
  }
  if (/elbow|tennis|golfer/.test(inj)) {
    tags.add('elbow_pain')
  }
  if (/hip|groin|flexor/.test(inj)) {
    tags.add('hip_pain')
  }
  if (/neck|cervical/.test(inj)) {
    tags.add('neck_pain')
  }
  if (/pec|chest.*tear/.test(inj)) {
    tags.add('acute_pec_injury')
  }

  return [...tags]
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  getExercise,
  getAllNames,
  findByPattern,
  findEquivalents,
  findEasierVariations,
  findHarderVariations,
  filterByEquipment,
  filterByContraindications,
  filterByStyle,
  excludePatterns,
  resolveEquipment,
  resolveContraindications,
}
