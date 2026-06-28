// Displays a single stat — icon, big number, label, and optional sub-text
export default function MetricCard({ icon, label, value, sub }) {
  return (
    <div style={{
      backgroundColor: '#16181e',
      border: '1px solid #2a2d3a',
      borderRadius: '16px',
      padding: '20px',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff' }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}
