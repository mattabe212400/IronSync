import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/MetricCard'
import { getProgressSummary } from '../services/workoutService'
import { useAuth } from '../context/AuthContext'

// ─── Design tokens ────────────────────────────────────────────────────────────

const SPLIT_COLORS = {
  Push:      '#00d4ff',
  Pull:      '#00ff88',
  Legs:      '#a78bfa',
  Hinge:     '#fb923c',
  Core:      '#f59e0b',
  'Full Body': '#6b7280',
}

const MUSCLE_COLORS = {
  Chest:      '#00d4ff',
  Back:       '#00b8d9',
  Shoulders:  '#009db8',
  Quads:      '#00ff88',
  Glutes:     '#00d974',
  Hamstrings: '#00b360',
  Arms:       '#a78bfa',
  Core:       '#f59e0b',
}

// ─── Shared chart components ──────────────────────────────────────────────────

function SectionCard({ title, icon, children, minHeight }) {
  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px solid #22242e',
      borderRadius: '18px',
      padding: '22px 24px',
      minHeight,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <span style={{ fontSize: '17px' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

// Horizontal bar — value is a raw number, max is the reference point for width
function HBar({ label, value, max, color, unit = '' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div style={{ marginBottom: '13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'baseline' }}>
        <span style={{ fontSize: '13px', color: '#d1d5db', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ height: '5px', backgroundColor: '#1a1c24', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          backgroundColor: color || '#00d4ff',
          borderRadius: '3px',
          transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

function ChartEmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{message}</p>
    </div>
  )
}

// ─── Split Balance chart ──────────────────────────────────────────────────────

function SplitBalanceChart({ splitBalance }) {
  const entries = Object.entries(splitBalance).sort((a, b) => b[1] - a[1])
  const total   = entries.reduce((s, [, v]) => s + v, 0)

  if (!entries.length) {
    return <ChartEmptyState message="Save workout plans to see your split balance." />
  }

  return (
    <div>
      {entries.map(([cat, days]) => (
        <HBar
          key={cat}
          label={cat}
          value={Math.round((days / total) * 100)}
          max={100}
          color={SPLIT_COLORS[cat] || '#6b7280'}
          unit="%"
        />
      ))}
      <p style={{ margin: '14px 0 0', fontSize: '11px', color: '#374151', lineHeight: 1.5 }}>
        Based on {total} training day{total !== 1 ? 's' : ''} across {Object.keys(splitBalance).length} split type{Object.keys(splitBalance).length !== 1 ? 's' : ''}.
      </p>
    </div>
  )
}

// ─── Muscle group volume chart ────────────────────────────────────────────────

function MuscleVolumeChart({ muscleGroupVolume }) {
  const entries = Object.entries(muscleGroupVolume).sort((a, b) => b[1] - a[1])
  const max     = entries[0]?.[1] || 1

  if (!entries.length) {
    return <ChartEmptyState message="Save workout plans to see muscle group volume." />
  }

  return (
    <div>
      {entries.map(([muscle, sets]) => (
        <HBar
          key={muscle}
          label={muscle}
          value={sets}
          max={max}
          color={MUSCLE_COLORS[muscle] || '#6b7280'}
          unit=" sets"
        />
      ))}
      <p style={{ margin: '14px 0 0', fontSize: '11px', color: '#374151', lineHeight: 1.5 }}>
        Total volume across all saved plans.
      </p>
    </div>
  )
}

// ─── Weekly activity tracker ──────────────────────────────────────────────────

function WeeklyTracker({ weeklyActivity, activeDays, weeklyPct }) {
  return (
    <SectionCard icon="📅" title="This Week">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {weeklyActivity.map(({ day, done, isFuture }) => (
          <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700,
              opacity: isFuture ? 0.35 : 1,
              backgroundColor: done ? 'rgba(0,212,255,0.14)'
                : isFuture ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
              border: done ? '1px solid rgba(0,212,255,0.38)'
                : isFuture ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.07)',
              color: done ? '#00d4ff' : '#4b5563',
            }}>
              {done ? '✓' : '·'}
            </div>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>{day}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
          {activeDays} of 7 days active ·{' '}
          <Link to="/dashboard" style={{ color: '#00d4ff', textDecoration: 'none' }}>
            log a session
          </Link>
        </p>
        <span style={{
          fontSize: '13px', fontWeight: 800,
          color: weeklyPct >= 70 ? '#00ff88' : weeklyPct >= 40 ? '#00d4ff' : '#6b7280',
        }}>
          {weeklyPct}%
        </span>
      </div>
    </SectionCard>
  )
}

// ─── Recent activity timeline ─────────────────────────────────────────────────

function TimelineItem({ item, isLast }) {
  const ts = item.completedAt?.toDate?.() || (item.completedAt ? new Date(item.completedAt) : null)
  const dateStr = ts
    ? ts.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—'
  const timeStr = ts
    ? ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : ''

  const category = item.focus ? item.focus.split('—')[0].trim() : (item.day || 'Session')
  const dotColor = SPLIT_COLORS[category] || '#00d4ff'

  return (
    <div style={{ display: 'flex', gap: '14px', position: 'relative' }}>
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: '11px', top: '24px',
          width: '2px', bottom: '-8px',
          backgroundColor: '#1e2028',
        }} />
      )}

      {/* Dot */}
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
        backgroundColor: `${dotColor}18`,
        border: `2px solid ${dotColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', zIndex: 1,
      }}>
        ✓
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#e5e7eb' }}>
            {item.focus || item.day || 'Training session'}
          </p>
          <span style={{ fontSize: '11px', color: '#374151', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {dateStr}
          </span>
        </div>
        {timeStr && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#4b5563' }}>
            {item.day ? `${item.day} · ` : ''}{timeStr}
          </p>
        )}
      </div>
    </div>
  )
}

function EmptyTimeline() {
  return (
    <div style={{
      padding: '36px 24px', textAlign: 'center',
      backgroundColor: '#16181e',
      border: '1px dashed #22242e',
      borderRadius: '16px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
        No activity yet
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
        Log sessions from your{' '}
        <Link to="/dashboard" style={{ color: '#00d4ff', textDecoration: 'none' }}>saved plans</Link>
        {' '}to build your history.
      </p>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ height = 120, radius = 16 }) {
  return (
    <div style={{
      height, borderRadius: radius,
      backgroundColor: '#16181e',
      border: '1px solid #22242e',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

const SKELETON_ANIM = `@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getProgressSummary(user.uid)
      .then(setSummary)
      .catch(err => {
        setError('Failed to load progress data. Check your Firebase configuration.')
        console.error('[Progress]', err)
      })
      .finally(() => setLoading(false))
  }, [user.uid])

  const weeklyActivity     = summary?.weeklyActivity     ?? Array(7).fill(0).map((_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], done: false, isFuture: false }))
  const activeDaysThisWeek = summary?.activeDaysThisWeek ?? 0
  const weeklyPct          = summary?.weeklyPct          ?? 0
  const recentActivity     = summary?.completed?.slice(0, 10) || []

  const topMetrics = [
    {
      icon: '🔥', label: 'Current Streak',
      value: loading ? '—' : `${summary?.streak ?? 0}d`,
      sub:   summary?.streak ? 'Keep it going!' : 'Start your streak',
    },
    {
      icon: '✅', label: 'Total Sessions',
      value: loading ? '—' : String(summary?.totalCompleted ?? 0),
      sub:   'All time',
    },
    {
      icon: '📅', label: 'Week Completion',
      value: loading ? '—' : `${weeklyPct}%`,
      sub:   `${activeDaysThisWeek} of 7 days`,
    },
    {
      icon: '🏆', label: 'Top Focus',
      value: loading ? '—' : (summary?.mostTrainedCategory ?? '—'),
      sub:   summary?.mostTrainedCategory ? 'Most logged' : 'Log sessions to track',
    },
  ]

  return (
    <>
      <style>{SKELETON_ANIM}</style>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 900, color: '#ffffff' }}>
            Your Progress
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '15px' }}>
            Stay consistent. Results follow.
          </p>
        </div>

        {/* Firebase error */}
        {error && (
          <div style={{
            marginBottom: '24px', padding: '14px 18px',
            backgroundColor: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: '12px', color: '#f87171', fontSize: '13px', lineHeight: 1.6,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Top stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px', marginBottom: '24px',
        }}>
          {loading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height={106} />)
            : topMetrics.map(m => <MetricCard key={m.label} {...m} />)
          }
        </div>

        {/* Weekly tracker */}
        {loading
          ? <Skeleton height={120} radius={18} />
          : <div style={{ marginBottom: '24px' }}>
              <WeeklyTracker
                weeklyActivity={weeklyActivity}
                activeDays={activeDaysThisWeek}
                weeklyPct={weeklyPct}
              />
            </div>
        }

        {/* Split Balance + Muscle Group Volume */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '14px', marginBottom: '28px',
        }}>
          {loading ? (
            <>
              <Skeleton height={240} radius={18} />
              <Skeleton height={240} radius={18} />
            </>
          ) : (
            <>
              <SectionCard icon="⚖️" title="Split Balance" minHeight={200}>
                <SplitBalanceChart splitBalance={summary?.splitBalance ?? {}} />
              </SectionCard>
              <SectionCard icon="💪" title="Muscle Group Volume" minHeight={200}>
                <MuscleVolumeChart muscleGroupVolume={summary?.muscleGroupVolume ?? {}} />
              </SectionCard>
            </>
          )}
        </div>

        {/* Recent activity timeline */}
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          Activity Timeline
        </h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} height={52} radius={12} />)}
          </div>
        ) : recentActivity.length === 0 ? (
          <EmptyTimeline />
        ) : (
          <div style={{
            backgroundColor: '#16181e',
            border: '1px solid #22242e',
            borderRadius: '18px',
            padding: '20px 22px',
          }}>
            {recentActivity.map((item, i) => (
              <TimelineItem key={item.id} item={item} isLast={i === recentActivity.length - 1} />
            ))}
          </div>
        )}

      </div>
    </>
  )
}
