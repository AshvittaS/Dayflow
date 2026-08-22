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
    <div className="flex h-full flex-col justify-between bg-[#121217] text-white select-none">
      {/* ── Top Brand Section ── */}
      <div>
        <div className="flex h-20 items-center justify-between px-6 pt-2">
          <button
            onClick={() => {
              navigate('/employees')
              if (setMobileOpen) setMobileOpen(false)
            }}
            className="flex items-center gap-3 outline-none text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.45)] ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white leading-tight">
                Day<span className="text-[#818CF8]">flow</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717A]">
                HRMS Console
              </span>
            </div>
          </button>

          {/* Close button for mobile drawer */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-[#A1A1AA] hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mx-6 my-1 h-px bg-white/5" />

        {/* ── Main Navigation List ── */}
        <div className="px-3.5 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
            Workspace Navigation
          </p>
          <nav className="space-y-1.5" aria-label="Main Sidebar Navigation">
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
                    `group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
                      isActive
                        ? 'bg-[#5B4FE9] text-white shadow-[0_4px_16px_rgba(91,79,233,0.35)] ring-1 ring-white/20'
                        : 'text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 opacity-90 transition-transform group-hover:scale-105" strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Bottom Pinned Links & Workspace Card ── */}
      <div className="border-t border-white/5 p-4 space-y-2">
        <button
          onClick={() => {
            navigate('/profile')
            if (setMobileOpen) setMobileOpen(false)
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#A1A1AA] transition hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4 shrink-0 text-[#71717A]" strokeWidth={2} />
          <span>Account Settings</span>
        </button>

        <a
          href="https://github.com/AshvittaS/Dayflow"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#A1A1AA] transition hover:bg-white/5 hover:text-white"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-[#71717A]" strokeWidth={2} />
          <span>Help & Documentation</span>
        </a>

        {/* Elevated Workspace Card */}
        <div className="mt-2 rounded-xl bg-[#1C1C24] border border-white/10 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-tight">Dayflow Workspace</span>
            <span className="rounded-full bg-[#5B4FE9]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#818CF8] border border-[#5B4FE9]/30">
              Enterprise
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#71717A] truncate">
            {user?.email || 'Logged in session'}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Persistent Sidebar ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col shadow-2xl border-r border-[#1F1F28]">
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
