import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/shell/AppLayout.jsx'
import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import EmployeesPage from './pages/employees/EmployeesPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import AttendancePage from './pages/attendance/AttendancePage.jsx'
import TimeOffPage from './pages/timeoff/TimeOffPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<AppLayout />}>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/timeoff" element={<TimeOffPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}
