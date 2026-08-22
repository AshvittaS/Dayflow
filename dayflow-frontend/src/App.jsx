import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import AppLayout from './components/shell/AppLayout.jsx'
import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import EmployeesPage from './pages/employees/EmployeesPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import AttendancePage from './pages/attendance/AttendancePage.jsx'
import TimeOffPage from './pages/timeoff/TimeOffPage.jsx'

/** Redirects to /signin if not logged in */
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/signin" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/employees"   element={<EmployeesPage />} />
        <Route path="/profile"     element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/attendance"  element={<AttendancePage />} />
        <Route path="/timeoff"     element={<TimeOffPage />} />
      </Route>

      <Route path="/"  element={<Navigate to="/employees" replace />} />
      <Route path="*"  element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}
