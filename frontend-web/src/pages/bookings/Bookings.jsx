import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchBookings, updateBookingStatus } from '../../store/bookingSlice'
import toast from 'react-hot-toast'

const statusColors = {
  pending: '#F59E0B', confirmed: '#3B82F6',
  in_progress: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444',
}

const tabs = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function Bookings() {
  const dispatch = useDispatch()
  const { list: bookings, loading, total } = useSelector(state => state.bookings)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchBookings({ status: activeTab === 'all' ? undefined : activeTab, page }))
  }, [activeTab, page])

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateBookingStatus({ id, status })).unwrap()
      toast.success(`Booking ${status}!`)
    } catch (err) {
      toast.error(err || 'Failed to update status')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Bookings</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{total} total bookings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
            style={{
              padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
              fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.85rem',
              border: activeTab === tab ? '1px solid var(--gold)' : '1px solid var(--border)',
              background: activeTab === tab ? 'rgba(245,158,11,0.1)' : 'var(--surface)',
              color: activeTab === tab ? 'var(--gold)' : 'var(--muted)',
              textTransform: 'capitalize',
            }}>
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: 'var(--muted)' }}>No bookings found</p>
          </div>
        ) : bookings.map((booking, i) => (
          <div key={booking._id} style={{
            padding: '1.25rem 1.5rem',
            borderBottom: i < bookings.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1rem'
          }}>
            {/* Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'var(--surface2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0
              }}>🚗</div>
              <div>
                <p style={{ color: 'var(--text)', fontWeight: 600 }}>{booking.car_owner?.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                  {booking.service?.name} · {booking.vehicle?.make} {booking.vehicle?.model}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  🕐 {new Date(booking.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{
                background: `${statusColors[booking.status]}20`,
                color: statusColors[booking.status],
                border: `1px solid ${statusColors[booking.status]}40`,
                padding: '0.3rem 0.8rem', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 600,
                textTransform: 'capitalize', fontFamily: 'JetBrains Mono, monospace'
              }}>{booking.status.replace('_', ' ')}</span>

              <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                ${booking.service?.price}
              </span>

              {/* Action buttons */}
              {booking.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--blue)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✅ Confirm
                  </button>
                  <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                    style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.15)', color: 'var(--red)', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✕ Decline
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <button onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                  style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--purple)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                  🔧 Start
                </button>
              )}
              {booking.status === 'in_progress' && (
                <button onClick={() => handleStatusUpdate(booking._id, 'completed')}
                  style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--green)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                  🎉 Complete
                </button>
              )}

              <Link to={`/bookings/${booking._id}`} style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)',
                color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500
              }}>View →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
