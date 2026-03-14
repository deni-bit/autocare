import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginAdmin, clearError } from '../../store/authSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (token && user?.role === 'admin') navigate('/')
    return () => dispatch(clearError())
  }, [token, user])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #061a32 0%, #0A2647 60%, #0D9488 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #0D9488, #14B8A6)', fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(13,148,136,0.4)' }}>⚙️</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
            Auto<span style={{ color: 'var(--accent)' }}>Care</span>
          </div>
          <div style={{ color: 'var(--teal-light)', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.3rem' }}>Admin Panel</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#fff', marginBottom: '0.4rem' }}>Admin Login</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Restricted access — admins only</p>

          {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>{error}</div>}

          <form onSubmit={e => { e.preventDefault(); dispatch(loginAdmin(form)) }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@autocare.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'DM Sans', fontSize: '0.95rem', padding: '0.85rem 1rem', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password} required onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'DM Sans', fontSize: '0.95rem', padding: '0.85rem 3rem 0.85rem 1rem', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? 'rgba(13,148,136,0.5)' : 'linear-gradient(135deg, #0D9488, #14B8A6)', color: '#fff', fontFamily: 'DM Sans', fontWeight: 700, fontSize: '1rem', padding: '0.9rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}>
              {loading ? 'Signing in...' : 'Access Admin Panel →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
