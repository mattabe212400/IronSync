const express = require('express')
const router = express.Router()
const aiProvider = require('../services/aiProvider')
const { validateWorkout }        = require('../utils/validateResponse')
const { validateWorkoutSchedule } = require('../utils/workoutValidator')

// POST /api/ai/generate-workout
// Body: { goal, level, duration, equipment, focus }
// Returns: { success, workout, warning?, validationWarnings? }
router.post('/generate-workout', async (req, res) => {
  try {
    const preferences = req.body

    // 1. Generate from AI or mock
    const raw = await aiProvider.generateWorkout(preferences)
    const { _usedFallback, ...workoutData } = raw

    // 2. Structural validation — fills missing fields with safe defaults
    const workout = validateWorkout(workoutData)

    // 3. Content validation — check balance, duplicates, equipment; auto-repair
    const { repairedSchedule, repairs, warnings } = validateWorkoutSchedule(
      workout.weeklySchedule,
      { equipment: preferences.equipment }
    )
    workout.weeklySchedule = repairedSchedule

    if (repairs.length > 0) {
      console.log('[WorkoutValidator] Auto-repairs applied:', repairs)
    }

    const response = { success: true, workout }

    if (_usedFallback) {
      response.warning = 'AI generation failed — showing a sample plan. Check your API key and try again.'
    }
    if (warnings.length > 0) {
      response.validationWarnings = warnings.map(w => w.message)
    }

    res.json(response)
  } catch (err) {
    if (err.code === 'RATE_LIMITED') {
      return res.status(429).json({ success: false, error: "Gemini's free tier limit has been reached. Please wait a minute and try again." })
    }
    console.error('Workout generation error:', err.message)
    res.status(500).json({ success: false, error: 'Failed to generate workout. Please try again.' })
  }
})

module.exports = router
