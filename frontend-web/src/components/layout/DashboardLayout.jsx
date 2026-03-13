import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { logout } from '../../store/authSlice'

const navItems = [
  { path: '/',          icon: '🏠', label: 'Dashboard' },
  { path: '/bookings',  icon: '📋', label: 'Bookings'  },
  { path: '/services',  icon: '🔧', label: 'Services'  },
  { path: '/hours',     icon: '🕐', label: 'Hours'     },
  { path: '/garage',    icon: '🏪', label: 'Garage'    },
  { path: '/analytics', icon: '📊', label: 'Analytics' },
]

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '260px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        transition: 'width 0.3s ease', zIndex: 50, overflow: 'hidden',
        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          background: 'var(--surface2)',
        }}>
          {!collapsed && (
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.4rem', fontWeight: 700,
              color: 'var(--text)', whiteSpace: 'nowrap'
            }}>
              Auto<span style={{ color: 'var(--accent)' }}>Care</span>
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.4rem 0.6rem',
            cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem',
            flexShrink: 0
          }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ path, icon, label }) => (
            <NavLink key={path} to={path} end={path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : '0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '0.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500, fontSize: '0.9rem',
                background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              })}>
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '0.75rem', padding: '0.75rem',
              background: 'var(--surface2)', borderRadius: '10px',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--gold-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', color: '#0A2647', flexShrink: 0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </div>
                <div style={{ color: 'var(--accent2)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', background: 'transparent',
            border: '1px solid var(--border)', color: 'var(--muted)',
            borderRadius: '10px', padding: '0.6rem',
            cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500,
            fontSize: '0.85rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
            🚪 {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: collapsed ? '70px' : '260px',
        flex: 1, padding: '2rem',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  )
}