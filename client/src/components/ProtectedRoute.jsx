import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SPIN = `@keyframes spin { to { transform: rotate(360deg) } }`

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <>
        <style>{SPIN}</style>
        <div style={{
          minHeight: '60vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid rgba(220,38,38,0.2)',
            borderTopColor: '#dc2626',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
