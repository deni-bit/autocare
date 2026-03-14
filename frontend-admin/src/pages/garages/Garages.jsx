import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Garages() {
  const [garages, setGarages] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchGarages = async () => {
    setLoading(true)
    try {
      const res = await api.get('/garages', { params: { limit: 50 } })
      setGarages(res.data.garages)
      setTotal(res.data.total)
    } catch (err) { toast.error('Failed to load garages') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGarages() }, [])

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/garages/${id}`, { isActive: !current })
      toast.success(`Garage ${!current ? 'activated' : 'deactivated'}`)
      fetchGarages()
    } catch (err) { toast.error('Failed') }
  }

  const toggleFeatured = async (id, current) => {
    try {
      await api.put(`/garages/${id}`, { isFeatured: !current })
      toast.success(`Garage ${!current ? 'featured' : 'unfeatured'}`)
      fetchGarages()
    } catch (err) { toast.error('Failed') }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete garage "${name}"?`)) return
    try {
      await api.delete(`/garages/${id}`)
      toast.success('Garage deleted')
      fetchGarages()
    } catch (err) { toast.error('Failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Garages</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{total} registered garages</p>
        </div>
        <Link to="/garages/new" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.9rem', padding: '0.7rem 1.4rem', borderRadius: '10px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
          + Register Garage
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <div style={{ color: 'var(--muted)', padding: '3rem', gridColumn: '1/-1', textAlign: 'center' }}>Loading...</div>
        ) : garages.length === 0 ? (
          <div style={{ color: 'var(--muted)', padding: '4rem', gridColumn: '1/-1', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <p>No garages registered yet</p>
            <Link to="/garages/new" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>+ Register first garage</Link>
          </div>
        ) : garages.map(garage => (
          <div key={garage._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', opacity: garage.isActive ? 1 : 0.6, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ height: '6px', background: garage.isActive ? 'linear-gradient(90deg, var(--gold), var(--teal))' : 'var(--border)' }} />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ color: 'var(--text)', fontWeight: 700 }}>{garage.name}</h3>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {garage.isFeatured && <span style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--gold)', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>⭐ FEATURED</span>}
                  {garage.isVerified && <span style={{ background: 'rgba(13,148,136,0.2)', color: 'var(--teal)', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>✓ VERIFIED</span>}
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>📍 {garage.location?.address || garage.location?.city || 'No address'}</p>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>⭐ {garage.rating || 0}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>📋 {garage.reviewCount || 0} reviews</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>🔧 {garage.services?.length || 0} services</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => toggleActive(garage._id, garage.isActive)} style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: garage.isActive ? 'var(--red)' : 'var(--green)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans', fontWeight: 500 }}>
                  {garage.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                </button>
                <button onClick={() => toggleFeatured(garage._id, garage.isFeatured)} style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans', fontWeight: 500 }}>
                  {garage.isFeatured ? '★ Unfeature' : '☆ Feature'}
                </button>
                <button onClick={() => handleDelete(garage._id, garage.name)} style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.78rem' }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
