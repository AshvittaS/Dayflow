import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  Clock,
  CalendarOff,
  BarChart3,
  Settings,
  HelpCircle,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_officer'

  const navItems = [
    ...(isAdmin
      ? [
          {
            to: '/admin',
            label: 'Analytics',
            icon: BarChart3
          }
        ]
      : []),
    {
      to: '/employees',
      label: 'Employees',
      icon: Users
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: Clock
    },
    {
      to: '/timeoff',
      label: 'Time Off',
      icon: CalendarOff
    }
  ]

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#14141A] text-white">
      {/* ── Top brand section ── */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-[#23232C] px-6">
          <button
            onClick={() => {
              navigate('/employees')
              if (setMobileOpen) setMobileOpen(false)
            }}
            className="flex items-center gap-2.5 outline-none text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9] text-white shadow-[0_2px_6px_rgba(91,79,233,0.45)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                Day<span className="text-[#5B4FE9]">flow</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA4AD]">
                HRMS
              </span>
            </div>
          </button>

          {/* Close button for mobile drawer */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-[#9AA4AD] hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── Main Navigation List ── */}
        <div className="px-3 py-6">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#6B6B76]">
            Workspace Navigation
          </p>
          <nav className="space-y-1" aria-label="Main Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (setMobileOpen) setMobileOpen(false)
                  }}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#5B4FE9] text-white shadow-[0_2px_8px_rgba(91,79,233,0.35)]'
                        : 'text-[#9AA4AD] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Bottom pinned links & company block ── */}
      <div className="border-t border-[#23232C] p-4 space-y-1">
        <button
          onClick={() => {
            navigate('/profile')
            if (setMobileOpen) setMobileOpen(false)
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#9AA4AD] transition hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4 shrink-0 text-[#6B6B76]" />
          <span>Account Settings</span>
        </button>

        <a
          href="https://github.com/AshvittaS/Dayflow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#9AA4AD] transition hover:bg-white/5 hover:text-white"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-[#6B6B76]" />
          <span>Documentation & Help</span>
        </a>

        {/* Company footprint */}
        <div className="mt-3 rounded-xl bg-white/5 px-3 py-2.5 border border-white/5">
          <p className="text-[11px] font-semibold text-white truncate">Dayflow Workspace</p>
          <p className="text-[10px] text-[#9AA4AD] truncate">Enterprise Edition</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Persistent Sidebar ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col shadow-xl">
        {sidebarContent}
      </aside>

      {/* ── Mobile Slide-out Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
