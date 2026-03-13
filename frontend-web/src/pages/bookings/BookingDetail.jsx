import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const statusColors = { pending:'#F59E0B', confirmed:'#3B82F6', in_progress:'#8B5CF6', completed:'#10B981', cancelled:'#EF4444' }

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => setBooking(r.data)).finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status })
      setBooking(res.data)
      toast.success(`Status updated to ${status}`)
    } catch (err) { toast.error('Failed to update') }
  }

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      await api.post(`/bookings/${id}/message`, { text: message })
      const res = await api.get(`/bookings/${id}`)
      setBooking(res.data)
      setMessage('')
    } catch (err) { toast.error('Failed to send message') }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: '3rem', textAlign:'center' }}>Loading...</div>
  if (!booking) return <div style={{ color: 'var(--red)', padding: '3rem', textAlign:'center' }}>Booking not found</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate('/bookings')} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', marginBottom:'1.5rem', fontSize:'0.9rem' }}>← Back to Bookings</button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <h1 style={{ fontFamily:'Playfair Display, serif', fontSize:'1.8rem', color:'var(--text)' }}>Booking Detail</h1>
        <span style={{ background:`${statusColors[booking.status]}20`, color:statusColors[booking.status], border:`1px solid ${statusColors[booking.status]}40`, padding:'0.4rem 1rem', borderRadius:'20px', fontWeight:600, fontSize:'0.85rem', fontFamily:'JetBrains Mono, monospace' }}>
          {booking.status.replace('_',' ')}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          ['👤 Customer', booking.car_owner?.name],
          ['🔧 Service', booking.service?.name],
          ['🚗 Vehicle', `${booking.vehicle?.make} ${booking.vehicle?.model} (${booking.vehicle?.plate})`],
          ['💰 Price', `$${booking.service?.price}`],
          ['🕐 Scheduled', new Date(booking.scheduledAt).toLocaleString()],
          ['📝 Notes', booking.customerNotes || 'None'],
        ].map(([label, value]) => (
          <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'1rem' }}>
            <p style={{ color:'var(--muted)', fontSize:'0.8rem', marginBottom:'0.35rem' }}>{label}</p>
            <p style={{ color:'var(--text)', fontWeight:600, fontSize:'0.9rem' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {booking.status === 'pending' && <button onClick={() => updateStatus('confirmed')} style={{ padding:'0.6rem 1.2rem', borderRadius:'10px', border:'none', background:'var(--blue)', color:'#fff', fontWeight:600, cursor:'pointer' }}>✅ Confirm</button>}
        {booking.status === 'confirmed' && <button onClick={() => updateStatus('in_progress')} style={{ padding:'0.6rem 1.2rem', borderRadius:'10px', border:'none', background:'var(--purple)', color:'#fff', fontWeight:600, cursor:'pointer' }}>🔧 Start Job</button>}
        {booking.status === 'in_progress' && <button onClick={() => updateStatus('completed')} style={{ padding:'0.6rem 1.2rem', borderRadius:'10px', border:'none', background:'var(--green)', color:'#fff', fontWeight:600, cursor:'pointer' }}>🎉 Mark Complete</button>}
        {!['completed','cancelled'].includes(booking.status) && <button onClick={() => updateStatus('cancelled')} style={{ padding:'0.6rem 1.2rem', borderRadius:'10px', border:'1px solid var(--red)', background:'transparent', color:'var(--red)', fontWeight:600, cursor:'pointer' }}>✕ Cancel</button>}
      </div>

      {/* Chat */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ color:'var(--text)', fontWeight:700 }}>💬 Chat with Customer</h3>
        </div>
        <div style={{ padding:'1rem', minHeight:'150px', maxHeight:'250px', overflowY:'auto' }}>
          {booking.messages?.length === 0 && <p style={{ color:'var(--muted)', textAlign:'center', padding:'2rem' }}>No messages yet</p>}
          {booking.messages?.map((msg, i) => (
            <div key={i} style={{ marginBottom:'0.75rem' }}>
              <span style={{ color:'var(--gold)', fontSize:'0.8rem', fontWeight:600 }}>{msg.sender?.name}: </span>
              <span style={{ color:'var(--text)', fontSize:'0.9rem' }}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:'1rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem' }}>
          <input value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..." style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)', padding:'0.7rem 1rem', borderRadius:'10px', outline:'none', fontFamily:'DM Sans' }} />
          <button onClick={sendMessage} style={{ padding:'0.7rem 1.2rem', borderRadius:'10px', border:'none', background:'linear-gradient(135deg, #F59E0B, #D97706)', color:'#0A0F1E', fontWeight:700, cursor:'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  )
}
