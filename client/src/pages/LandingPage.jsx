import { Link } from 'react-router-dom'

// ─── SVG Components ───────────────────────────────────────────────────────────

function Barbell({ style = {} }) {
  return (
    <svg viewBox="0 0 560 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <rect x="0" y="30" width="14" height="30" rx="3" fill="#374151"/>
      <rect x="546" y="30" width="14" height="30" rx="3" fill="#374151"/>
      <rect x="14" y="6" width="34" height="78" rx="5" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="14" y="14" width="34" height="62" rx="3" fill="#1e3066"/>
      <rect x="48" y="16" width="22" height="58" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
      <rect x="70" y="26" width="14" height="38" rx="3" fill="#1e293b" stroke="#374151" strokeWidth="1.5"/>
      <rect x="84" y="33" width="18" height="24" rx="3" fill="#475569"/>
      <rect x="102" y="39" width="356" height="12" rx="6" fill="#475569"/>
      {[120,128,136,144,152,160,168,340,348,356,364,372,380,388].map(x => (
        <rect key={x} x={x} y="39" width="2.5" height="12" rx="1" fill="#374151"/>
      ))}
      <rect x="276" y="36" width="8" height="18" rx="2" fill="#dc2626" opacity="0.9"/>
      <rect x="458" y="33" width="18" height="24" rx="3" fill="#475569"/>
      <rect x="476" y="26" width="14" height="38" rx="3" fill="#1e293b" stroke="#374151" strokeWidth="1.5"/>
      <rect x="490" y="16" width="22" height="58" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
      <rect x="512" y="6" width="34" height="78" rx="5" fill="#dc2626" stroke="#ef4444" strokeWidth="1.5"/>
      <rect x="512" y="14" width="34" height="62" rx="3" fill="#b91c1c"/>
    </svg>
  )
}

function Star({ size = 16, color = '#dc2626', style = {} }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} style={{ width: size, height: size, ...style }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

function WeightPlate({ color = '#1e3a8a', stroke = '#3b82f6', style = {} }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="50" cy="50" r="48" fill={color} stroke={stroke} strokeWidth="2"/>
      <circle cx="50" cy="50" r="36" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="28" fill={color} stroke="#1e293b" strokeWidth="1"/>
      <circle cx="50" cy="50" r="7" fill="#0a0d14" stroke="#475569" strokeWidth="2"/>
      {[0,60,120,180,240,300].map(deg => {
        const rad = (deg * Math.PI) / 180
        return <line key={deg}
          x1={50 + 9*Math.cos(rad)} y1={50 + 9*Math.sin(rad)}
          x2={50 + 34*Math.cos(rad)} y2={50 + 34*Math.sin(rad)}
          stroke="#1e293b" strokeWidth="2"/>
      })}
    </svg>
  )
}

// ─── Flag stripe divider ──────────────────────────────────────────────────────

function FlagStripes() {
  return (
    <div style={{ display: 'flex', height: '6px', width: '100%' }}>
      {['#dc2626','#ffffff','#dc2626','#ffffff','#dc2626','#1d4ed8','#1d4ed8'].map((c, i) => (
        <div key={i} style={{ flex: 1, backgroundColor: c }}/>
      ))}
    </div>
  )
}

// ─── Stars field ──────────────────────────────────────────────────────────────

const STAR_POSITIONS = [
  { top: '8%',  left: '3%',  size: 10, opacity: 0.4 },
  { top: '22%', left: '7%',  size: 7,  opacity: 0.25 },
  { top: '5%',  left: '14%', size: 6,  opacity: 0.2 },
  { top: '38%', left: '2%',  size: 8,  opacity: 0.3 },
  { top: '15%', left: '92%', size: 10, opacity: 0.4 },
  { top: '30%', left: '88%', size: 7,  opacity: 0.25 },
  { top: '8%',  left: '96%', size: 6,  opacity: 0.2 },
  { top: '45%', left: '94%', size: 8,  opacity: 0.3 },
  { top: '55%', left: '5%',  size: 6,  opacity: 0.18 },
  { top: '62%', left: '90%', size: 6,  opacity: 0.18 },
]

function StarsField() {
  return (
    <>
      {STAR_POSITIONS.map((s, i) => (
        <Star key={i} size={s.size} color="#ffffff"
          style={{ position: 'absolute', top: s.top, left: s.left, opacity: s.opacity, pointerEvents: 'none' }}/>
      ))}
    </>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: '★',
    title: 'AI-BUILT PROGRAMS',
    desc: 'Gemini AI builds your full weekly split — tailored to your goals, your gym, and your limits.',
  },
  {
    icon: '★',
    title: 'TRACK YOUR GAINS',
    desc: 'Log every session. Watch the numbers go up. Your progress lives in the dashboard — no guesswork.',
  },
  {
    icon: '★',
    title: 'YOUR RULES',
    desc: 'Home gym, commercial gym, dumbbells only, bad shoulder — we route around it all. Your program, your way.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '90px 24px 80px',
        background: 'radial-gradient(ellipse at top, #0f1e3d 0%, #0a0d14 60%)',
      }}>
        <StarsField />

        {/* Background plates */}
        <WeightPlate color="#1e3a8a" stroke="#2563eb" style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '340px', height: '340px', opacity: 0.07, pointerEvents: 'none',
        }}/>
        <WeightPlate color="#7f1d1d" stroke="#dc2626" style={{
          position: 'absolute', left: '-80px', bottom: '-80px',
          width: '300px', height: '300px', opacity: 0.07, pointerEvents: 'none',
        }}/>

        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>

          {/* Stars row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} color={i === 2 ? '#dc2626' : '#ffffff'} style={{ opacity: 0.85 }}/>
            ))}
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(29,78,216,0.2)',
            border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: '3px',
            padding: '5px 16px',
            color: '#93c5fd',
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            ⚡ Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(50px, 10vw, 96px)',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-3px',
            textTransform: 'uppercase',
            margin: '0 0 16px',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>Built</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 50%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              American
            </span>
            <span style={{ color: '#ffffff', display: 'block' }}>Tough.</span>
          </h1>

          {/* Barbell */}
          <div style={{ margin: '32px auto', maxWidth: '500px' }}>
            <Barbell style={{ width: '100%', opacity: 0.7 }}/>
          </div>

          {/* Subtext */}
          <p style={{
            fontSize: '17px', color: '#94a3b8', lineHeight: 1.75,
            maxWidth: '520px', margin: '0 auto 44px',
          }}>
            IronSync builds your personalized training program — engineered for results,
            built for people who actually show up. No fluff. No filler. Just iron.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/generate" style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              borderRadius: '4px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(220,38,38,0.4)',
            }}>
              ★ Build My Program
            </Link>
            <Link to="/dashboard" style={{
              padding: '15px 36px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderRadius: '4px',
              textDecoration: 'none',
            }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLAG DIVIDER ──────────────────────────────────────────────────── */}
      <FlagStripes />

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: '#060810',
        borderBottom: '1px solid #1e293b',
        padding: '28px 24px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            { value: '68',  label: 'Exercises' },
            { value: '10',  label: 'Movement Patterns' },
            { value: '4',   label: 'AI Agents' },
            { value: '0',   label: 'Excuses' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 44px',
              borderRight: i < arr.length - 1 ? '1px solid #1e293b' : 'none',
            }}>
              <span style={{
                fontSize: '34px', fontWeight: 900,
                background: i % 2 === 0
                  ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                  : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-1px', lineHeight: 1,
              }}>{s.value}</span>
              <span style={{
                fontSize: '10px', color: '#475569', fontWeight: 700,
                letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px',
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section style={{
        background: 'radial-gradient(ellipse at bottom, #0f1e3d 0%, #0a0d14 70%)',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

          {/* Section label */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, #dc2626)' }}/>
              <Star size={12} color="#dc2626"/>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#64748b', textTransform: 'uppercase' }}>
                What You Get
              </span>
              <Star size={12} color="#1d4ed8"/>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, #1d4ed8)' }}/>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2px',
          }}>
            {features.map((f, i) => (
              <div key={f.title} style={{
                backgroundColor: '#0d1117',
                border: '1px solid #1e293b',
                padding: '40px 32px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Top color bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '3px',
                  background: i === 0
                    ? 'linear-gradient(to right, #dc2626, #ef4444)'
                    : i === 1
                    ? 'linear-gradient(to right, #ffffff22, #ffffff44)'
                    : 'linear-gradient(to right, #1d4ed8, #3b82f6)',
                }}/>

                <div style={{ fontSize: '20px', color: i === 1 ? '#ffffff' : i === 0 ? '#dc2626' : '#3b82f6', marginBottom: '18px' }}>
                  {f.icon}
                </div>
                <h3 style={{
                  margin: '0 0 12px',
                  fontSize: '13px', fontWeight: 800,
                  color: '#f1f5f9',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  {f.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.75 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAG DIVIDER ──────────────────────────────────────────────────── */}
      <FlagStripes />

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section style={{
        background: 'radial-gradient(ellipse at center, #0f1e3d 0%, #0a0d14 70%)',
        padding: '88px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <StarsField />

        {/* Flanking plates */}
        <WeightPlate color="#1e3a8a" stroke="#2563eb" style={{
          position: 'absolute', left: '-40px', top: '50%',
          transform: 'translateY(-50%)',
          width: '200px', height: '200px', opacity: 0.1, pointerEvents: 'none',
        }}/>
        <WeightPlate color="#7f1d1d" stroke="#dc2626" style={{
          position: 'absolute', right: '-40px', top: '50%',
          transform: 'translateY(-50%)',
          width: '200px', height: '200px', opacity: 0.1, pointerEvents: 'none',
        }}/>

        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16}
                color={i < 2 ? '#dc2626' : i === 2 ? '#ffffff' : '#1d4ed8'}
                style={{ opacity: 0.9 }}/>
            ))}
          </div>

          <h2 style={{
            fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-1.5px',
            color: '#f8fafc', margin: '0 0 16px', lineHeight: 1.0,
          }}>
            Stop Planning.<br/>
            <span style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 50%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Start Lifting.
            </span>
          </h2>

          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: '0 0 40px' }}>
            Your program is one click away. Free. No account required.
          </p>

          <Link to="/generate" style={{
            display: 'inline-block',
            padding: '17px 52px',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            borderRadius: '4px',
            textDecoration: 'none',
            boxShadow: '0 0 60px rgba(220,38,38,0.35)',
          }}>
            ★ Build My Program
          </Link>

          {/* Small patriotic tagline */}
          <p style={{
            marginTop: '24px', fontSize: '11px', color: '#334155',
            letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600,
          }}>
            🇺🇸 Forged in Iron. Built to Win.
          </p>
        </div>
      </section>

    </div>
  )
}
