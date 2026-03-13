import { useEffect, useState } from 'react'
import api from '../../utils/api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#F59E0B', '#0D9488', '#3B82F6', '#8B5CF6', '#EF4444']

export default function Analytics() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings', { params: { limit: 100 } })
      .then(r => setBookings(r.data.bookings))
      .finally(() => setLoading(false))
  }, [])

  // Process daily revenue for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const dailyData = last7Days.map(date => {
    const dayBookings = bookings.filter(b => {
      const bDate = new Date(b.scheduledAt)
      return bDate.toDateString() === date.toDateString()
    })
    const revenue = dayBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.amountPaid || b.service?.price || 0), 0)
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: dayBookings.length,
      revenue,
    }
  })

  // Status breakdown for pie chart
  const statusCount = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }))

  // Service popularity
  const serviceCount = bookings.reduce((acc, b) => {
    const name = b.service?.name || 'Unknown'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const serviceData = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.amountPaid || b.service?.price || 0), 0)

  const completionRate = bookings.length > 0
    ? ((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100).toFixed(0)
    : 0

  const tooltipStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '10px', fontFamily: 'DM Sans', fontSize: '0.85rem', color: 'var(--text)'
  }

  if (loading) return <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Loading analytics...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>Analytics</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Performance overview for your garage</p>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '📋', color: '#3B82F6' },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: '💰', color: '#F59E0B' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: '✅', color: '#10B981' },
          { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: '❌', color: '#EF4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '1.25rem',
            borderTop: `3px solid ${stat.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{stat.label}</p>
                <p style={{ color: 'var(--text)', fontSize: '1.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '1.8rem' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

        {/* Revenue area chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings bar chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Bookings — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="bookings" fill="#0D9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* Status pie */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Booking Status</h3>
          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top services */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Top Services</h3>
          {serviceData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {serviceData.map((s, i) => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: COLORS[i], fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', fontWeight: 700 }}>{s.count}</span>
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: COLORS[i],
                      width: `${(s.count / serviceData[0].count) * 100}%`,
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
