import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MetricCard from '../components/MetricCard'
import {
  getWorkoutPlans,
  getCompletedWorkouts,
  markWorkoutComplete,
  DEMO_USER_ID,
} from '../services/workoutService'

// ─── Saved plan card ──────────────────────────────────────────────────────────

function PlanCard({ plan, onSessionLogged }) {
  const navigate = useNavigate()
  const [loggingDay, setLoggingDay] = useState(null)   // label of day being logged
  const [loggedDays, setLoggedDays] = useState({})     // { dayLabel: true }
  const [logError,   setLogError]   = useState(null)

  const days = plan.workout?.weeklySchedule || []

  async function handleLogDay(day) {
    if (loggingDay || loggedDays[day.label]) return
    setLoggingDay(day.label)
    setLogError(null)
    try {
      await markWorkoutComplete(plan.id, day.label, day.focus)
      setLoggedDays(prev => ({ ...prev, [day.label]: true }))
      onSessionLogged?.()
    } catch (err) {
      setLogError('Failed to log session. Please try again.')
    } finally {
      setLoggingDay(null)
    }
  }

  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px solid #22242e',
      borderRadius: '16px',
      padding: '20px 22px',
    }}>
      {/* Plan header */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
              {plan.planName}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {[plan.goal, `${plan.daysPerWeek}d/wk`, plan.split, plan.duration].filter(Boolean).map(tag => (
                <span key={tag} style={{
                  fontSize: '10px', padding: '2px 8px',
                  backgroundColor: 'rgba(0,212,255,0.07)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '100px', color: '#00d4ff',
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/workout-result', { state: { workout: plan.workout } })}
            style={{
              flexShrink: 0, padding: '6px 14px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px', color: '#9ca3af',
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            View Plan
          </button>
        </div>
      </div>

      {/* Training days — each has a Log button */}
      {days.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: logError ? '10px' : '0' }}>
          {days.map(day => (
            <div
              key={day.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', backgroundColor: '#0d0e11',
                borderRadius: '9px', gap: '8px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: '#00d4ff', fontWeight: 700, marginRight: '6px' }}>
                  {day.label}
                </span>
                <span style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {day.focus}
                </span>
              </div>
              <button
                onClick={() => handleLogDay(day)}
                disabled={loggingDay === day.label || !!loggedDays[day.label]}
                style={{
                  flexShrink: 0, padding: '3px 11px',
                  borderRadius: '7px', fontSize: '11px', fontWeight: 700,
                  cursor: (loggingDay === day.label || loggedDays[day.label]) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  border: loggedDays[day.label]
                    ? '1px solid rgba(0,255,136,0.25)'
                    : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: loggedDays[day.label]
                    ? 'rgba(0,255,136,0.08)'
                    : 'rgba(255,255,255,0.04)',
                  color: loggedDays[day.label] ? '#00ff88'
                    : loggingDay === day.label ? '#4b5563' : '#9ca3af',
                }}
              >
                {loggedDays[day.label] ? '✓ Done'
                  : loggingDay === day.label ? '…' : 'Log'}
              </button>
            </div>
          ))}
        </div>
      )}

      {logError && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#f87171' }}>{logError}</p>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyPlans() {
  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px dashed #2a2d3a',
      borderRadius: '16px',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '14px' }}>🏋️</div>
      <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#6b7280' }}>
        No saved plans yet
      </p>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
        Generate a workout and hit "Save Plan" to see it here.
      </p>
      <Link to="/generate" style={{
        display: 'inline-block', padding: '10px 22px',
        backgroundColor: 'rgba(0,212,255,0.1)',
        border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: '12px', color: '#00d4ff',
        fontWeight: 700, fontSize: '14px', textDecoration: 'none',
      }}>
        Generate Your First Plan →
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [plans,     setPlans]     = useState([])
  const [completed, setCompleted] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  async function loadData() {
    try {
      const [p, c] = await Promise.all([
        getWorkoutPlans(DEMO_USER_ID),
        getCompletedWorkouts(DEMO_USER_ID),
      ])
      setPlans(p)
      setCompleted(c)
    } catch (err) {
      setError('Failed to load data. Check your Firebase configuration.')
      console.error('[Dashboard]', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Refresh completed count after a session is logged
  async function handleSessionLogged() {
    const c = await getCompletedWorkouts(DEMO_USER_ID).catch(() => completed)
    setCompleted(c)
  }

  // Sessions logged this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekCount = completed.filter(c => {
    const ts = c.completedAt?.toDate?.() || (c.completedAt ? new Date(c.completedAt) : null)
    return ts && ts > weekAgo
  }).length

  const metrics = [
    { icon: '📋', label: 'Saved Plans',       value: loading ? '—' : String(plans.length),     sub: 'Generated & saved' },
    { icon: '✅', label: 'Sessions Logged',    value: loading ? '—' : String(completed.length), sub: 'Total completions' },
    { icon: '🔥', label: 'This Week',          value: loading ? '—' : String(thisWeekCount),     sub: 'Sessions logged' },
    { icon: '📈', label: 'Keep Going',         value: '—',                                       sub: 'Streak coming soon' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#ffffff' }}>Your Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '15px' }}>Track your fitness journey</p>
        </div>
        <Link to="/generate" style={{
          padding: '10px 20px',
          backgroundColor: '#00d4ff', color: '#000000',
          fontWeight: 700, fontSize: '14px',
          borderRadius: '12px', textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          + New Workout
        </Link>
      </div>

      {/* Firebase error */}
      {error && (
        <div style={{
          marginBottom: '24px', padding: '14px 18px',
          backgroundColor: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '12px', color: '#f87171', fontSize: '13px',
          lineHeight: 1.6,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '40px',
      }}>
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Saved plans */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
          Saved Plans
        </h2>
        {plans.length > 0 && (
          <span style={{ fontSize: '13px', color: '#4b5563' }}>
            {plans.length} plan{plans.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#4b5563', fontSize: '14px' }}>
          Loading your plans…
        </div>
      ) : plans.length === 0 ? (
        <EmptyPlans />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: '14px',
        }}>
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} onSessionLogged={handleSessionLogged} />
          ))}
        </div>
      )}

    </div>
  )
}
