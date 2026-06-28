// RecoveryAgent.js
// Applies rule-based injury/soreness modifications, then asks Gemini to explain.
//
// Architecture:
//   1. Rule engine maps injury keywords → contraindication tags → exercises to remove.
//   2. exerciseEngine finds safe replacements from the database.
//   3. Gemini receives the pre-modified workout and explains the changes warmly.
//
// Gemini never decides WHICH exercises to remove — that is deterministic.

const geminiService  = require('../services/geminiService')
const exerciseEngine = require('../utils/exerciseEngine')

// ─── Injury rule table ────────────────────────────────────────────────────────
// Each rule maps a regex to contraindication tags and which movement patterns to avoid.

const INJURY_RULES = [
  {
    id:               'shoulder',
    pattern:          /shoulder|rotator|cuff|impingement/i,
    contraindications: ['shoulder_pain', 'shoulder_impingement', 'rotator_cuff'],
    avoidPatterns:    ['vertical_push'],
    label:            'shoulder pain',
    recoveryNotes:    ['Avoid overhead pressing until pain-free for 2 weeks', 'Face pulls and band pull-aparts are safe and help shoulder health'],
  },
  {
    id:               'knee',
    pattern:          /knee|patellar|meniscus/i,
    contraindications: ['knee_pain'],
    avoidPatterns:    ['squat', 'lunge'],
    label:            'knee pain',
    recoveryNotes:    ['Ice 15-20 min post-session', 'Hip hinge work (deadlifts, hip thrusts) is generally safe and maintains leg strength'],
  },
  {
    id:               'lower_back',
    pattern:          /\bback\b|lumbar|spine|disc|herniat/i,
    contraindications: ['lower_back_pain'],
    avoidPatterns:    ['hip_hinge'],
    label:            'lower back pain',
    recoveryNotes:    ['Dead bugs and bird-dogs strengthen the deep core safely', 'Avoid any movement that causes radiating pain down the leg — see a professional'],
  },
  {
    id:               'wrist',
    pattern:          /wrist/i,
    contraindications: ['wrist_pain'],
    avoidPatterns:    [],
    label:            'wrist pain',
    recoveryNotes:    ['Neutral grip (dumbbells, hammer curl) is typically more comfortable', 'Avoid wrist extension under load'],
  },
  {
    id:               'elbow',
    pattern:          /elbow|tennis.*elbow|golfer|epicondyl/i,
    contraindications: ['elbow_pain'],
    avoidPatterns:    [],
    label:            'elbow pain',
    recoveryNotes:    ['Avoid maximum elbow flexion or extension under heavy load', 'Cable movements with neutral grip are gentler than barbell alternatives'],
  },
]

// ─── DOMS classifier (non-injury soreness) ────────────────────────────────────
const DOMS_PATTERN = /\bdoms\b|sore\b|sore |ache|tight|stiff|fatigued|run down|beat up/i

// ─── Rule-based modification engine ──────────────────────────────────────────

function applyInjuryRules(workout, message, limitations) {
  const combined = `${message} ${limitations || ''}`.toLowerCase()

  const triggered = INJURY_RULES.filter(r => r.pattern.test(combined))
  if (triggered.length === 0) return { modifiedWorkout: workout, modifications: [], triggeredRules: [] }

  const allContraindications = [...new Set(triggered.flatMap(r => r.contraindications))]
  const avoidPatterns        = [...new Set(triggered.flatMap(r => r.avoidPatterns))]
  const modifications        = []

  const weeklySchedule = (workout?.weeklySchedule || []).map(day => {
    const updatedExercises = day.exercises.map(ex => {
      const info = exerciseEngine.getExercise(ex.name)
      if (!info) return ex

      const isContraindicated =
        info.contraindications.some(c => allContraindications.includes(c)) ||
        avoidPatterns.includes(info.movementPattern)

      if (!isContraindicated) return ex

      // Find the safest replacement — must not be contraindicated or in an avoided pattern
      const candidates = exerciseEngine.findEquivalents(ex.name, {
        contraindications: allContraindications,
      }).filter(alt => !avoidPatterns.includes(alt.movementPattern))

      if (candidates.length > 0) {
        const sub = candidates[0]
        modifications.push({ action: 'replaced', from: ex.name, to: sub.name,
          reason: triggered.map(r => r.label).join(', ') })
        return {
          ...ex,
          name: sub.name,
          coachingNote: `Substituted for ${ex.name} due to ${triggered.map(r => r.label).join(', ')}.`,
        }
      }

      // No safe replacement — remove the exercise entirely
      modifications.push({ action: 'removed', from: ex.name, to: null,
        reason: `no safe alternative for ${triggered.map(r => r.label).join(', ')}` })
      return null
    }).filter(Boolean)

    return { ...day, exercises: updatedExercises }
  })

  const modifiedWorkout = workout ? { ...workout, weeklySchedule } : null
  return { modifiedWorkout, modifications, triggeredRules: triggered }
}

// ─── Gemini prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are IronSync's Recovery Agent — a warm, supportive coach with expertise in rehabilitation science.

You will receive a workout that has ALREADY been automatically modified by a rule-based system. The dangerous exercises have been removed or swapped. Your job is to explain what happened and why, and give the user actionable recovery advice.

Your tasks:
1. Acknowledge the user's situation with genuine empathy (do not be dismissive or generic)
2. Explain which exercises were modified and why they were problematic for the user's condition
3. Describe the safe alternatives and what training stimulus they preserve
4. Give specific recovery tips for their situation
5. Tell them when they should consider seeing a medical professional (joint pain, nerve symptoms, no improvement in 2 weeks)

Never tell someone to push through sharp, joint, or nerve pain.

REQUIRED OUTPUT FORMAT (valid JSON only, no markdown fences):
{
  "response": "warm, empathetic explanation of the modifications and next steps",
  "updatedWorkout": { /* MUST be the modified workout provided to you — do not alter it */ },
  "reasoning": "clinical rationale: condition type identified, why these modifications are appropriate",
  "recommendations": ["immediate recovery action", "timeline to return to full training", "when to see a professional"]
}`

const RecoveryAgent = {
  async run({ message, context, conversationHistory }) {
    const { workout, limitations } = context

    // ── Step 1: Apply rule-based modifications ───────────────────────────────
    const { modifiedWorkout, modifications, triggeredRules } = applyInjuryRules(workout, message, limitations)

    const isOnlyDoms = triggeredRules.length === 0 && DOMS_PATTERN.test(message)

    // ── Step 2: Build explanation for Gemini ─────────────────────────────────
    const modSummary = modifications.length > 0
      ? modifications.map(m =>
          m.action === 'replaced'
            ? `- Replaced "${m.from}" with "${m.to}" (${m.reason})`
            : `- Removed "${m.from}" — no safe alternative found (${m.reason})`
        ).join('\n')
      : isOnlyDoms
        ? '- No exercises removed (DOMS/soreness detected — volume may be reduced in your response)'
        : '- No exercises removed (could not identify a specific injury pattern)'

    const recoveryNotes = triggeredRules.flatMap(r => r.recoveryNotes).join('\n')

    const contextMessage = [
      `User complaint: "${message}"`,
      `Conditions detected: ${triggeredRules.map(r => r.label).join(', ') || 'General soreness / fatigue'}`,
      '',
      'Automatic modifications applied:',
      modSummary,
      '',
      recoveryNotes ? `Relevant recovery notes:\n${recoveryNotes}` : '',
      '',
      'Modified workout (use this exactly as updatedWorkout in your response):',
      JSON.stringify(modifiedWorkout, null, 2),
    ].filter(Boolean).join('\n')

    const history = [
      ...(conversationHistory || []),
      { role: 'user', content: contextMessage },
    ]
    while (history.length && history[0].role === 'assistant') history.shift()
    if (!history.length) history.push({ role: 'user', content: contextMessage })

    const geminiResult = await geminiService.chat(SYSTEM_PROMPT, history)

    // Always use the rule-based workout — Gemini cannot override safety decisions
    return { ...geminiResult, updatedWorkout: modifiedWorkout }
  },
}

module.exports = RecoveryAgent
