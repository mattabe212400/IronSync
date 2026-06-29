import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Home',      path: '/'          },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Generate',  path: '/generate'  },
  { label: 'Coach',     path: '/coach'     },
  { label: 'Progress',  path: '/progress'  },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function Navbar() {
  const location  = useLocation()
  const isMobile  = useIsMobile()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  // Close menu on route change
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid #292524',
        backgroundColor: 'rgba(12,11,11,0.97)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg viewBox="0 0 36 24" fill="none" style={{ width: 32, height: 22 }}>
              <rect x="0" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
              <rect x="6" y="8" width="4" height="8" rx="1" fill="#78716c"/>
              <rect x="10" y="10" width="16" height="4" rx="2" fill="#57534e"/>
              <rect x="26" y="8" width="4" height="8" rx="1" fill="#78716c"/>
              <rect x="30" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
              <span style={{ color: '#dc2626' }}>Iron</span>
              <span style={{ color: '#fafaf9' }}>Sync</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: '2px' }}>
              {navLinks.map(link => {
                const isActive = location.pathname === link.path
                return (
                  <Link key={link.path} to={link.path} style={{
                    padding: '7px 14px', borderRadius: '4px',
                    fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    textDecoration: 'none', transition: 'all 0.15s',
                    backgroundColor: isActive ? 'rgba(220,38,38,0.12)' : 'transparent',
                    color: isActive ? '#fca5a5' : '#78716c',
                    borderBottom: isActive ? '2px solid #dc2626' : '2px solid transparent',
                  }}>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Desktop: user avatar + sign out */}
          {!isMobile && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px', paddingLeft: '16px', borderLeft: '1px solid #292524' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #292524' }} />
              ) : (
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <button
                onClick={logout}
                style={{ background: 'none', border: '1px solid #292524', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', color: '#78716c', fontSize: '12px', fontWeight: 600 }}
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                background: 'none', border: '1px solid #292524',
                borderRadius: '6px', padding: '6px 10px',
                cursor: 'pointer', color: '#78716c', fontSize: '18px',
                lineHeight: 1,
              }}
            >
              {open ? '✕' : '☰'}
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        {isMobile && open && (
          <div style={{
            borderTop: '1px solid #292524',
            backgroundColor: '#0c0b0b',
            padding: '8px 16px 16px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path
              return (
                <Link key={link.path} to={link.path} style={{
                  padding: '12px 16px', borderRadius: '6px',
                  fontSize: '14px', fontWeight: 700,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(220,38,38,0.12)' : 'transparent',
                  color: isActive ? '#fca5a5' : '#78716c',
                  borderLeft: isActive ? '3px solid #dc2626' : '3px solid transparent',
                }}>
                  {link.label}
                </Link>
              )
            })}

            {/* Mobile sign out */}
            {user && (
              <>
                <div style={{ height: '1px', backgroundColor: '#292524', margin: '4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px' }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {user.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span style={{ fontSize: '13px', color: '#6b7280', flex: 1 }}>{user.displayName || user.email}</span>
                  <button onClick={logout} style={{ background: 'none', border: '1px solid #292524', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', color: '#78716c', fontSize: '12px', fontWeight: 600 }}>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
