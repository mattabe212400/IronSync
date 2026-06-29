import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ANIM = `
  @keyframes dot-bounce { 0%,60%,100%{opacity:0.15;transform:scale(0.85)} 30%{opacity:1;transform:scale(1)} }
  @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
  .coach-dot { animation: dot-bounce 1.4s ease-in-out infinite; }
  textarea::placeholder { color: #374151; }
  textarea:focus { outline: none; border-color: rgba(0,212,255,0.3) !important; }
  .prompt-chip:hover { background: rgba(255,255,255,0.07) !important; color: #9ca3af !important; }
`

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: "Hey! I'm your IronSync Coach 💪 I can help you swap exercises, adjust for soreness, modify your plan, and plan your progression. What are you working on today?",
}

const SUGGESTED = [
  { label: '🔄 Replace squats',    text: 'I want to replace squats with a different exercise' },
  { label: '🩹 Shoulder hurts',    text: 'My shoulder is hurting — what exercises should I avoid?' },
  { label: '⏱️ Only 30 minutes',   text: 'I only have 30 minutes today, make this workout shorter' },
  { label: '🥊 Only dumbbells',    text: 'I only have dumbbells today, can you adapt the workout?' },
  { label: '😓 Really sore',       text: "I'm really sore from yesterday — should I still train?" },
  { label: '💪 More arm work',     text: 'Add more arm work to my program' },
  { label: '🔥 Too easy',          text: 'This is feeling too easy — increase the intensity' },
  { label: '📉 Reduce volume',     text: "I'm feeling run down — reduce the volume this week" },
  { label: '✅ Completed!',        text: 'I completed all my sets and reps this week! What should I do next week to progress?' },
  { label: '🤔 Explain exercise',  text: 'Explain why Romanian Deadlifts are in my program' },
]

function UserBubble({ msg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
      <div style={{
        maxWidth: '78%', padding: '12px 16px',
        backgroundColor: 'rgba(0,212,255,0.1)',
        border: '1px solid rgba(0,212,255,0.18)',
        borderRadius: '18px 18px 4px 18px',
        fontSize: '14px', color: '#e5e7eb', lineHeight: 1.65,
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function AiBubble({ msg }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', marginTop: '2px',
      }}>
        🤖
      </div>

      <div style={{ maxWidth: '88%', minWidth: 0 }}>
        <div style={{
          padding: '14px 16px',
          backgroundColor: '#16181e',
          border: '1px solid #1e2028',
          borderRadius: '4px 18px 18px 18px',
          fontSize: '14px', color: '#e2e8f0', lineHeight: 1.72,
        }}>
          {msg.content}

          {msg.updatedWorkout && (
            <div style={{
              marginTop: '12px', padding: '8px 12px',
              backgroundColor: 'rgba(0,255,136,0.07)',
              border: '1px solid rgba(0,255,136,0.18)',
              borderRadius: '10px', fontSize: '12px', color: '#00ff88',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              ✓ Workout updated — see the context panel
            </div>
          )}
        </div>

        {msg.recommendations?.length > 0 && (
          <div style={{
            marginTop: '6px', padding: '10px 14px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '10px',
          }}>
            {msg.recommendations.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', fontSize: '13px',
                color: '#6b7280', lineHeight: 1.6,
                marginBottom: i < msg.recommendations.length - 1 ? '5px' : 0,
              }}>
                <span style={{ color: '#00d4ff', flexShrink: 0 }}>→</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {msg.agentUsed && msg.agentUsed !== 'workout' && (
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#374151', paddingLeft: '4px' }}>
            {msg.agentUsed === 'swap'        && '🔄 Exercise Swap Agent'}
            {msg.agentUsed === 'recovery'    && '🩹 Recovery Agent'}
            {msg.agentUsed === 'progression' && '📈 Progression Agent'}
          </div>
        )}
      </div>
    </div>
  )
}

function SystemBubble({ msg, variant }) {
  const isError = variant === 'error'
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
      <div style={{
        maxWidth: '80%', padding: '8px 16px',
        backgroundColor: isError ? 'rgba(239,68,68,0.07)' : 'rgba(234,179,8,0.07)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.18)' : 'rgba(234,179,8,0.18)'}`,
        borderRadius: '10px', fontSize: '13px', lineHeight: 1.5,
        color: isError ? '#f87171' : '#fbbf24',
        textAlign: 'center',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '24px 24px 8px' }}>
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏋️</div>
      <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
        No workout plan loaded
      </p>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
        Generate a plan first for full coaching features, or just ask me anything.
      </p>
      <a href="/generate" style={{
        display: 'inline-block', padding: '7px 16px',
        backgroundColor: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.22)',
        borderRadius: '10px', color: '#00d4ff',
        fontSize: '13px', fontWeight: 600, textDecoration: 'none',
      }}>
        Generate a Plan →
      </a>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
      }}>
        🤖
      </div>
      <div style={{
        padding: '16px 18px', backgroundColor: '#16181e',
        border: '1px solid #1e2028',
        borderRadius: '4px 18px 18px 18px',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="coach-dot" style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#00d4ff',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

function ContextPanelContent({ context }) {
  const { workout, goal, experience, equipment, limitations } = context
  return (
    <>
      <div style={{ marginBottom: '18px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Current Plan
        </p>

        {workout ? (
          <div style={{
            padding: '12px 14px', backgroundColor: '#16181e',
            border: '1px solid #1e2028', borderRadius: '12px',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#e5e7eb', lineHeight: 1.4 }}>
              {workout.name}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {[
                workout.daysPerWeek && `${workout.daysPerWeek}d/week`,
                workout.split,
                workout.duration,
              ].filter(Boolean).map(tag => (
                <span key={tag} style={{
                  fontSize: '10px', padding: '2px 8px',
                  backgroundColor: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: '100px', color: '#00d4ff',
                }}>{tag}</span>
              ))}
            </div>
            {workout.weeklySchedule?.map((d, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#4b5563', marginBottom: '2px', lineHeight: 1.5 }}>
                <span style={{ color: '#6b7280', fontWeight: 600 }}>{d.label}: </span>
                {d.focus}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '12px 14px', backgroundColor: '#16181e',
            border: '1px solid #1e2028', borderRadius: '12px',
            fontSize: '12px', color: '#374151', fontStyle: 'italic', lineHeight: 1.6,
          }}>
            No plan loaded. Generate one or describe your current program.
          </div>
        )}
      </div>

      <div>
        <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Profile
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { label: 'Goal',        value: goal },
            { label: 'Experience',  value: experience },
            { label: 'Equipment',   value: equipment },
            { label: 'Limitations', value: limitations },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '7px 10px', backgroundColor: '#16181e',
              border: '1px solid #1e2028', borderRadius: '9px',
              gap: '8px',
            }}>
              <span style={{ fontSize: '11px', color: '#374151', fontWeight: 600, flexShrink: 0 }}>
                {item.label}
              </span>
              <span style={{
                fontSize: '11px', textAlign: 'right', lineHeight: 1.4,
                color: item.value ? '#9ca3af' : '#2d3748',
                fontStyle: item.value ? 'normal' : 'italic',
              }}>
                {item.value || 'Not set'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function CoachPage() {
  const location  = useLocation()
  const isMobile  = useIsMobile()
  const [showContext, setShowContext] = useState(false)

  const [context, setContext] = useState({
    workout:     location.state?.workout          || null,
    planId:      location.state?.planId           || null,
    goal:        location.state?.form?.goal       || null,
    experience:  location.state?.form?.experience || null,
    equipment:   location.state?.form?.equipment  || null,
    limitations: location.state?.form?.injuries   || null,
  })

  const [messages, setMessages] = useState([GREETING])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close drawer when switching to desktop
  useEffect(() => { if (!isMobile) setShowContext(false) }, [isMobile])

  const send = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg = { id: Date.now(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await axios.post(`${API}/api/coach/message`, {
        message: msg,
        context,
        conversationHistory: messages,
      })

      const aiMsg = {
        id:              Date.now() + 1,
        role:            'assistant',
        content:         data.response,
        reasoning:       data.reasoning,
        recommendations: data.recommendations,
        updatedWorkout:  data.updatedWorkout,
        agentUsed:       data.agentUsed,
      }
      setMessages(prev => {
        const next = [...prev, aiMsg]
        if (data.warning) {
          next.push({ id: Date.now() + 2, role: 'system-warning', content: `⚠️ ${data.warning}` })
        }
        return next
      })

      if (data.updatedWorkout) {
        setContext(prev => ({ ...prev, workout: data.updatedWorkout }))
      }
    } catch (err) {
      const isNetwork = !err.response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'system-error',
        content: isNetwork
          ? "Cannot reach the server. Make sure the backend is running on port 5000."
          : `Server error: ${err.response?.data?.error || 'Something went wrong. Please try again.'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <style>{ANIM}</style>

      {/* Mobile context drawer overlay */}
      {isMobile && showContext && (
        <div
          onClick={() => setShowContext(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: '300px', maxWidth: '85vw',
              backgroundColor: '#0b0c0f',
              borderLeft: '1px solid #1a1c24',
              overflowY: 'auto', padding: '20px 16px',
              animation: 'slideIn 0.22s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.9px' }}>
                Context
              </p>
              <button
                onClick={() => setShowContext(false)}
                style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px' }}
              >
                ✕
              </button>
            </div>
            <ContextPanelContent context={context} />
          </div>
        </div>
      )}

      <div style={{
        height: 'calc(100vh - 60px)',
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: '#0d0e11',
      }}>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Header */}
          <div style={{
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderBottom: '1px solid #1a1c24',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>
                🤖
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>IronSync Coach</h1>
                <p style={{ margin: 0, fontSize: '12px', color: '#4b5563' }}>AI fitness agent · Gemini</p>
              </div>
            </div>

            {/* Context toggle — mobile only */}
            {isMobile && (
              <button
                onClick={() => setShowContext(true)}
                style={{
                  flexShrink: 0,
                  padding: '7px 12px',
                  backgroundColor: 'rgba(0,212,255,0.07)',
                  border: '1px solid rgba(0,212,255,0.18)',
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: '#00d4ff',
                  whiteSpace: 'nowrap',
                }}
              >
                Context
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px 8px' : '20px 24px 12px' }}>
            {messages.map(m => {
              if (m.role === 'user')           return <UserBubble   key={m.id} msg={m} />
              if (m.role === 'system-error')   return <SystemBubble key={m.id} msg={m} variant="error" />
              if (m.role === 'system-warning') return <SystemBubble key={m.id} msg={m} variant="warning" />
              return <AiBubble key={m.id} msg={m} />
            })}
            {messages.length === 1 && !context.workout && <EmptyState />}
            {loading && <TypingDots />}
            <div ref={endRef} />
          </div>

          {/* Suggested prompts */}
          <div style={{
            padding: isMobile ? '6px 14px 8px' : '8px 24px 10px',
            display: 'flex', gap: '6px', overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {SUGGESTED.map(s => (
              <button
                key={s.label}
                className="prompt-chip"
                onClick={() => !loading && setInput(s.text)}
                disabled={loading}
                style={{
                  flexShrink: 0, padding: '5px 12px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '100px', color: '#4b5563',
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: isMobile ? '8px 14px 16px' : '10px 24px 20px',
            borderTop: '1px solid #1a1c24',
            display: 'flex', gap: '8px', alignItems: 'flex-end',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isMobile ? 'Ask your coach...' : 'Ask your coach anything... (Enter to send, Shift+Enter for new line)'}
              rows={2}
              style={{
                flex: 1, padding: '12px 14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', color: '#e5e7eb',
                fontSize: '14px', resize: 'none',
                fontFamily: 'inherit', lineHeight: 1.55,
                transition: 'border-color 0.15s',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                padding: isMobile ? '12px 14px' : '12px 20px',
                fontWeight: 700, fontSize: '14px',
                borderRadius: '12px', border: 'none', flexShrink: 0,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                backgroundColor: input.trim() && !loading ? '#00d4ff' : 'rgba(255,255,255,0.05)',
                color: input.trim() && !loading ? '#000' : '#2d3748',
                boxShadow: input.trim() && !loading ? '0 0 20px rgba(0,212,255,0.18)' : 'none',
              }}
            >
              {isMobile ? '→' : 'Send →'}
            </button>
          </div>
        </div>

        {/* Desktop context sidebar */}
        {!isMobile && (
          <div style={{
            width: '272px', flexShrink: 0,
            overflowY: 'auto', padding: '20px 16px',
            borderLeft: '1px solid #1a1c24',
            backgroundColor: '#0b0c0f',
          }}>
            <p style={{ margin: '0 0 18px', fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.9px' }}>
              Context
            </p>
            <ContextPanelContent context={context} />
          </div>
        )}
      </div>
    </>
  )
}
