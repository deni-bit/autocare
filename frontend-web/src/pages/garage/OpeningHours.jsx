import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const defaultHours = DAYS.map(day => ({
  day, open: '08:00', close: '18:00',
  isClosed: day === 'Sunday'
}))

export default function OpeningHours() {
  const [garageId, setGarageId] = useState(null)
  const [hours, setHours] = useState(defaultHours)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const me = await api.get('/auth/me')
        const gid = me.data.garage?._id || me.data.garage
        if (!gid) { setLoading(false); return }
        setGarageId(gid)
        const res = await api.get(`/garages/${gid}`)
        if (res.data.openingHours?.length > 0) {
          // Merge with defaults to ensure all days present
          const merged = DAYS.map(day => {
            const existing = res.data.openingHours.find(h => h.day === day)
            return existing || { day, open: '08:00', close: '18:00', isClosed: false }
          })
          setHours(merged)
        }
      } catch (err) {
        toast.error('Failed to load hours')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const updateDay = (index, field, value) => {
    const updated = [...hours]
    updated[index] = { ...updated[index], [field]: value }
    setHours(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/garages/${garageId}/hours`, { openingHours: hours })
      toast.success('Opening hours saved!')
    } catch (err) {
      toast.error('Failed to save hours')
    } finally {
      setSaving(false)
    }
  }

  const dayColors = {
    Monday: '#3B82F6', Tuesday: '#8B5CF6', Wednesday: '#F59E0B',
    Thursday: '#10B981', Friday: '#F97316', Saturday: '#EC4899', Sunday: '#EF4444'
  }

  if (loading) return <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Loading...</div>

  if (!garageId) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕐</div>
      <p style={{ color: 'var(--muted)' }}>No garage assigned. Contact admin.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Opening Hours</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Set when your garage is open for bookings</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          background: saving ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700,
          fontSize: '0.9rem', padding: '0.7rem 1.4rem',
          borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: saving ? 'none' : '0 4px 15px rgba(245,158,11,0.3)'
        }}>
          {saving ? 'Saving...' : '💾 Save Hours'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {hours.map((h, i) => (
          <div key={h.day} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '1rem 1.25rem',
            borderLeft: `4px solid ${h.isClosed ? 'var(--border)' : dayColors[h.day]}`,
            opacity: h.isClosed ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

              {/* Day toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '140px' }}>
                <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', flexShrink: 0 }}>
                  <input type="checkbox" checked={!h.isClosed}
                    onChange={e => updateDay(i, 'isClosed', !e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', inset: 0,
                    borderRadius: '24px', transition: '0.3s',
                    background: h.isClosed ? 'var(--surface2)' : dayColors[h.day],
                  }}>
                    <span style={{
                      position: 'absolute', left: h.isClosed ? '3px' : '21px',
                      top: '3px', width: '18px', height: '18px',
                      borderRadius: '50%', background: 'white', transition: '0.3s'
                    }} />
                  </span>
                </label>
                <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  {h.day}
                </span>
              </div>

              {h.isClosed ? (
                <span style={{
                  color: 'var(--muted)', fontSize: '0.85rem',
                  fontFamily: 'JetBrains Mono, monospace', fontStyle: 'italic'
                }}>Closed</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Open</span>
                    <input type="time" value={h.open}
                      onChange={e => updateDay(i, 'open', e.target.value)}
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text)', borderRadius: '8px', padding: '0.4rem 0.6rem',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', outline: 'none'
                      }} />
                  </div>
                  <span style={{ color: 'var(--muted)' }}>→</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Close</span>
                    <input type="time" value={h.close}
                      onChange={e => updateDay(i, 'close', e.target.value)}
                      style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text)', borderRadius: '8px', padding: '0.4rem 0.6rem',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', outline: 'none'
                      }} />
                  </div>
                  <span style={{
                    color: dayColors[h.day], fontSize: '0.8rem',
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                    background: `${dayColors[h.day]}15`,
                    padding: '0.2rem 0.6rem', borderRadius: '6px'
                  }}>
                    {(() => {
                      const [oh, om] = h.open.split(':').map(Number)
                      const [ch, cm] = h.close.split(':').map(Number)
                      const diff = (ch * 60 + cm) - (oh * 60 + om)
                      return `${Math.floor(diff/60)}h ${diff%60 > 0 ? diff%60+'m' : ''}`
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '1.5rem', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem'
      }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>Summary</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hours.map(h => (
            <span key={h.day} style={{
              padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem',
              fontFamily: 'JetBrains Mono, monospace',
              background: h.isClosed ? 'var(--surface2)' : `${dayColors[h.day]}20`,
              color: h.isClosed ? 'var(--muted)' : dayColors[h.day],
              border: `1px solid ${h.isClosed ? 'var(--border)' : `${dayColors[h.day]}40`}`
            }}>
              {h.day.slice(0, 3)} {h.isClosed ? '✕' : `${h.open}–${h.close}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
