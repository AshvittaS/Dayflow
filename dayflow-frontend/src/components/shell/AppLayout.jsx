import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1F] antialiased flex flex-col">
      {/* ── Collapsed 72px Icon Rail on Desktop ── */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* ── Main Canvas (Offset by 72px on Desktop) ── */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-[72px]">
        {/* Top Command Header */}
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Dynamic Page Content Wrapper */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
