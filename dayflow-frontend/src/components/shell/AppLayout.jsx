import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-base-bg">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
