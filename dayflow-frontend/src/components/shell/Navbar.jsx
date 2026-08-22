import { useState, useEffect } from 'react'
import { Bell, Menu, Search, X, Command } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AvatarMenu from './AvatarMenu.jsx'

export default function Navbar({ onOpenMobileMenu }) {
  const { user } = useAuth()
  const [userStatus, setUserStatus] = useState(user?.status || 'absent')
  const [searchQuery, setSearchQuery] = useState('')

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

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    window.dispatchEvent(new CustomEvent('dayflow:search', { detail: { query: val } }))
  }

  function handleClearSearch() {
    setSearchQuery('')
    window.dispatchEvent(new CustomEvent('dayflow:search', { detail: { query: '' } }))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EAEAEC] bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Drawer Trigger + Consolidated Command Search Bar */}
      <div className="flex flex-1 items-center gap-3 max-w-xl">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EAEAEC] text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Consolidated Command Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA4AD]" />
          <input
            id="command-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search employees by name, department, or login ID…"
            className="w-full rounded-2xl border border-[#EAEAEC]/90 bg-[#F8F9FA] py-2.5 pl-10 pr-10 text-xs font-medium text-[#1A1A1F] placeholder-[#9AA4AD] shadow-inner outline-none transition-all focus:border-[#5B4FE9] focus:bg-white focus:ring-4 focus:ring-[#5B4FE9]/10"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA4AD] hover:text-[#1A1A1F]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded-md border border-[#EAEAEC] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#9AA4AD]">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-3 pl-4">
        <button
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAEAEC] text-[#6B6B76] transition hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#5B4FE9] ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-[#EAEAEC]" />

        {user && <AvatarMenu user={user} overrideStatus={userStatus} />}
      </div>
    </header>
  )
}
