const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load .env variables (PORT, AI_PROVIDER, API keys)
dotenv.config()

const aiRoutes     = require('./routes/aiRoutes')
const workoutRoutes = require('./routes/workoutRoutes')
const coachRoutes  = require('./routes/coachRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// --- Middleware ---
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://iron-sync.vercel.app',
]
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, health checks)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
}))
app.use(express.json())   // Parse JSON request bodies

// --- Routes ---
app.use('/api/ai', aiRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/coach', coachRoutes)

// Health check — confirm the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IronSync API is running', provider: process.env.AI_PROVIDER || 'mock' })
})

// --- Start ---
app.listen(PORT, () => {
  console.log(`\n🚀 IronSync server running at http://localhost:${PORT}`)
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'mock (no API key needed)'}`)
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`)
})
