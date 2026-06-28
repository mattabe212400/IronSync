import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Keyframe injection for spinner
const ANIM = `
  @keyframes ironsync-spin { to { transform: rotate(360deg); } }
  .is-spin { animation: ironsync-spin 0.75s linear infinite; }
  @keyframes ironsync-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
  .is-pulse { animation: ironsync-pulse 1.4s ease-in-out infinite; }
  input::placeholder, textarea::placeholder { color: #4b5563; }
  input:focus, textarea:focus { border-color: rgba(0,212,255,0.35) !important; }
`

// ─── Static data ────────────────────────────────────────────────────────────

const GOALS = [
  { value: 'Build Muscle',          icon: '💪', desc: 'Hypertrophy & size gains'       },
  { value: 'Lose Fat',              icon: '🔥', desc: 'Cut fat, preserve muscle'        },
  { value: 'Strength',              icon: '🏆', desc: 'Maximal power & PRs'             },
  { value: 'Athletic Performance',  icon: '⚡', desc: 'Speed, agility & explosiveness'  },
]

const EXPERIENCE   = ['Beginner', 'Intermediate', 'Advanced']
const DAYS         = [2, 3, 4, 5, 6]
const SPLITS       = ['Full Body', 'Upper/Lower', 'Push Pull Legs', 'Arnold', 'AI Recommend']
const DURATIONS    = ['30 min', '45 min', '60 min', '75 min', '90 min']
const EQUIPMENT    = [
  { value: 'Commercial Gym', icon: '🏋️' },
  { value: 'Home Gym',       icon: '🏠' },
  { value: 'Dumbbells Only', icon: '🥊' },
  { value: 'Bodyweight',     icon: '🤸' },
]
const CARDIO       = ['None', 'Light', 'Moderate', 'Heavy']
const STYLES       = [
  { value: 'Heavy',       desc: 'Low reps (3-6), high load'         },
  { value: 'Moderate',    desc: 'Balanced intensity (6-12 reps)'    },
  { value: 'High Volume', desc: 'Many sets, higher reps (12-20)'    },
  { value: 'Functional',  desc: 'Movement-based, athletic focus'    },
]
const MUSCLES = [
  'Chest','Back','Shoulders','Biceps','Triceps',
  'Forearms','Core','Glutes','Quads','Hamstrings','Calves',
]

const STEPS = [
  { label: 'Profile',   icon: '👤' },
  { label: 'Schedule',  icon: '📅' },
  { label: 'Equipment', icon: '🏋️' },
  { label: 'Customize', icon: '⚙️' },
]

const DEFAULT = {
  name: '', goal: '', experience: '',
  daysPerWeek: 4, split: '', duration: '60 min',
  equipment: '', cardio: 'Moderate', trainingStyle: '',
  musclesPriority: [], musclesAvoid: [],
  injuries: '', notes: '',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ icon, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
      <span style={{ fontSize:'17px' }}>{icon}</span>
      <span style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.8px' }}>
        {label}
      </span>
    </div>
  )
}

function Block({ children }) {
  return <div style={{ marginBottom:'28px' }}>{children}</div>
}

function FieldError({ msg }) {
  return msg ? <p style={{ color:'#f87171', fontSize:'13px', margin:'8px 0 0' }}>{msg}</p> : null
}

// Card-style pill (used for goals, equipment, training style)
function CardPill({ label, desc, icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'3px',
      padding:'14px 16px', borderRadius:'14px', textAlign:'left', cursor:'pointer',
      border: active ? '1.5px solid rgba(0,212,255,0.55)' : '1.5px solid rgba(255,255,255,0.07)',
      backgroundColor: active ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
      color: active ? '#00d4ff' : '#9ca3af',
      transition: 'all 0.15s',
    }}>
      {icon && <span style={{ fontSize:'20px', marginBottom:'2px' }}>{icon}</span>}
      <span style={{ fontSize:'14px', fontWeight: active ? 600 : 500 }}>{label}</span>
      {desc && <span style={{ fontSize:'11px', color: active ? 'rgba(0,212,255,0.65)' : '#4b5563' }}>{desc}</span>}
    </button>
  )
}

// Inline pill (for experience, days, duration, cardio)
function Pill({ label, active, onClick, flex = false }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: flex ? 1 : undefined,
      padding:'9px 16px', borderRadius:'12px', cursor:'pointer',
      border: active ? '1.5px solid rgba(0,212,255,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
      backgroundColor: active ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
      color: active ? '#00d4ff' : '#9ca3af',
      fontSize:'14px', fontWeight: active ? 600 : 500,
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  )
}

// Rounded chip for muscle groups (multi-select)
function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding:'6px 14px', borderRadius:'100px', cursor:'pointer',
      border: active ? '1.5px solid rgba(0,212,255,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
      backgroundColor: active ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
      color: active ? '#00d4ff' : '#6b7280',
      fontSize:'13px', fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      {active ? `✓ ${label}` : label}
    </button>
  )
}

// ─── Main Form ───────────────────────────────────────────────────────────────

export default function WorkoutForm() {
  const navigate  = useNavigate()
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState(DEFAULT)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set  = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const flip = (key, val) => setForm(p => ({
    ...p,
    [key]: p[key].includes(val) ? p[key].filter(v => v !== val) : [...p[key], val],
  }))

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.goal)       e.goal       = 'Select a primary goal to continue.'
      if (!form.experience) e.experience = 'Select your experience level.'
    }
    if (s === 1 && !form.split) e.split = 'Choose a workout split.'
    if (s === 2) {
      if (!form.equipment)    e.equipment    = 'Choose your available equipment.'
      if (!form.trainingStyle) e.trainingStyle = 'Pick a training style.'
    }
    return e
  }

  const next = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const back = () => { setErrors({}); setStep(s => s - 1) }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/ai/generate-workout`, form)
      navigate('/workout-result', { state: { workout: res.data.workout, form } })
    } catch {
      setErrors({ submit: 'Could not reach the server. Make sure the backend is running on port 5000.' })
      setLoading(false)
    }
  }

  const pct = ((step + 1) / STEPS.length) * 100

  return (
    <>
      <style>{ANIM}</style>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          backgroundColor:'rgba(10,11,14,0.96)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'24px',
        }}>
          <div className="is-spin" style={{
            width:'56px', height:'56px', borderRadius:'50%',
            border:'3px solid rgba(0,212,255,0.12)', borderTopColor:'#00d4ff',
          }} />
          <div style={{ textAlign:'center' }}>
            <p className="is-pulse" style={{ margin:0, fontSize:'20px', fontWeight:700, color:'#fff' }}>
              Building your personalized plan...
            </p>
            <p style={{ margin:'8px 0 0', fontSize:'14px', color:'#4b5563' }}>
              Analyzing your goals and preferences
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit}>

        {/* ── Step indicator ─────────────────────────────────── */}
        <div style={{ marginBottom:'36px' }}>
          <div style={{ display:'flex', alignItems:'center', marginBottom:'14px' }}>
            {STEPS.map((s, i) => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length - 1 ? 1 : 'initial' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
                  <div style={{
                    width:'38px', height:'38px', borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px',
                    backgroundColor: i <= step ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: i === step ? '2px solid #00d4ff'
                          : i < step  ? '2px solid rgba(0,212,255,0.45)'
                          : '2px solid rgba(255,255,255,0.07)',
                    transition:'all 0.3s',
                  }}>
                    {i < step ? <span style={{ color:'#00d4ff', fontWeight:700, fontSize:'14px' }}>✓</span> : s.icon}
                  </div>
                  <span style={{
                    fontSize:'10px', fontWeight:600, letterSpacing:'0.4px',
                    color: i === step ? '#00d4ff' : i < step ? 'rgba(0,212,255,0.5)' : '#374151',
                  }}>
                    {s.label.toUpperCase()}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex:1, height:'2px', margin:'0 6px', marginBottom:'17px',
                    backgroundColor: i < step ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)',
                    transition:'background-color 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ height:'3px', backgroundColor:'rgba(255,255,255,0.05)', borderRadius:'100px', overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${pct}%`,
              background:'linear-gradient(90deg, #00d4ff, #00ff88)',
              borderRadius:'100px', transition:'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* ── Step 0 : Profile ───────────────────────────────── */}
        {step === 0 && (
          <>
            <Block>
              <SectionLabel icon="✏️" label="Your Name (Optional)" />
              <input
                type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Alex"
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'12px 16px', borderRadius:'12px', fontSize:'15px',
                  border:'1.5px solid rgba(255,255,255,0.07)',
                  backgroundColor:'rgba(255,255,255,0.04)',
                  color:'#fff', outline:'none', fontFamily:'inherit',
                  transition:'border-color 0.15s',
                }}
              />
            </Block>

            <Block>
              <SectionLabel icon="🎯" label="Primary Goal" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {GOALS.map(g => (
                  <CardPill key={g.value} {...g} active={form.goal === g.value} onClick={() => set('goal', g.value)} />
                ))}
              </div>
              <FieldError msg={errors.goal} />
            </Block>

            <Block>
              <SectionLabel icon="📊" label="Experience Level" />
              <div style={{ display:'flex', gap:'8px' }}>
                {EXPERIENCE.map(l => (
                  <Pill key={l} label={l} active={form.experience === l} onClick={() => set('experience', l)} flex />
                ))}
              </div>
              <FieldError msg={errors.experience} />
            </Block>
          </>
        )}

        {/* ── Step 1 : Schedule ──────────────────────────────── */}
        {step === 1 && (
          <>
            <Block>
              <SectionLabel icon="📅" label="Days Per Week" />
              <div style={{ display:'flex', gap:'8px' }}>
                {DAYS.map(d => (
                  <Pill key={d} label={`${d}d`} active={form.daysPerWeek === d} onClick={() => set('daysPerWeek', d)} flex />
                ))}
              </div>
            </Block>

            <Block>
              <SectionLabel icon="🗂️" label="Workout Split" />
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {SPLITS.map(s => (
                  <Pill key={s} label={s} active={form.split === s} onClick={() => set('split', s)} />
                ))}
              </div>
              <FieldError msg={errors.split} />
            </Block>

            <Block>
              <SectionLabel icon="⏱️" label="Session Length" />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {DURATIONS.map(d => (
                  <Pill key={d} label={d} active={form.duration === d} onClick={() => set('duration', d)} />
                ))}
              </div>
            </Block>
          </>
        )}

        {/* ── Step 2 : Equipment ─────────────────────────────── */}
        {step === 2 && (
          <>
            <Block>
              <SectionLabel icon="🏋️" label="Equipment Available" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {EQUIPMENT.map(eq => (
                  <CardPill key={eq.value} label={eq.value} icon={eq.icon} active={form.equipment === eq.value} onClick={() => set('equipment', eq.value)} />
                ))}
              </div>
              <FieldError msg={errors.equipment} />
            </Block>

            <Block>
              <SectionLabel icon="🏃" label="Cardio Preference" />
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {CARDIO.map(c => (
                  <Pill key={c} label={c} active={form.cardio === c} onClick={() => set('cardio', c)} />
                ))}
              </div>
            </Block>

            <Block>
              <SectionLabel icon="⚡" label="Training Style" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {STYLES.map(ts => (
                  <CardPill key={ts.value} label={ts.value} desc={ts.desc} active={form.trainingStyle === ts.value} onClick={() => set('trainingStyle', ts.value)} />
                ))}
              </div>
              <FieldError msg={errors.trainingStyle} />
            </Block>
          </>
        )}

        {/* ── Step 3 : Customize ─────────────────────────────── */}
        {step === 3 && (
          <>
            <Block>
              <SectionLabel icon="💪" label="Muscles to Prioritize" />
              <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#4b5563' }}>Select any to emphasize (optional)</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {MUSCLES.map(m => (
                  <Chip key={m} label={m} active={form.musclesPriority.includes(m)} onClick={() => flip('musclesPriority', m)} />
                ))}
              </div>
            </Block>

            <Block>
              <SectionLabel icon="🚫" label="Muscles to Avoid" />
              <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#4b5563' }}>Select any to de-emphasize (optional)</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {MUSCLES.map(m => (
                  <Chip key={m} label={m} active={form.musclesAvoid.includes(m)} onClick={() => flip('musclesAvoid', m)} />
                ))}
              </div>
            </Block>

            <Block>
              <SectionLabel icon="🩹" label="Injuries or Limitations" />
              <textarea
                value={form.injuries} onChange={e => set('injuries', e.target.value)}
                placeholder="e.g. Lower back pain, left knee tendinitis, shoulder impingement..."
                rows={3}
                style={{
                  width:'100%', boxSizing:'border-box', padding:'12px 16px',
                  borderRadius:'12px', fontSize:'14px', lineHeight:1.6,
                  border:'1.5px solid rgba(255,255,255,0.07)',
                  backgroundColor:'rgba(255,255,255,0.04)',
                  color:'#fff', resize:'vertical', outline:'none', fontFamily:'inherit',
                  transition:'border-color 0.15s',
                }}
              />
            </Block>

            <Block>
              <SectionLabel icon="📝" label="Additional Notes" />
              <textarea
                value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Any other preferences or context you'd like considered..."
                rows={3}
                style={{
                  width:'100%', boxSizing:'border-box', padding:'12px 16px',
                  borderRadius:'12px', fontSize:'14px', lineHeight:1.6,
                  border:'1.5px solid rgba(255,255,255,0.07)',
                  backgroundColor:'rgba(255,255,255,0.04)',
                  color:'#fff', resize:'vertical', outline:'none', fontFamily:'inherit',
                  transition:'border-color 0.15s',
                }}
              />
            </Block>
          </>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div style={{
            backgroundColor:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)',
            color:'#f87171', fontSize:'14px', borderRadius:'12px',
            padding:'12px 16px', marginBottom:'20px',
          }}>
            {errors.submit}
          </div>
        )}

        {/* ── Nav buttons ────────────────────────────────────── */}
        <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
          {step > 0 && (
            <button type="button" onClick={back} style={{
              flex:1, padding:'14px',
              backgroundColor:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.1)',
              color:'#9ca3af', fontWeight:600, fontSize:'15px',
              borderRadius:'13px', cursor:'pointer',
            }}>
              ← Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} style={{
              flex:2, padding:'14px',
              backgroundColor:'#00d4ff', color:'#000',
              fontWeight:700, fontSize:'15px', borderRadius:'13px',
              border:'none', cursor:'pointer',
              boxShadow:'0 0 28px rgba(0,212,255,0.18)',
            }}>
              Continue →
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{
              flex:2, padding:'14px',
              backgroundColor: loading ? '#008faa' : '#00d4ff',
              color:'#000', fontWeight:900, fontSize:'15px', borderRadius:'13px',
              border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow:'0 0 30px rgba(0,212,255,0.2)',
            }}>
              {loading ? 'Generating...' : 'Generate My Plan ⚡'}
            </button>
          )}
        </div>
      </form>
    </>
  )
}
