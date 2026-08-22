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
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../hooks/useNotifications.js'
import AvatarMenu from './AvatarMenu.jsx'

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now'
  const date = new Date(dateString)
  const now = new Date()
  const diffSec = Math.floor((now - date) / 1000)

  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function getNotificationVisual(type) {
  switch (type) {
    case 'leave':
      return {
        icon: CalendarOff,
        color: 'text-[#2563EB] bg-[#EFF6FF]'
      }
    case 'attendance':
      return {
        icon: Clock,
        color: 'text-[#059669] bg-[#ECFDF5]'
      }
    case 'payroll':
      return {
        icon: DollarSign,
        color: 'text-[#5B4FE9] bg-[#EEEDFC]'
      }
    case 'employee':
      return {
        icon: Users,
        color: 'text-[#C026D3] bg-[#FDF4FF]'
      }
    default:
      return {
        icon: Sparkles,
        color: 'text-[#5B4FE9] bg-[#EEEDFC]'
      }
  }
}

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userStatus, setUserStatus] = useState(user?.status || 'absent')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications()

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
    setNotifOpen((prev) => !prev)
  }

  function handleNotificationClick(n) {
    if (!n.isRead) {
      markAsRead(n.id)
    }
    setNotifOpen(false)
    if (n.link) {
      navigate(n.link)
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    window.dispatchEvent(
      new CustomEvent('dayflow:search', {
        detail: { query: val }
      })
    )
  }

  function handleClearSearch() {
    setSearchQuery('')
    window.dispatchEvent(
      new CustomEvent('dayflow:search', {
        detail: { query: '' }
      })
    )
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#EAEAEC] bg-white/95 px-4 backdrop-blur-md transition-colors sm:px-8">
      {/* ── Left: Brand identity + Main Navigation ── */}
      <div className="flex items-center gap-8">
        {/* Brand logo */}
        <NavLink
          to="/employees"
          className="flex items-center gap-2.5 outline-none transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-[0_2px_8px_rgba(91,79,233,0.35)]">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-extrabold tracking-tight text-[#1A1A1F]">
              Day<span className="text-[#5B4FE9]">flow</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#9AA4AD]">
              HR Operating System
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EEEDFC] text-[#5B4FE9] shadow-sm'
                    : 'text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Right: Consolidated Search Bar + Documentation + Notifications Dropdown + Avatar ── */}
      <div className="flex items-center gap-3">
        {/* Consolidated Top Command / Search Bar */}
        <div className="relative w-48 sm:w-64 md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA4AD]" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search directory (⌘K)..."
            className="h-9 w-full rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] pl-9 pr-8 text-xs font-semibold text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all focus:border-[#5B4FE9] focus:bg-white focus:ring-2 focus:ring-[#5B4FE9]/10"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#9AA4AD] hover:bg-[#EAEAEC] hover:text-[#1A1A1F]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 rounded border border-[#EAEAEC] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#9AA4AD]">
              <Command className="h-2.5 w-2.5" /> K
            </div>
          )}
        </div>

        {/* Documentation / Help shortcut */}
        <a
          href="https://github.com/AshvittaS/Dayflow#readme"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Documentation"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-[#6B6B76] transition hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
        >
          <HelpCircle className="h-4 w-4" />
        </a>

        {/* Functional Notification Bell with Dynamic Dropdown */}
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
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5B4FE9] px-1 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dynamic Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#EAEAEC] bg-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 pb-2.5 border-b border-[#F1F1F4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#1A1A1F]">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-[#5B4FE9]/10 px-2 py-0.5 text-[10px] font-bold text-[#5B4FE9]">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      All caught up
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B4FE9] hover:underline cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Dynamic Notification Items List */}
              <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#9AA4AD]">
                    <Bell className="mx-auto h-6 w-6 text-[#D5D5DC] mb-1.5" />
                    <p className="font-semibold text-[#1A1A1F]">No notifications yet</p>
                    <p className="text-[11px] mt-0.5">Alerts for leave requests and check-ins appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const visual = getNotificationVisual(n.type)
                    const Icon = visual.icon
                    const isUnread = !n.isRead

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`group flex items-start gap-3 rounded-xl p-2.5 transition cursor-pointer ${
                          isUnread
                            ? 'bg-[#F8F9FA] hover:bg-[#EEEDFC]/40'
                            : 'hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#1A1A1F] truncate group-hover:text-[#5B4FE9] transition-colors">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#9AA4AD] shrink-0 font-mono ml-2">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B6B76] leading-tight mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#5B4FE9]" />
                        )}
                      </div>
                    )
                  })
                )}
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
