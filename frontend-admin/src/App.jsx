import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/auth/Login'
import AdminLayout from './components/layout/AdminLayout'
import Overview from './pages/dashboard/Overview'
import Users from './pages/users/Users'
import Garages from './pages/garages/Garages'
import GarageForm from './pages/garages/GarageForm'
import Bookings from './pages/bookings/Bookings'
import Promos from './pages/promos/Promos'

const ProtectedRoute = ({ children }) => {
  const { user, token } = useSelector(state => state.auth)
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="garages" element={<Garages />} />
          <Route path="garages/new" element={<GarageForm />} />
          <Route path="garages/:id/edit" element={<GarageForm />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="promos" element={<Promos />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
