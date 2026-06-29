import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GenerateWorkoutPage from './pages/GenerateWorkoutPage'
import WorkoutResultPage from './pages/WorkoutResultPage'
import ProgressPage from './pages/ProgressPage'
import CoachPage from './pages/CoachPage'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const SPIN = `@keyframes spin { to { transform: rotate(360deg) } }`

function ServerBanner() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let attempts = 0
    let timer

    async function ping() {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        await fetch(`${API}/api/health`, { signal: controller.signal })
        clearTimeout(timeout)
        setStatus('online')
      } catch {
        attempts++
        if (attempts === 1) setStatus('slow')
        timer = setTimeout(ping, 5000)
      }
    }

    ping()
    return () => clearTimeout(timer)
  }, [])

  if (status === 'checking' || status === 'online') return null

  return (
    <>
      <style>{SPIN}</style>
      <div style={{
        backgroundColor: '#1c1400',
        borderBottom: '1px solid rgba(217,119,6,0.35)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
      }}>
        <div style={{
          width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
          border: '2px solid rgba(217,119,6,0.3)', borderTopColor: '#d97706',
          animation: 'spin 0.8s linear infinite',
        }}/>
        <p style={{ margin: 0, fontSize: '13px', color: '#d97706', fontWeight: 500 }}>
          Backend is waking up on Render's free tier — this takes 30–60 seconds. AI features will work once it's ready.
        </p>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen" style={{ backgroundColor: '#0c0b0b', color: '#d6d3d1' }}>
          <Navbar />
          <ServerBanner />
          <Routes>
            {/* Public */}
            <Route path="/"      element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/generate"      element={<ProtectedRoute><GenerateWorkoutPage /></ProtectedRoute>} />
            <Route path="/workout-result" element={<ProtectedRoute><WorkoutResultPage /></ProtectedRoute>} />
            <Route path="/progress"      element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/coach"         element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
