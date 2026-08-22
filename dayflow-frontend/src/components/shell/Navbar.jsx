import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AvatarMenu from './AvatarMenu.jsx'

const links = [
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/timeoff', label: 'Time Off' }
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      {/* Left: Brand logo & Nav tabs */}
      <div className="flex items-center gap-8">
        <button
          aria-label="Go to Employees dashboard"
          onClick={() => navigate('/employees')}
          className="group flex items-center gap-2.5 outline-none"
        >
          {/* Custom geometric logo mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9] text-white shadow-[0_2px_6px_rgba(91,79,233,0.35)] transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight text-[#1A1A1F]">
              Day<span className="text-[#5B4FE9]">flow</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-[#6B6B76] sm:inline-block">
              HRMS
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#5B4FE9]/10 text-[#5B4FE9]'
                    : 'text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
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
