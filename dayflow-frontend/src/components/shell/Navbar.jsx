import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  Clock,
  CalendarOff,
  BarChart3,
  Bell,
  Search,
  X,
  Command,
  HelpCircle,
  CheckCheck,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import AvatarMenu from './AvatarMenu.jsx'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userStatus, setUserStatus] = useState(user?.status || 'absent')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const notifRef = useRef(null)

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Leave Request Pending',
      desc: 'Alex Kumar submitted Casual Leave for Aug 24 - 25',
      time: '2h ago',
      unread: true,
      icon: CalendarOff,
      iconColor: 'text-[#2563EB] bg-[#EFF6FF]'
    },
    {
      id: 2,
      title: 'Workday Check-In Logged',
      desc: 'You checked in successfully at 09:02 AM',
      time: '5h ago',
      unread: true,
      icon: Clock,
      iconColor: 'text-[#059669] bg-[#ECFDF5]'
    },
    {
      id: 3,
      title: 'Upcoming Work Anniversary',
      desc: 'Priya Sharma marks 2 years with Dayflow tomorrow 🎉',
      time: '1d ago',
      unread: false,
      icon: Calendar,
      iconColor: 'text-[#C026D3] bg-[#FDF4FF]'
    },
    {
      id: 4,
      title: 'August Payroll Draft',
      desc: 'Monthly salary structure draft is ready for review',
      time: '2d ago',
      unread: false,
      icon: DollarSign,
      iconColor: 'text-[#5B4FE9] bg-[#EEEDFC]'
    }
  ])

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

  // Outside click listener for notification dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  function handleToggleNotif() {
    setNotifOpen((prev) => {
      const next = !prev
      if (next) {
        setHasUnread(false)
      }
      return next
    })
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    setHasUnread(false)
  }

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EAEAEC] bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      {/* ── Left: Brand Logo & Top Horizontal Navigation Tabs ── */}
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Wordmark */}
        <button
          onClick={() => navigate('/employees')}
          className="group flex items-center gap-2.5 outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-[0_2px_8px_rgba(91,79,233,0.35)] transition group-hover:scale-105">
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
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-[#1A1A1F]">
              Day<span className="text-[#5B4FE9]">flow</span>
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-wider text-[#9AA4AD] sm:inline-block">
              HRMS
            </span>
          </div>
        </button>

        {/* Horizontal Navigation Items (Light Theme) */}
        <nav className="flex items-center gap-1" aria-label="Main Horizontal Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-[#5B4FE9]/10 text-[#5B4FE9]'
                      : 'text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* ── Right: Consolidated Search Bar + Documentation + Notifications Dropdown + Avatar ── */}
      <div className="flex items-center gap-3">
        {/* Command Search Bar */}
        <div className="relative hidden md:block w-72 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9AA4AD]" />
          <input
            id="command-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search employees by name or ID…"
            className="w-full rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] py-1.5 pl-9 pr-9 text-xs font-medium text-[#1A1A1F] placeholder-[#9AA4AD] outline-none transition focus:border-[#5B4FE9] focus:bg-white focus:ring-2 focus:ring-[#5B4FE9]/10"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA4AD] hover:text-[#1A1A1F]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-[#EAEAEC] bg-white px-1 py-0.2 text-[9px] font-bold text-[#9AA4AD]">
              <Command className="h-2 w-2" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Documentation link */}
        <a
          href="https://github.com/AshvittaS/Dayflow"
          target="_blank"
          rel="noopener noreferrer"
          title="Help & Documentation"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-[#6B6B76] transition hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
        >
          <HelpCircle className="h-4 w-4" />
        </a>

        {/* Functional Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            aria-label="View notifications"
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAEAEC] transition ${
              notifOpen
                ? 'bg-[#5B4FE9]/10 text-[#5B4FE9] border-[#5B4FE9]/30'
                : 'text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
            }`}
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#5B4FE9] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#EAEAEC] bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 pb-2.5 border-b border-[#F1F1F4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#1A1A1F]">Notifications</span>
                  <span className="rounded-full bg-[#5B4FE9]/10 px-2 py-0.5 text-[10px] font-bold text-[#5B4FE9]">
                    {notifications.filter((n) => n.unread).length} new
                  </span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B4FE9] hover:underline"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all as read
                </button>
              </div>

              {/* Notification Items List */}
              <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 rounded-xl p-2.5 transition ${
                        n.unread ? 'bg-[#F8F9FA]' : 'hover:bg-[#F8F9FA]/60'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.iconColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1A1A1F] truncate">{n.title}</p>
                          <span className="text-[10px] text-[#9AA4AD] shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#6B6B76] leading-tight mt-0.5">{n.desc}</p>
                      </div>
                      {n.unread && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5B4FE9]" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#EAEAEC]" />

        {/* User avatar menu with live presence dot */}
        {user && <AvatarMenu user={user} overrideStatus={userStatus} />}
      </div>
    </header>
  )
}
