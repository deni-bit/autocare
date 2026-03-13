import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Auth
import Login from './pages/auth/Login'

// Dashboard
import DashboardLayout from './components/layout/DashboardLayout'
import Home from './pages/dashboard/Home'
import Bookings from './pages/bookings/Bookings'
import BookingDetail from './pages/bookings/BookingDetail'
import GarageProfile from './pages/garage/GarageProfile'
import Services from './pages/garage/Services'
import OpeningHours from './pages/garage/OpeningHours'
import Analytics from './pages/analytics/Analytics'

// Protected route
const ProtectedRoute = ({ children }) => {
  const { user, token } = useSelector(state => state.auth)
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== 'worker' && user.role !== 'admin') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="garage" element={<GarageProfile />} />
          <Route path="services" element={<Services />} />
          <Route path="hours" element={<OpeningHours />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
