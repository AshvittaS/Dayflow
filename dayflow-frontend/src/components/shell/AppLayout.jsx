import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1F] antialiased flex flex-col">
      {/* ── Top Horizontal Navigation Bar ── */}
      <Navbar />

      {/* ── Main Canvas Content Area ── */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
