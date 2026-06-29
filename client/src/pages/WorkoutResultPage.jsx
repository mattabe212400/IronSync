import { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { saveWorkoutPlan } from '../services/workoutService'

// ─── Small display components ────────────────────────────────────────────────

function StatChip({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '2px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '10px 18px',
    }}>
      <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#e5e7eb', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#ffffff' }}>{title}</h2>
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px solid #22242e',
      borderRadius: '16px',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function DayCard({ dayData }) {
  return (
    <Card>
      {/* Day header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color: '#00d4ff',
            backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '6px', padding: '3px 8px',
          }}>
            {dayData.label}
          </span>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{dayData.day}</span>
        </div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#e5e7eb' }}>
          {dayData.focus}
        </p>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {dayData.exercises?.map((ex, i) => (
          <div key={i} style={{
            backgroundColor: '#0d0e11',
            borderRadius: '10px',
            padding: '12px 14px',
          }}>
            {/* Exercise name + stats row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', flex: 1 }}>
                {ex.name}
              </span>
              {ex.sets > 0 && (
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#6b7280', flexShrink: 0, paddingTop: '1px' }}>
                  <span style={{ color: '#9ca3af' }}>{ex.sets} × {ex.reps}</span>
                  <span style={{ color: '#374151' }}>·</span>
                  <span>{ex.rest}</span>
                </div>
              )}
            </div>
            {/* Coaching note */}
            {ex.coachingNote && (
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                💡 {ex.coachingNote}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Ghost button helper ─────────────────────────────────────────────────────

function GhostButton({ children, disabled, onClick, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '11px 22px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: disabled ? '#374151' : '#9ca3af',
        fontWeight: 600, fontSize: '14px',
        borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorkoutResultPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [planId,    setPlanId]    = useState(null)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    if (saving || saved) return
    setSaving(true)
    setSaveError(null)
    try {
      const id = await saveWorkoutPlan(workout, state?.form)
      setPlanId(id)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!state?.workout) {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '16px' }}>No workout data found.</p>
        <Link to="/generate" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: '15px' }}>
          Generate a workout →
        </Link>
      </div>
    )
  }

  const { workout } = state

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <Link to="/generate" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#6b7280', textDecoration: 'none', fontSize: '14px', marginBottom: '20px',
        }}>
          ← Back to Generator
        </Link>

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            backgroundColor: 'rgba(0,212,255,0.08)',
            color: '#00d4ff',
            border: '1px solid rgba(0,212,255,0.22)',
            borderRadius: '100px', padding: '4px 12px',
          }}>
            AI Generated
          </span>
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Mock data · Gemini integration coming soon</span>
        </div>

        {/* Plan name */}
        <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
          {workout.name}
        </h1>
        <p style={{ margin: '0 0 20px', color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, maxWidth: '680px' }}>
          {workout.description}
        </p>

        {/* Quick stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <StatChip label="Days / Week"  value={`${workout.daysPerWeek} days`} />
          <StatChip label="Per Session"  value={workout.duration} />
          <StatChip label="Split"        value={workout.split} />
          <StatChip label="Style"        value={workout.trainingStyle} />
          <StatChip label="Level"        value={workout.level} />
        </div>
      </div>

      {/* ── Training Philosophy ──────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon="🧠" title="Training Philosophy" />
        <Card>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px', lineHeight: 1.8 }}>
            {workout.philosophy}
          </p>
        </Card>
      </div>

      {/* ── Weekly Split ─────────────────────────────────────── */}
      <div style={{ marginBottom: '36px' }}>
        <SectionHeader icon="📅" title="Your Weekly Split" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
          gap: '14px',
        }}>
          {workout.weeklySchedule?.map((d, i) => <DayCard key={i} dayData={d} />)}
        </div>
      </div>

      {/* ── Recovery + Progression (side by side on wide screens) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        marginBottom: '36px',
      }}>
        {/* Recovery */}
        <div>
          <SectionHeader icon="😴" title="Recovery Tips" />
          <Card>
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workout.recoveryTips?.map((tip, i) => (
                <li key={i} style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.7 }}>{tip}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Progression */}
        <div>
          <SectionHeader icon="📈" title="Progression Plan" />
          <Card style={{ height: 'calc(100% - 44px)' }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: 1.8 }}>
              {workout.progressionPlan}
            </p>
          </Card>
        </div>
      </div>

      {/* ── Nutrition Reminder ───────────────────────────────── */}
      <div style={{ marginBottom: '40px' }}>
        <SectionHeader icon="🥗" title="Nutrition Reminder" />
        <div style={{
          backgroundColor: 'rgba(0, 255, 136, 0.04)',
          border: '1px solid rgba(0, 255, 136, 0.15)',
          borderRadius: '16px', padding: '20px 24px',
        }}>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px', lineHeight: 1.8 }}>
            {workout.nutritionReminder}
          </p>
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        paddingTop: '24px', borderTop: '1px solid #1e2028',
      }}>
        {/* Chat with Coach — passes workout + form + planId (if saved) as context */}
        <button
          onClick={() => navigate('/coach', { state: { workout, form: state?.form, planId } })}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,255,136,0.1))',
            border: '1px solid rgba(0,212,255,0.3)',
            color: '#00d4ff', fontWeight: 700, fontSize: '14px',
            borderRadius: '12px', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0,212,255,0.1)',
          }}
        >
          💬 Chat with Coach
        </button>

        <Link to="/generate" style={{
          padding: '12px 24px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e5e7eb', fontWeight: 600, fontSize: '14px',
          borderRadius: '12px', textDecoration: 'none',
        }}>
          ⚡ Generate New Plan
        </Link>

        {/* Save Plan */}
        {saved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              padding: '11px 22px', borderRadius: '12px',
              backgroundColor: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.2)',
              color: '#00ff88', fontWeight: 700, fontSize: '14px',
            }}>
              ✓ Plan Saved
            </div>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '11px 22px', borderRadius: '12px',
              backgroundColor: saving ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: saving ? '#4b5563' : '#d1d5db',
              fontWeight: 600, fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {saving ? 'Saving…' : '🔖 Save Plan'}
          </button>
        )}

        {/* Save error */}
        {saveError && (
          <div style={{
            width: '100%', marginTop: '8px',
            padding: '10px 16px', borderRadius: '10px',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '13px',
          }}>
            {saveError}
          </div>
        )}

        <GhostButton disabled title="Coming soon — PDF export planned">
          📄 Export PDF
        </GhostButton>
      </div>

    </div>
  )
}
