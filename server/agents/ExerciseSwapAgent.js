// ExerciseSwapAgent.js
// Replaces exercises while preserving movement patterns.
//
// Architecture:
//   1. exerciseEngine identifies the exercise being swapped and builds a
//      ranked candidate list filtered for the user's equipment and restrictions.
//   2. Gemini receives the candidate list and is asked only to pick the best
//      option, explain the reasoning, and apply the swap to the full workout.
//
// This means Gemini can never suggest an exercise the user can't actually do.

const geminiService  = require('../services/geminiService')
const exerciseEngine = require('../utils/exerciseEngine')

const SYSTEM_PROMPT = `You are IronSync's Exercise Swap Agent — a movement pattern specialist.

You will receive a pre-filtered list of safe candidate exercises, already validated for the user's equipment and injury restrictions. Your job is NOT to invent alternatives — the candidates are provided for you.

Your tasks:
1. Select the BEST candidate from the provided list (do not suggest exercises outside the list)
2. Apply the swap to EVERY occurrence of the target exercise across ALL days in weeklySchedule
3. Explain the substitution: what movement stimulus is preserved and what the user should expect
4. Give 1-2 technique cues for the replacement exercise

If no candidates were found (list is empty), use your knowledge to suggest one appropriate alternative and explain why.

REQUIRED OUTPUT FORMAT (valid JSON only, no markdown fences):
{
  "response": "conversational explanation of what was swapped and why it works",
  "updatedWorkout": { /* full workout with swap applied to all occurrences in weeklySchedule */ },
  "reasoning": "movement pattern analysis — why this substitute preserves the training intent",
  "recommendations": ["form cue for the new exercise", "how to match load from the original"]
}`

const ExerciseSwapAgent = {
  async run({ message, context, conversationHistory }) {
    const { workout, equipment, limitations } = context

    // ── Step 1: Resolve user constraints ────────────────────────────────────
    const resolvedEquipment       = exerciseEngine.resolveEquipment(equipment)
    const resolvedContraindications = exerciseEngine.resolveContraindications(limitations)

    // ── Step 2: Detect which exercise the user wants to replace ──────────────
    // Scan known exercise names against the message (longest match wins)
    const allNames = exerciseEngine.getAllNames()
    const messageLower = message.toLowerCase()
    const mentioned = allNames
      .filter(name => messageLower.includes(name.toLowerCase()))
      .sort((a, b) => b.length - a.length)  // prefer longer / more specific names
    const exerciseName = mentioned[0] || null

    // ── Step 3: Build candidate list ─────────────────────────────────────────
    let candidatesText = 'No candidates pre-computed — use your movement pattern knowledge.'

    if (exerciseName) {
      const candidates = exerciseEngine.findEquivalents(exerciseName, {
        equipment:         resolvedEquipment,
        contraindications: resolvedContraindications,
      })

      if (candidates.length > 0) {
        candidatesText = `Pre-filtered candidates for "${exerciseName}" (safe for this user):\n` +
          candidates.slice(0, 8).map((c, i) =>
            `${i + 1}. ${c.name} — ${c.movementPattern}, ${c.difficulty}, equipment: ${c.equipment.join('/')}`
          ).join('\n')
      } else {
        candidatesText = `No pre-filtered candidates found for "${exerciseName}" with current equipment/restrictions. Use your knowledge.`
      }
    }

    // ── Step 4: Build context message for Gemini ─────────────────────────────
    const contextMessage = [
      `User request: "${message}"`,
      exerciseName ? `Exercise to replace: ${exerciseName}` : 'Exercise to replace: (infer from the user message)',
      '',
      candidatesText,
      '',
      `User equipment: ${equipment || 'Not specified'}`,
      `User restrictions: ${limitations || 'None'}`,
      '',
      'Current workout to update:',
      JSON.stringify(workout, null, 2),
    ].join('\n')

    const history = [
      ...(conversationHistory || []),
      { role: 'user', content: contextMessage },
    ]
    // Gemini requires history to start with a user turn
    while (history.length && history[0].role === 'assistant') history.shift()
    if (!history.length) history.push({ role: 'user', content: contextMessage })

    return await geminiService.chat(SYSTEM_PROMPT, history)
  },
}

module.exports = ExerciseSwapAgent
