// Displays a workout with its exercise list
// expanded=true shows exercise descriptions (used on WorkoutResultPage)
export default function WorkoutCard({ workout, expanded = false }) {
  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px solid #2a2d3a',
      borderRadius: '16px',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{workout.name}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{workout.duration}</span>
            <span style={{ color: '#374151' }}>·</span>
            <span style={{ fontSize: '12px', color: '#00d4ff' }}>{workout.level}</span>
          </div>
        </div>
        <span style={{ fontSize: '28px' }}>🏋️</span>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {workout.exercises?.map((ex, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0d0e11',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{ex.name}</p>
              {expanded && ex.description && (
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{ex.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#9ca3af', flexShrink: 0, marginLeft: '16px' }}>
              <span>{ex.sets} sets</span>
              <span style={{ color: '#374151' }}>×</span>
              <span>{ex.reps}</span>
              <span style={{ color: '#374151' }}>·</span>
              <span>{ex.rest}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
