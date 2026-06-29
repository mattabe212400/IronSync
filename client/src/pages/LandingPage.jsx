import { Link } from 'react-router-dom'

// ─── SVG Gym Equipment ────────────────────────────────────────────────────────

function Barbell({ style = {} }) {
  return (
    <svg viewBox="0 0 560 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* End caps */}
      <rect x="0" y="30" width="14" height="30" rx="3" fill="#44403c"/>
      <rect x="546" y="30" width="14" height="30" rx="3" fill="#44403c"/>
      {/* Left plates — large */}
      <rect x="14" y="6" width="34" height="78" rx="5" fill="#1c1917" stroke="#dc2626" strokeWidth="2"/>
      <rect x="14" y="14" width="34" height="62" rx="3" fill="#292524"/>
      {/* Left plates — small */}
      <rect x="48" y="16" width="22" height="58" rx="4" fill="#1c1917" stroke="#78716c" strokeWidth="1.5"/>
      <rect x="70" y="26" width="14" height="38" rx="3" fill="#1c1917" stroke="#57534e" strokeWidth="1.5"/>
      {/* Left collar */}
      <rect x="84" y="33" width="18" height="24" rx="3" fill="#57534e"/>
      <rect x="86" y="36" width="4" height="18" rx="1" fill="#78716c"/>
      {/* Bar */}
      <rect x="102" y="39" width="356" height="12" rx="6" fill="#57534e"/>
      {/* Knurling */}
      {[120,128,136,144,152,160,168,340,348,356,364,372,380,388].map(x => (
        <rect key={x} x={x} y="39" width="2.5" height="12" rx="1" fill="#44403c"/>
      ))}
      {/* Center mark */}
      <rect x="276" y="36" width="8" height="18" rx="2" fill="#dc2626" opacity="0.7"/>
      {/* Right collar */}
      <rect x="458" y="33" width="18" height="24" rx="3" fill="#57534e"/>
      <rect x="470" y="36" width="4" height="18" rx="1" fill="#78716c"/>
      {/* Right plates — small */}
      <rect x="476" y="26" width="14" height="38" rx="3" fill="#1c1917" stroke="#57534e" strokeWidth="1.5"/>
      <rect x="490" y="16" width="22" height="58" rx="4" fill="#1c1917" stroke="#78716c" strokeWidth="1.5"/>
      {/* Right plates — large */}
      <rect x="512" y="6" width="34" height="78" rx="5" fill="#1c1917" stroke="#dc2626" strokeWidth="2"/>
      <rect x="512" y="14" width="34" height="62" rx="3" fill="#292524"/>
    </svg>
  )
}

function Dumbbell({ style = {} }) {
  return (
    <svg viewBox="0 0 220 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <rect x="4" y="6" width="28" height="52" rx="5" fill="#1c1917" stroke="#dc2626" strokeWidth="1.5"/>
      <rect x="32" y="16" width="18" height="32" rx="3" fill="#292524" stroke="#57534e" strokeWidth="1.5"/>
      <rect x="50" y="26" width="120" height="12" rx="5" fill="#57534e"/>
      {[64,72,80,136,144,152].map(x => (
        <rect key={x} x={x} y="26" width="2" height="12" rx="1" fill="#44403c"/>
      ))}
      <rect x="170" y="16" width="18" height="32" rx="3" fill="#292524" stroke="#57534e" strokeWidth="1.5"/>
      <rect x="188" y="6" width="28" height="52" rx="5" fill="#1c1917" stroke="#dc2626" strokeWidth="1.5"/>
    </svg>
  )
}

function WeightPlate({ style = {} }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="50" cy="50" r="48" fill="#1c1917" stroke="#dc2626" strokeWidth="2.5"/>
      <circle cx="50" cy="50" r="36" fill="#141212" stroke="#292524" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="28" fill="#1c1917" stroke="#44403c" strokeWidth="1"/>
      <circle cx="50" cy="50" r="7" fill="#0c0b0b" stroke="#57534e" strokeWidth="2"/>
      {[0,60,120,180,240,300].map(deg => {
        const rad = (deg * Math.PI) / 180
        const x1 = 50 + 9 * Math.cos(rad)
        const y1 = 50 + 9 * Math.sin(rad)
        const x2 = 50 + 34 * Math.cos(rad)
        const y2 = 50 + 34 * Math.sin(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#292524" strokeWidth="2"/>
      })}
    </svg>
  )
}

const TEXTURE_BG = `
  repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 18px,
    rgba(255,255,255,0.012) 18px,
    rgba(255,255,255,0.012) 19px
  )
`

const features = [
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 40, height: 40 }}>
        <rect x="4" y="18" width="40" height="12" rx="4" fill="#292524"/>
        <rect x="0" y="14" width="10" height="20" rx="3" fill="#dc2626"/>
        <rect x="38" y="14" width="10" height="20" rx="3" fill="#dc2626"/>
        <rect x="10" y="16" width="6" height="16" rx="2" fill="#78716c"/>
        <rect x="32" y="16" width="6" height="16" rx="2" fill="#78716c"/>
      </svg>
    ),
    title: 'AI-BUILT PROGRAMS',
    desc: 'Gemini AI builds full weekly splits based on your goals, experience, and the iron you have access to.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 40, height: 40 }}>
        <rect x="4" y="32" width="8" height="12" rx="2" fill="#dc2626"/>
        <rect x="16" y="22" width="8" height="22" rx="2" fill="#d97706"/>
        <rect x="28" y="14" width="8" height="30" rx="2" fill="#dc2626"/>
        <rect x="40" y="8" width="8" height="36" rx="2" fill="#d97706"/>
        <line x1="4" y1="6" x2="44" y2="6" stroke="#44403c" strokeWidth="2" strokeDasharray="4 3"/>
      </svg>
    ),
    title: 'TRACK YOUR GAINS',
    desc: 'Log every session. Watch the numbers climb. Your progress lives in the dashboard — no guesswork.',
  },
  {
    svg: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 40, height: 40 }}>
        <circle cx="24" cy="24" r="20" stroke="#292524" strokeWidth="2" fill="none"/>
        <circle cx="24" cy="24" r="13" stroke="#44403c" strokeWidth="1.5" fill="none"/>
        <circle cx="24" cy="24" r="4" fill="#dc2626"/>
        <line x1="24" y1="4" x2="24" y2="11" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="24" y1="37" x2="24" y2="44" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="4" y1="24" x2="11" y2="24" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="37" y1="24" x2="44" y2="24" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'YOUR RULES',
    desc: 'Home gym, commercial gym, dumbbells only. Injuries? We route around them. Your program, your way.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 72px',
        background: `${TEXTURE_BG}, #0c0b0b`,
      }}>
        <WeightPlate style={{ position: 'absolute', right: '-60px', top: '-60px', width: '320px', height: '320px', opacity: 0.06, pointerEvents: 'none' }}/>
        <WeightPlate style={{ position: 'absolute', left: '-80px', bottom: '-80px', width: '280px', height: '280px', opacity: 0.05, pointerEvents: 'none' }}/>

        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '4px', padding: '5px 14px', color: '#fca5a5',
            fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '36px',
          }}>
            ⚡ Powered by Gemini AI
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 9vw, 88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', textTransform: 'uppercase', color: '#fafaf9', margin: '0 0 8px' }}>
            Iron Never
          </h1>
          <h1 style={{
            fontSize: 'clamp(48px, 9vw, 88px)', fontWeight: 900, lineHeight: 1.0,
            letterSpacing: '-2px', textTransform: 'uppercase', margin: '0 0 32px',
            background: 'linear-gradient(135deg, #dc2626 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Lies.
          </h1>

          <div style={{ margin: '0 auto 32px', maxWidth: '480px' }}>
            <Barbell style={{ width: '100%', opacity: 0.55 }}/>
          </div>

          <p style={{ fontSize: '17px', color: '#a8a29e', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 44px' }}>
            IronSync builds your personalized training program — tailored to your goals,
            your equipment, and your body. No fluff. No filler. Just work.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/generate" style={{
              padding: '15px 36px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#ffffff', fontWeight: 800, fontSize: '14px',
              letterSpacing: '1px', textTransform: 'uppercase',
              borderRadius: '6px', textDecoration: 'none',
              boxShadow: '0 0 32px rgba(220,38,38,0.35)',
            }}>
              Build My Program →
            </Link>
            <Link to="/dashboard" style={{
              padding: '15px 36px',
              backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#d6d3d1', fontWeight: 600, fontSize: '14px',
              letterSpacing: '0.5px', textTransform: 'uppercase',
              borderRadius: '6px', textDecoration: 'none',
            }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#141212', borderTop: '1px solid #292524', borderBottom: '1px solid #292524', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { value: '68', label: 'Exercises' },
            { value: '10', label: 'Movement Patterns' },
            { value: '4',  label: 'AI Agents' },
            { value: '∞',  label: 'No Excuses' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 40px', borderRight: i < arr.length - 1 ? '1px solid #292524' : 'none' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#dc2626', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: `${TEXTURE_BG}, #0c0b0b`, padding: '56px 24px', display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Dumbbell style={{ width: '200px', opacity: 0.5 }}/>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#57534e', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>The Coach That Never Quits</p>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fafaf9', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>AI that trains like a pro,<br/>talks like a coach.</p>
        </div>
        <Dumbbell style={{ width: '200px', opacity: 0.5, transform: 'scaleX(-1)' }}/>
      </section>

      <section style={{ maxWidth: '1040px', width: '100%', margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
        {features.map((f) => (
          <div key={f.title} style={{ backgroundColor: '#141212', border: '1px solid #1c1917', padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '48px', background: 'linear-gradient(to bottom, #dc2626, transparent)' }}/>
            <div style={{ marginBottom: '20px' }}>{f.svg}</div>
            <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#fafaf9', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#78716c', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      <section style={{ background: `${TEXTURE_BG}, linear-gradient(135deg, #1c0a0a 0%, #0c0b0b 100%)`, borderTop: '1px solid #292524', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <WeightPlate style={{ width: '64px', height: '64px', display: 'inline-block', opacity: 0.7 }}/>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', color: '#fafaf9', margin: '0 0 16px' }}>
            Stop Planning.<br/>Start Lifting.
          </h2>
          <p style={{ color: '#78716c', fontSize: '15px', lineHeight: 1.7, margin: '0 0 36px' }}>
            Your program is one click away. Free. No account required.
          </p>
          <Link to="/generate" style={{
            display: 'inline-block', padding: '16px 48px',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#ffffff', fontWeight: 800, fontSize: '14px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            borderRadius: '6px', textDecoration: 'none',
            boxShadow: '0 0 48px rgba(220,38,38,0.3)',
          }}>
            Build My Program →
          </Link>
        </div>
      </section>

    </div>
  )
}
