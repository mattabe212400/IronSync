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
      borderBottom: '1px solid #2a2d3a',
      backgroundColor: 'rgba(13, 14, 17, 0.92)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#00d4ff' }}>Iron</span>
            <span style={{ color: '#ffffff' }}>Sync</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  color: isActive ? '#00d4ff' : '#9ca3af',
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
