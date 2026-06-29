import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Home',      path: '/'          },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Generate',  path: '/generate'  },
  { label: 'Coach',     path: '/coach'     },
  { label: 'Progress',  path: '/progress'  },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid #292524',
      backgroundColor: 'rgba(6,8,16,0.97)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mini barbell icon */}
          <svg viewBox="0 0 36 24" fill="none" style={{ width: 36, height: 24 }}>
            <rect x="0" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
            <rect x="6" y="8" width="4" height="8" rx="1" fill="#78716c"/>
            <rect x="10" y="10" width="16" height="4" rx="2" fill="#57534e"/>
            <rect x="26" y="8" width="4" height="8" rx="1" fill="#78716c"/>
            <rect x="30" y="6" width="6" height="12" rx="2" fill="#dc2626"/>
          </svg>
          <span style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
            <span style={{ color: '#dc2626' }}>Iron</span>
            <span style={{ color: '#fafaf9' }}>Sync</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '7px 14px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? 'rgba(220,38,38,0.12)' : 'transparent',
                  color: isActive ? '#fca5a5' : '#78716c',
                  borderBottom: isActive ? '2px solid #dc2626' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
