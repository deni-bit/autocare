import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const emptyService = { name: '', description: '', price: '', duration: '', photo: '' }

export default function Services() {
  const { user } = useSelector(state => state.auth)
  const [services, setServices] = useState([])
  const [garageId, setGarageId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyService)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchGarageAndServices()
  }, [])

  const fetchGarageAndServices = async () => {
    try {
      const me = await api.get('/auth/me')
      const gid = me.data.garage?._id || me.data.garage
      if (!gid) { setLoading(false); return }
      setGarageId(gid)
      const res = await api.get(`/garages/${gid}`)
      setServices(res.data.services || [])
    } catch (err) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm(emptyService)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      photo: service.photo || '',
    })
    setEditingId(service._id)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) {
      toast.error('Name, price and duration are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/garages/${garageId}/services/${editingId}`, form)
        toast.success('Service updated!')
      } else {
        await api.post(`/garages/${garageId}/services`, form)
        toast.success('Service added!')
      }
      await fetchGarageAndServices()
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm('Delete this service?')) return
    try {
      await api.delete(`/garages/${garageId}/services/${serviceId}`)
      toast.success('Service deleted')
      await fetchGarageAndServices()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)',
    border: '1px solid var(--border)', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
    padding: '0.75rem 1rem', borderRadius: '10px',
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', color: 'var(--muted)',
    fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.4rem'
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: '3rem', textAlign: 'center' }}>Loading...</div>

  if (!garageId) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
      <p style={{ color: 'var(--muted)' }}>No garage assigned yet. Contact admin to assign you to a garage.</p>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Services</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{services.length} services in your menu</p>
        </div>
        <button onClick={openAdd} style={{
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700,
          fontSize: '0.9rem', padding: '0.7rem 1.4rem',
          borderRadius: '10px', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
        }}>+ Add Service</button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '4rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔧</div>
          <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '0.5rem' }}>No services yet</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add your first service to start receiving bookings</p>
          <button onClick={openAdd} style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700,
            padding: '0.7rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer'
          }}>+ Add First Service</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {services.map(service => (
            <div key={service._id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

              {/* Color banner */}
              <div style={{
                height: '6px',
                background: service.isActive
                  ? 'linear-gradient(90deg, #F59E0B, #0D9488)'
                  : 'var(--border)'
              }} />

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem' }}>{service.name}</h3>
                  <span style={{
                    background: service.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(156,163,175,0.15)',
                    color: service.isActive ? '#10B981' : 'var(--muted)',
                    fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                    borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase'
                  }}>{service.isActive ? 'Active' : 'Inactive'}</span>
                </div>

                {service.description && (
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {service.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.5rem 0.85rem', flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem' }}>
                      ${service.price}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>Price</div>
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.5rem 0.85rem', flex: 1, textAlign: 'center' }}>
                    <div style={{ color: 'var(--accent2)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem' }}>
                      {service.duration}m
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>Duration</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(service)} style={{
                    flex: 1, padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                    fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.82rem',
                    transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(service._id)} style={{
                    flex: 1, padding: '0.55rem', borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)', color: 'var(--red)',
                    cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.82rem'
                  }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--text)', fontWeight: 700 }}>
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Service Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Full Car Wash" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Price (USD) *</label>
                  <input type="number" min="0" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="25" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duration (mins) *</label>
                  <input type="number" min="15" step="15" value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="60" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Photo URL (optional)</label>
                <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })}
                  placeholder="https://..." style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '0.8rem', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '0.8rem', borderRadius: '10px', border: 'none',
                background: saving ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#0A2647', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.95rem'
              }}>
                {saving ? 'Saving...' : editingId ? '✅ Update Service' : '➕ Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
