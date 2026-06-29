// coachRoutes.js
// POST /api/coach/message — receives a chat message and routes it to the right agent

const express = require('express')
const router  = express.Router()

const WorkoutAgent    = require('../agents/WorkoutAgent')
const ExerciseSwapAgent = require('../agents/ExerciseSwapAgent')
const RecoveryAgent   = require('../agents/RecoveryAgent')
const ProgressionAgent = require('../agents/ProgressionAgent')
const { validateCoachResponse } = require('../utils/validateResponse')

// Keyword-based intent detection — determines which agent handles the message
function detectAgent(message) {
  const m = message.toLowerCase()
  if (/replac|swap|substit|instead of|alternative|don.?t have|no.*machine|no.*barbell|no.*dumbbell|only.*dumbbell|only.*bodyweight/.test(m))
    return 'swap'
  if (/\bsore\b|hurt|pain|injur|ache|recover|can.?t do|avoid|protect|flare/.test(m))
    return 'recovery'
  if (/complet|finished|all.*done|next week|progress|increase|heavier|harder|level up|\bpr\b|personal record/.test(m))
    return 'progression'
  return 'workout'
}

// Mock response when AI_PROVIDER=mock (no API key required)
function mockCoachResponse(message, agentType) {
  const responses = {
    swap:        { response: "I'd be happy to swap that exercise for you! Since we're in mock mode, connect your Gemini API key to get real AI-powered substitutions.", updatedWorkout: null, reasoning: 'Mock mode active.', recommendations: ['Set AI_PROVIDER=gemini in server/.env', 'Add your GEMINI_API_KEY'] },
    recovery:    { response: "I hear you — rest and recovery matter. Connect Gemini to get personalized modification advice based on your specific situation.", updatedWorkout: null, reasoning: 'Mock mode active.', recommendations: ['Set AI_PROVIDER=gemini in server/.env', 'Ice the area and prioritize sleep tonight'] },
    progression: { response: "Great work completing your training! Connect Gemini to get specific, numbered progression targets for next week.", updatedWorkout: null, reasoning: 'Mock mode active.', recommendations: ['Set AI_PROVIDER=gemini in server/.env', 'Eat 0.8-1g protein per lb of bodyweight to support recovery'] },
    workout:     { response: "I'm your IronSync Coach! Connect the Gemini API to unlock real AI coaching conversations. In the meantime, use the Generate page to build your first plan.", updatedWorkout: null, reasoning: 'Mock mode active.', recommendations: ['Set AI_PROVIDER=gemini in server/.env', 'Add your GEMINI_API_KEY to get started'] },
  }
  return { ...responses[agentType] || responses.workout, agentUsed: agentType }
}

// POST /api/coach/message
router.post('/message', async (req, res) => {
  const { message, context = {}, conversationHistory = [] } = req.body

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const agentType = detectAgent(message)
  console.log(`[Coach] "${message.slice(0, 70)}..." → ${agentType}`)

  // Fall back to mock responses when no Gemini key is configured
  if ((process.env.AI_PROVIDER || 'mock') === 'mock') {
    return res.json(mockCoachResponse(message, agentType))
  }

  try {
    const payload = { message, context, conversationHistory }
    let result

    if      (agentType === 'swap')        result = await ExerciseSwapAgent.run(payload)
    else if (agentType === 'recovery')    result = await RecoveryAgent.run(payload)
    else if (agentType === 'progression') result = await ProgressionAgent.run(payload)
    else                                  result = await WorkoutAgent.run(payload)

    res.json({ ...validateCoachResponse(result), agentUsed: agentType })
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({
        response: "Gemini's free tier limit has been reached. Please wait a minute and try again.",
        updatedWorkout: null,
        reasoning: '',
        recommendations: [],
        agentUsed: agentType,
      })
    }
    console.error('[Coach] Agent error:', err.message)
    res.status(500).json({
      response: "I ran into an issue processing that. Please try again in a moment.",
      updatedWorkout: null,
      reasoning: '',
      recommendations: [],
      agentUsed: agentType,
    })
  }
})

module.exports = router
