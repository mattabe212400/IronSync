const express = require('express')
const router = express.Router()

// In-memory workout store (swap for a database later)
let savedWorkouts = []

// GET /api/workouts — return all saved workouts
router.get('/', (req, res) => {
  res.json({ success: true, workouts: savedWorkouts })
})

// POST /api/workouts — save a workout
router.post('/', (req, res) => {
  const workout = {
    id: Date.now(),
    ...req.body,
    savedAt: new Date().toISOString(),
  }
  savedWorkouts.push(workout)
  res.status(201).json({ success: true, workout })
})

// DELETE /api/workouts/:id — remove a workout by id
router.delete('/:id', (req, res) => {
  savedWorkouts = savedWorkouts.filter(w => w.id !== Number(req.params.id))
  res.json({ success: true })
})

module.exports = router
