import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1F] antialiased">
      {/* ── Persistent Left Sidebar ── */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        {/* Top bar */}
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Page content wrapper */}
        <main className="mx-auto w-full max-w-7xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
