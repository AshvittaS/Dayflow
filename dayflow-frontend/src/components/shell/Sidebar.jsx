import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  Clock,
  CalendarOff,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  ChevronRight,
  Shield
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
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

  return (
    <>
      {/* ── Desktop Icon Rail (Collapsed by default, expands as overlay on hover) ── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col justify-between bg-[#121217] text-white border-r border-[#1F1F28] transition-all duration-250 ease-in-out ${
          isHovered
            ? 'w-64 shadow-[8px_0_24px_rgba(0,0,0,0.35)]'
            : 'w-[72px] shadow-lg'
        }`}
      >
        {/* Top: Brand Logo */}
        <div>
          <div className="flex h-16 items-center px-4">
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center gap-3.5 outline-none overflow-hidden text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-[0_4px_14px_rgba(79,70,229,0.45)] ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
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
              {isHovered && (
                <div className="flex flex-col animate-in fade-in duration-150 whitespace-nowrap">
                  <span className="text-base font-extrabold tracking-tight text-white leading-tight">
                    Day<span className="text-[#818CF8]">flow</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#71717A]">
                    HRMS Console
                  </span>
                </div>
              )}
            </button>
          </div>

          <div className="mx-3 my-1 h-px bg-white/5" />

          {/* Navigation Items */}
          <div className="px-2.5 py-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={!isHovered ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 rounded-xl transition-all duration-150 ${
                      isHovered ? 'px-3.5 py-2.5' : 'h-11 w-11 justify-center mx-auto'
                    } ${
                      isActive
                        ? 'bg-[#5B4FE9] text-white shadow-[0_4px_16px_rgba(91,79,233,0.35)] ring-1 ring-white/20'
                        : 'text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
                  {isHovered && (
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap animate-in fade-in duration-150">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Bottom Pinned Items */}
        <div className="border-t border-white/5 p-2.5 space-y-1.5">
          <button
            onClick={() => navigate('/profile')}
            title={!isHovered ? 'Account Settings' : undefined}
            className={`flex items-center gap-3.5 rounded-xl text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-all ${
              isHovered ? 'w-full px-3.5 py-2 text-xs font-medium' : 'h-11 w-11 justify-center mx-auto'
            }`}
          >
            <Settings className="h-5 w-5 shrink-0" strokeWidth={2} />
            {isHovered && <span className="whitespace-nowrap">Account Settings</span>}
          </button>

          <a
            href="https://github.com/AshvittaS/Dayflow"
            target="_blank"
            rel="noopener noreferrer"
            title={!isHovered ? 'Help & Documentation' : undefined}
            className={`flex items-center gap-3.5 rounded-xl text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-all ${
              isHovered ? 'w-full px-3.5 py-2 text-xs font-medium' : 'h-11 w-11 justify-center mx-auto'
            }`}
          >
            <HelpCircle className="h-5 w-5 shrink-0" strokeWidth={2} />
            {isHovered && <span className="whitespace-nowrap">Documentation</span>}
          </a>

          {isHovered && (
            <div className="mt-2 rounded-xl bg-[#1C1C24] border border-white/10 p-3 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-tight">Dayflow</span>
                <span className="rounded-full bg-[#5B4FE9]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#818CF8]">
                  v1.0
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-[#71717A] truncate">
                {user?.name || 'Active Session'}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Slide-out Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#121217] text-white p-4 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9] text-white">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-white text-base">Dayflow HRMS</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                          isActive ? 'bg-[#5B4FE9] text-white' : 'text-[#A1A1AA] hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-[#71717A]">Logged in as {user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
