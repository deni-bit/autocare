import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' })

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]) }
  })
  return position ? <Marker position={position} /> : null
}

export default function GarageForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: 'Dar es Salaam' })
  const [position, setPosition] = useState([-6.8161, 39.2795]) // Dar es Salaam default
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/garages/${id}`).then(res => {
        const g = res.data
        setForm({ name: g.name, description: g.description || '', phone: g.phone || '', email: g.email || '', address: g.location?.address || '', city: g.location?.city || '' })
        if (g.location?.coordinates) setPosition([g.location.coordinates[1], g.location.coordinates[0]])
      })
    }
  }, [id])

  const handleSave = async () => {
    if (!form.name) { toast.error('Garage name is required'); return }
    setSaving(true)
    try {
      const payload = { ...form, coordinates: { lat: position[0], lng: position[1] }, address: form.address, city: form.city }
      if (isEdit) {
        await api.put(`/garages/${id}`, payload)
        toast.success('Garage updated!')
      } else {
        await api.post('/garages', payload)
        toast.success('Garage registered!')
      }
      navigate('/garages')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.4rem' }

  return (
    <div style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate('/garages')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back to Garages</button>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '2rem' }}>
        {isEdit ? 'Edit Garage' : 'Register New Garage'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Garage Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Denis Auto Care" style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="About this garage..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+255700000000" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="garage@email.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Address</label>
          <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Dar es Salaam" style={inputStyle} />
        </div>
      </div>

      {/* Leaflet Map */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ ...labelStyle, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          📍 Click on the map to set garage location
        </label>
        <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', height: '350px' }}>
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors' />
            <LocationPicker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <p style={{ color: 'var(--accent2)', fontSize: '0.82rem', marginTop: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
          📌 Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => navigate('/garages')} style={{ flex: 1, padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.85rem', borderRadius: '10px', border: 'none', background: saving ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.95rem' }}>
          {saving ? 'Saving...' : isEdit ? '✅ Update Garage' : '🏪 Register Garage'}
        </button>
      </div>
    </div>
  )
}
