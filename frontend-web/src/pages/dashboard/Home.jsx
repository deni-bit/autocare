import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '1.5rem',
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</p>
        <p style={{ color: 'var(--text)', fontSize: '2rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
        {sub && <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
)

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  in_progress: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#EF4444',
}

export default function Home() {
  const { user } = useSelector(state => state.auth)
  const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0, revenue: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/bookings', { params: { limit: 5 } })
        const bookings = res.data.bookings

        const today = new Date().toDateString()
        const todayBookings = bookings.filter(b => new Date(b.scheduledAt).toDateString() === today)
        const pending = bookings.filter(b => b.status === 'pending').length
        const completed = bookings.filter(b => b.status === 'completed').length
        const revenue = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.amountPaid || b.service?.price || 0), 0)

        setStats({ today: todayBookings.length, pending, completed, revenue })
        setRecentBookings(bookings)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="📅" label="Today's Bookings" value={stats.today} color="var(--blue)" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="var(--gold)" sub="Awaiting confirmation" />
        <StatCard icon="✅" label="Completed" value={stats.completed} color="var(--green)" />
        <StatCard icon="💰" label="Revenue" value={`$${stats.revenue.toFixed(0)}`} color="var(--purple)" sub="From completed jobs" />
      </div>

      {/* Recent Bookings */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Recent Bookings</h2>
          <Link to="/bookings" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : recentBookings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p>No bookings yet</p>
          </div>
        ) : (
          <div>
            {recentBookings.map(booking => (
              <Link key={booking._id} to={`/bookings/${booking._id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'var(--surface2)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>🚗</div>
                    <div>
                      <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {booking.car_owner?.name || 'Customer'}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                        {booking.service?.name} · {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      background: `${statusColors[booking.status]}20`,
                      color: statusColors[booking.status],
                      border: `1px solid ${statusColors[booking.status]}40`,
                      padding: '0.25rem 0.75rem', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>{booking.status}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>
                      ${booking.service?.price || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
