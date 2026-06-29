import { Link } from 'react-router-dom'

const features = [
  { icon: '🤖', title: 'AI-Powered Plans', desc: 'Gemini AI crafts workouts based on your exact goals, fitness level, and available equipment.' },
  { icon: '📊', title: 'Track Progress', desc: 'Log workouts and watch your strength and endurance grow week over week.' },
  { icon: '⚙️', title: 'Fully Customizable', desc: 'Choose duration, equipment, muscle focus, and intensity to fit any lifestyle.' },
]

export default function LandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hero */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '100px',
          padding: '6px 16px',
          color: '#00d4ff',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '32px',
        }}>
          ⚡ Powered by Gemini AI
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', color: '#ffffff', margin: '0 0 24px' }}>
          Train Smarter.<br />
          <span style={{
            background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Not Harder.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto 40px' }}>
          IronSync generates personalized workout plans tailored to your goals, fitness level, and the equipment you actually have.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/generate" style={{
            padding: '14px 32px',
            backgroundColor: '#00d4ff',
            color: '#000000',
            fontWeight: 800,
            fontSize: '15px',
            borderRadius: '14px',
            textDecoration: 'none',
            boxShadow: '0 0 40px rgba(0,212,255,0.25)',
          }}>
            Generate My Workout →
          </Link>
          <Link to="/dashboard" style={{
            padding: '14px 32px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '15px',
            borderRadius: '14px',
            textDecoration: 'none',
          }}>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1000px', width: '100%', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {features.map(f => (
          <div key={f.title} style={{
            backgroundColor: '#16181e',
            border: '1px solid #2a2d3a',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
