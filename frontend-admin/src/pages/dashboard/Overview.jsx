import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '1.5rem',
      borderTop: `4px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.2)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ color: 'var(--text)', fontSize: '2.2rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{icon}</div>
      </div>
    </div>
  </Link>
)

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, garages: 0, bookings: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewRes, bookingsRes, usersRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/bookings', { params: { limit: 5 } }),
          api.get('/admin/users', { params: { limit: 5 } }),
        ])
        setStats(overviewRes.data)
        setRecentBookings(bookingsRes.data.bookings || [])
        setRecentUsers(usersRes.data.users || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', in_progress: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Platform Overview</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="👥" label="Total Users" value={stats.users} color="var(--blue)" to="/users" />
        <StatCard icon="🏪" label="Garages" value={stats.garages} color="var(--teal)" to="/garages" />
        <StatCard icon="📋" label="Bookings" value={stats.bookings} color="var(--gold)" to="/bookings" />
        <StatCard icon="💰" label="Revenue" value="$0" color="var(--green)" />
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Bookings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>Recent Bookings</h2>
            <Link to="/bookings" style={{ color: 'var(--accent)', fontSize: '0.82rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No bookings yet</div>
          ) : recentBookings.map((b, i) => (
            <div key={b._id} style={{ padding: '0.9rem 1.5rem', borderBottom: i < recentBookings.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem' }}>{b.car_owner?.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{b.service?.name} · {b.garage?.name}</p>
              </div>
              <span style={{ background: `${statusColors[b.status]}20`, color: statusColors[b.status], border: `1px solid ${statusColors[b.status]}40`, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'capitalize' }}>
                {b.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem' }}>Recent Users</h2>
            <Link to="/users" style={{ color: 'var(--accent)', fontSize: '0.82rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
          ) : recentUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No users yet</div>
          ) : recentUsers.map((u, i) => (
            <div key={u._id} style={{ padding: '0.9rem 1.5rem', borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#0A2647', flexShrink: 0 }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{u.email}</p>
                </div>
              </div>
              <span style={{ background: u.role === 'admin' ? 'rgba(13,148,136,0.15)' : u.role === 'worker' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: u.role === 'admin' ? 'var(--teal)' : u.role === 'worker' ? 'var(--gold)' : 'var(--blue)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase' }}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}