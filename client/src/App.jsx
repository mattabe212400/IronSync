import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import GenerateWorkoutPage from './pages/GenerateWorkoutPage'
import WorkoutResultPage from './pages/WorkoutResultPage'
import ProgressPage from './pages/ProgressPage'
import CoachPage from './pages/CoachPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#0a0d14', color: '#d6d3d1' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/generate" element={<GenerateWorkoutPage />} />
          <Route path="/workout-result" element={<WorkoutResultPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/coach" element={<CoachPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
