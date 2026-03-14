import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Promos() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '', maxUses: '100', expiresAt: '' })
  const [saving, setSaving] = useState(false)

  const fetchPromos = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/promos')
      setPromos(res.data)
    } catch (err) { toast.error('Failed to load promos') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPromos() }, [])

  const handleSave = async () => {
    if (!form.code || !form.discount || !form.expiresAt) { toast.error('All fields required'); return }
    setSaving(true)
    try {
      await api.post('/admin/promos', form)
      toast.success('Promo code created!')
      setShowModal(false)
      fetchPromos()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete promo code "${code}"?`)) return
    try {
      await api.delete(`/admin/promos/${id}`)
      toast.success('Promo deleted')
      fetchPromos()
    } catch (err) { toast.error('Failed') }
  }

  const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Promo Codes</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{promos.length} active codes</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.9rem', padding: '0.7rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
          + Create Promo
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : promos.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
            <p style={{ color: 'var(--muted)' }}>No promo codes yet</p>
          </div>
        ) : promos.map((promo, i) => {
          const isExpired = new Date(promo.expiresAt) < new Date()
          const usagePercent = (promo.usedCount / promo.maxUses) * 100
          return (
            <div key={promo._id} style={{ padding: '1.25rem 1.5rem', borderBottom: i < promos.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', opacity: isExpired ? 0.5 : 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>{promo.code}</span>
                  <span style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>{promo.discount}% OFF</span>
                  {isExpired && <span style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>EXPIRED</span>}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                  Expires {new Date(promo.expiresAt).toLocaleDateString()} · {promo.usedCount}/{promo.maxUses} uses
                </p>
                <div style={{ marginTop: '0.5rem', background: 'var(--surface2)', borderRadius: '4px', height: '4px', width: '200px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: usagePercent > 80 ? 'var(--red)' : 'var(--teal)', width: `${usagePercent}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
              </div>
              <button onClick={() => handleDelete(promo._id, promo.code)} style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.82rem' }}>
                🗑️ Delete
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--text)' }}>Create Promo Code</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Code *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Discount % *</label>
                  <input type="number" min="1" max="100" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="20" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Max Uses</label>
                  <input type="number" min="1" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="100" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Expiry Date *</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.8rem', borderRadius: '10px', border: 'none', background: saving ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 700 }}>
                {saving ? 'Creating...' : '🎟️ Create Promo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
