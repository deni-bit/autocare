import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', in_progress: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444' }
const tabs = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    setLoading(true)
    api.get('/admin/bookings', { params: { status: activeTab === 'all' ? undefined : activeTab } })
      .then(r => { setBookings(r.data.bookings); setTotal(r.data.total) })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>All Bookings</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{total} total bookings</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.82rem', border: activeTab === tab ? '1px solid var(--accent)' : '1px solid var(--border)', background: activeTab === tab ? 'rgba(245,158,11,0.1)' : 'var(--surface)', color: activeTab === tab ? 'var(--accent)' : 'var(--muted)', textTransform: 'capitalize' }}>
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        : bookings.length === 0 ? <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>No bookings found</div>
        : bookings.map((b, i) => (
          <div key={b._id} style={{ padding: '1rem 1.5rem', borderBottom: i < bookings.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🚗</div>
              <div>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.88rem' }}>{b.car_owner?.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{b.service?.name} · {b.garage?.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>🕐 {new Date(b.scheduledAt).toLocaleString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ background: `${statusColors[b.status]}20`, color: statusColors[b.status], border: `1px solid ${statusColors[b.status]}40`, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'capitalize' }}>{b.status.replace('_', ' ')}</span>
              <span style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.88rem' }}>${b.service?.price || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
