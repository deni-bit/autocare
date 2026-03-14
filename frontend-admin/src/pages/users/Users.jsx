import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const roleColors = { car_owner: '#3B82F6', worker: '#F59E0B', admin: '#0D9488' }
const roles = ['all', 'car_owner', 'worker', 'admin']

export default function Users() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('all')
  const [search, setSearch] = useState('')
  const [showWorkerModal, setShowWorkerModal] = useState(false)
  const [garages, setGarages] = useState([])
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '', phone: '', garageId: '', workerRole: 'washer' })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchUsers() }, [role, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { role: role === 'all' ? undefined : role, search } })
      setUsers(res.data.users)
      setTotal(res.data.total)
    } catch (err) { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const fetchGarages = async () => {
    const res = await api.get('/garages')
    setGarages(res.data.garages)
  }

  const openWorkerModal = () => {
    fetchGarages()
    setWorkerForm({ name: '', email: '', password: '', phone: '', garageId: '', workerRole: 'washer' })
    setShowWorkerModal(true)
  }

  const handleCreateWorker = async () => {
    if (!workerForm.name || !workerForm.email || !workerForm.password) {
      toast.error('Name, email and password required')
      return
    }
    setCreating(true)
    try {
      await api.post('/admin/workers', workerForm)
      toast.success('Worker account created!')
      setShowWorkerModal(false)
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCreating(false) }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`)
      toast.success(res.data.message)
      fetchUsers()
    } catch (err) { toast.error('Failed') }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: '0.9rem', padding: '0.75rem 1rem', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Users</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{total} total users</p>
        </div>
        <button onClick={openWorkerModal} style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '0.9rem', padding: '0.7rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
          + Create Worker
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name or email..."
          style={{ ...inputStyle, maxWidth: '300px' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500, fontSize: '0.82rem', border: role === r ? '1px solid var(--accent)' : '1px solid var(--border)', background: role === r ? 'rgba(245,158,11,0.1)' : 'var(--surface)', color: role === r ? 'var(--accent)' : 'var(--muted)', textTransform: role === 'all' ? 'capitalize' : 'none' }}>
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>No users found</div>
        ) : users.map((u, i) => (
          <div key={u._id} style={{ padding: '1rem 1.5rem', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', opacity: u.isActive ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${roleColors[u.role]}, ${roleColors[u.role]}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{u.email}</p>
                {u.garage && <p style={{ color: 'var(--accent2)', fontSize: '0.75rem' }}>🏪 {u.garage.name}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ background: `${roleColors[u.role]}20`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}40`, padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase' }}>{u.role.replace('_', ' ')}</span>
              <span style={{ color: u.isActive ? 'var(--green)' : 'var(--red)', fontSize: '0.75rem', fontWeight: 600 }}>{u.isActive ? '● Active' : '● Inactive'}</span>
              {u.role !== 'admin' && (
                <>
                  <button onClick={() => handleToggle(u._id)} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
                    {u.isActive ? '🔒 Deactivate' : '🔓 Activate'}
                  </button>
                  <button onClick={() => handleDelete(u._id, u.name)} style={{ padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Worker Modal */}
      {showWorkerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setShowWorkerModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--text)' }}>Create Worker Account</h2>
              <button onClick={() => setShowWorkerModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Full Name', 'name', 'text', 'Denis Worker'], ['Email', 'email', 'email', 'worker@garage.com'], ['Password', 'password', 'password', 'Min. 8 characters'], ['Phone', 'phone', 'text', '+255700000000']].map(([label, field, type, placeholder]) => (
                <div key={field}>
                  <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>{label}</label>
                  <input type={type} value={workerForm[field]} onChange={e => setWorkerForm({ ...workerForm, [field]: e.target.value })} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Assign to Garage</label>
                <select value={workerForm.garageId} onChange={e => setWorkerForm({ ...workerForm, garageId: e.target.value })}
                  style={{ ...inputStyle }}>
                  <option value="">No garage yet</option>
                  {garages.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Worker Role</label>
                <select value={workerForm.workerRole} onChange={e => setWorkerForm({ ...workerForm, workerRole: e.target.value })} style={inputStyle}>
                  <option value="washer">Car Washer</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              <button onClick={() => setShowWorkerModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'DM Sans' }}>Cancel</button>
              <button onClick={handleCreateWorker} disabled={creating} style={{ flex: 2, padding: '0.8rem', borderRadius: '10px', border: 'none', background: creating ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A2647', cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', fontWeight: 700 }}>
                {creating ? 'Creating...' : '✅ Create Worker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
