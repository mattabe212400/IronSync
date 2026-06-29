import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth()
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  // Already signed in — redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: `
        repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,255,255,0.012) 18px, rgba(255,255,255,0.012) 19px),
        #0c0b0b
      `,
    }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
          <svg viewBox="0 0 36 24" fill="none" style={{ width: 36, height: 24 }}>
            <rect x="0" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
            <rect x="6" y="8" width="4" height="8" rx="1" fill="#78716c"/>
            <rect x="10" y="10" width="16" height="4" rx="2" fill="#57534e"/>
            <rect x="26" y="8" width="4" height="8" rx="1" fill="#78716c"/>
            <rect x="30" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
          </svg>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
            <span style={{ color: '#dc2626' }}>Iron</span>
            <span style={{ color: '#fafaf9' }}>Sync</span>
          </span>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#16181e',
          border: '1px solid #22242e',
          borderRadius: '20px',
          padding: '40px 36px',
        }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '26px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-0.5px',
            color: '#fafaf9',
          }}>
            Welcome Back
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
            Sign in to access your training program,<br />coach, and progress tracker.
          </p>

          {/* Google sign-in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%', padding: '14px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              backgroundColor: loading ? 'rgba(255,255,255,0.04)' : '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: 700,
              color: loading ? '#4b5563' : '#111827',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            {!loading && <GoogleIcon />}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {error && (
            <p style={{
              margin: '16px 0 0', fontSize: '13px', color: '#f87171',
              backgroundColor: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: '8px', padding: '10px 14px',
            }}>
              {error}
            </p>
          )}

          <p style={{ margin: '24px 0 0', fontSize: '12px', color: '#374151', lineHeight: 1.7 }}>
            Free to use. No credit card required.<br />
            Your data is stored securely in Firebase.
          </p>
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '12px', color: '#374151' }}>
          IRON NEVER LIES.
        </p>
      </div>
    </div>
  )
}
