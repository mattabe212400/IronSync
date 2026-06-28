// workoutService.js
// All Firestore logic lives here — pages stay clean.
// Authentication is not implemented yet; all documents use DEMO_USER_ID.

import {
  collection, addDoc, getDocs, getDoc,
  doc, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export const DEMO_USER_ID = 'demo-user'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Convert a Firestore Timestamp or raw value to a JS Date
function toDate(val) {
  if (!val) return null
  if (typeof val.toDate === 'function') return val.toDate()
  if (val instanceof Date) return val
  return new Date(val)
}

function docToObj(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// ─── workoutPlans collection ──────────────────────────────────────────────────

// Save a new workout plan. Throws a descriptive error if a plan with the same
// name already exists for this user (prevents accidental duplicates).
export async function saveWorkoutPlan(workout, formData, userId = DEMO_USER_ID) {
  // Duplicate check — query is equality-only so no composite index needed
  const existing = await getDocs(
    query(
      collection(db, 'workoutPlans'),
      where('userId',   '==', userId),
      where('planName', '==', workout.name),
    )
  )
  if (!existing.empty) {
    throw new Error(`A plan named "${workout.name}" is already saved.`)
  }

  const ref = await addDoc(collection(db, 'workoutPlans'), {
    userId,
    planName:      workout.name,
    goal:          formData?.goal          || '',
    split:         workout.split           || '',
    daysPerWeek:   workout.daysPerWeek     || 0,
    duration:      workout.duration        || '',
    trainingStyle: workout.trainingStyle   || '',
    workout,
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  })

  return ref.id
}

// Fetch all plans for a user, sorted newest-first (client-side sort avoids
// composite index requirement)
export async function getWorkoutPlans(userId = DEMO_USER_ID) {
  const snap = await getDocs(
    query(collection(db, 'workoutPlans'), where('userId', '==', userId))
  )
  return snap.docs
    .map(docToObj)
    .sort((a, b) => {
      const aT = toDate(a.createdAt)?.getTime() || 0
      const bT = toDate(b.createdAt)?.getTime() || 0
      return bT - aT   // newest first
    })
}

export async function getWorkoutPlanById(planId) {
  const snap = await getDoc(doc(db, 'workoutPlans', planId))
  return snap.exists() ? docToObj(snap) : null
}

// ─── completedWorkouts collection ─────────────────────────────────────────────

export async function markWorkoutComplete(
  planId, day, focus, exercisesCompleted = [], notes = '', userId = DEMO_USER_ID
) {
  const ref = await addDoc(collection(db, 'completedWorkouts'), {
    userId,
    planId,
    day,
    focus,
    completedAt:        serverTimestamp(),
    exercisesCompleted,
    notes,
  })
  return ref.id
}

export async function getCompletedWorkouts(userId = DEMO_USER_ID) {
  const snap = await getDocs(
    query(collection(db, 'completedWorkouts'), where('userId', '==', userId))
  )
  return snap.docs
    .map(docToObj)
    .sort((a, b) => {
      const aT = toDate(a.completedAt)?.getTime() || 0
      const bT = toDate(b.completedAt)?.getTime() || 0
      return bT - aT   // newest first
    })
}

// ─── progressLogs collection ──────────────────────────────────────────────────

export async function addProgressLog(log, userId = DEMO_USER_ID) {
  const ref = await addDoc(collection(db, 'progressLogs'), {
    userId,
    date:           log.date || new Date().toISOString().split('T')[0],
    bodyWeight:     log.bodyWeight     || null,
    energyLevel:    log.energyLevel    || null,
    sorenessLevel:  log.sorenessLevel  || null,
    notes:          log.notes          || '',
    loggedAt:       serverTimestamp(),
  })
  return ref.id
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

// Classify exercise name → primary muscle group.
// Rules run most-specific first to avoid false matches (e.g. "pull-through" ≠ "pull").
function classifyExerciseMuscle(exerciseName) {
  const n = (exerciseName || '').toLowerCase()
  if (/hip thrust|glute bridge|pull.through|kettlebell swing/.test(n))                        return 'Glutes'
  if (/romanian|stiff.leg|good morning|\brdl\b|leg curl|nordic|conventional deadlift/.test(n)) return 'Hamstrings'
  if (/bench press|chest press|incline.*press|decline.*press|chest.*fly|push.up|chest.*dip/.test(n)) return 'Chest'
  if (/overhead press|shoulder press|arnold|pike push|lateral raise|front raise|face pull|rear delt|band pull|handstand push/.test(n)) return 'Shoulders'
  if (/\bsquat\b|leg press|\blunge|step.up|hack squat|split squat/.test(n))                   return 'Quads'
  if (/\brow\b|pull.up|pullup|chin.up|chinup|lat pulldown|pulldown|straight.arm|pullover/.test(n)) return 'Back'
  if (/curl|tricep|skull crusher|pushdown|tricep extension/.test(n))                           return 'Arms'
  if (/plank|crunch|dead bug|ab wheel|rollout|pallof|leg raise|farmers carry|carry/.test(n))  return 'Core'
  return null
}

// Classify a training day's focus label → split category.
function classifyDayFocus(focus) {
  const f = (focus || '').toLowerCase()
  if (/push|chest/.test(f))           return 'Push'
  if (/pull|back/.test(f))            return 'Pull'
  if (/hinge|hip|glut|deadlift/.test(f)) return 'Hinge'
  if (/\bleg|squat|lower/.test(f))    return 'Legs'
  if (/shoulder/.test(f))             return 'Push'
  if (/core|abs/.test(f))             return 'Core'
  return 'Full Body'
}

// Total sets per muscle group across all saved plans — drives "Muscle Group Volume" chart.
function getMuscleGroupVolume(plans) {
  const vol = {}
  for (const plan of plans) {
    for (const day of (plan.workout?.weeklySchedule || [])) {
      for (const ex of (day.exercises || [])) {
        const muscle = classifyExerciseMuscle(ex.name)
        if (!muscle) continue
        vol[muscle] = (vol[muscle] || 0) + (ex.sets || 3)
      }
    }
  }
  return vol
}

// Training days per split category across all saved plans — drives "Split Balance" chart.
function getSplitBalance(plans) {
  const balance = {}
  for (const plan of plans) {
    for (const day of (plan.workout?.weeklySchedule || [])) {
      const cat = classifyDayFocus(day.focus)
      balance[cat] = (balance[cat] || 0) + 1
    }
  }
  return balance
}

// Most-frequently-logged split category from completed workouts.
function getMostTrainedCategory(completed) {
  const counts = {}
  for (const c of completed) {
    if (!c.focus) continue
    const cat = classifyDayFocus(c.focus)
    if (cat === 'Full Body') continue
    counts[cat] = (counts[cat] || 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || null
}

// ─── Progress summary ─────────────────────────────────────────────────────────

// Weekly streak: consecutive days (going back from today) with ≥1 completed workout
function calculateStreak(completedWorkouts) {
  const dates = new Set(
    completedWorkouts
      .map(c => toDate(c.completedAt))
      .filter(Boolean)
      .map(d => d.toISOString().split('T')[0])
  )
  if (!dates.size) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i <= 365; i++) {
    const check = new Date(today)
    check.setDate(today.getDate() - i)
    if (dates.has(check.toISOString().split('T')[0])) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

// Which days of the current Mon-Sun week had at least one completed workout?
function getWeeklyActivity(completedWorkouts) {
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now        = new Date()
  const dayOfWeek  = now.getDay()                          // 0=Sun
  const mondayDelta = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  return DAY_LABELS.map((label, idx) => {
    const day = new Date(now)
    day.setDate(now.getDate() + mondayDelta + idx)
    day.setHours(0, 0, 0, 0)

    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const done = completedWorkouts.some(c => {
      const ts = toDate(c.completedAt)
      return ts && ts >= day && ts < nextDay
    })

    return { day: label, done, isFuture: day > now }
  })
}

export async function getProgressSummary(userId = DEMO_USER_ID) {
  const [plans, completed] = await Promise.all([
    getWorkoutPlans(userId),
    getCompletedWorkouts(userId),
  ])

  const now     = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekCount = completed.filter(c => {
    const ts = toDate(c.completedAt)
    return ts && ts > weekAgo
  }).length

  const weeklyActivity     = getWeeklyActivity(completed)
  const activeDaysThisWeek = weeklyActivity.filter(d => d.done).length
  const weeklyPct          = Math.round((activeDaysThisWeek / 7) * 100)

  return {
    totalPlans:          plans.length,
    totalCompleted:      completed.length,
    thisWeekCount,
    weeklyPct,
    activeDaysThisWeek,
    streak:              calculateStreak(completed),
    weeklyActivity,
    muscleGroupVolume:   getMuscleGroupVolume(plans),
    splitBalance:        getSplitBalance(plans),
    mostTrainedCategory: getMostTrainedCategory(completed),
    plans,
    completed,
    mostRecent:          completed[0] || null,
  }
}
