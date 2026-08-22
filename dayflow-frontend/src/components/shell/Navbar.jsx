import { useState, useEffect } from 'react'
import { Bell, Menu, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AvatarMenu from './AvatarMenu.jsx'

export default function Navbar({ onOpenMobileMenu }) {
  const { user } = useAuth()
  const [userStatus, setUserStatus] = useState(user?.status || 'absent')

  useEffect(() => {
    if (user?.status) setUserStatus(user.status)
  }, [user?.status])

  useEffect(() => {
    function handleStatusUpdate(e) {
      if (e.detail?.status) {
        setUserStatus(e.detail.status)
      }
    }
    window.addEventListener('dayflow:status-change', handleStatusUpdate)
    return () => window.removeEventListener('dayflow:status-change', handleStatusUpdate)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EAEAEC] bg-white/95 px-6 backdrop-blur-md shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      {/* Left: Mobile hamburger trigger + Quick workspace search */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAEAEC] text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative hidden sm:block w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92929D]" />
          <input
            type="text"
            placeholder="Search employees, requests, or pages…"
            className="w-full rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] py-2 pl-9 pr-3 text-xs font-medium text-[#1A1A1F] placeholder-[#92929D] outline-none transition focus:border-[#5B4FE9] focus:bg-white focus:ring-2 focus:ring-[#5B4FE9]/10"
          />
        </div>
      </div>

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          aria-label="View notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#6B6B76] transition hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#5B4FE9] ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-[#EAEAEC]" />

        {user && <AvatarMenu user={user} overrideStatus={userStatus} />}
      </div>
    </header>
  )
}
