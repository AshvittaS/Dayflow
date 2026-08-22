import { useState, useEffect } from 'react'
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarOff,
  Search,
  Filter,
  UserPlus,
  LogOut,
  LogIn,
  Check,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useEmployees } from '../../hooks/useEmployees.js'
import { checkIn, checkOut } from '../../hooks/useAttendance.js'
import EmployeeCard from './EmployeeCard.jsx'
import AddEmployeeModal from '../../components/modals/AddEmployeeModal.jsx'

// Default stock headshots for live pulse strip
const PULSE_AVATARS = {
  '1': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  '2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  '3': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  '4': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  '5': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  '6': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'DF26JD0001': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'DF26AK0002': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
}

export default function EmployeesPage() {
  const { user } = useAuth()
  const { employees, loading, error, refetch } = useEmployees()
  const [query, setQuery] = useState('')
  const [activeDept, setActiveDept] = useState('All')
  const [checkedIn, setCheckedIn] = useState(user?.status === 'present')
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkInError, setCheckInError] = useState('')
  const [highlightedId, setHighlightedId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_officer'

  // Listen to consolidated top command search
  useEffect(() => {
    function handleSearchEvent(e) {
      if (typeof e.detail?.query === 'string') {
        setQuery(e.detail.query)
      }
    }
    window.addEventListener('dayflow:search', handleSearchEvent)
    return () => window.removeEventListener('dayflow:search', handleSearchEvent)
  }, [])

  // Distinct departments for filtering
  const departments = ['All', ...new Set(employees.map((e) => e.department).filter(Boolean))]

  async function handleCheckInOut() {
    setCheckInError('')
    setCheckInLoading(true)
    try {
      if (checkedIn) {
        await checkOut()
        setCheckedIn(false)
      } else {
        await checkIn()
        setCheckedIn(true)
      }
      refetch()
    } catch (err) {
      setCheckInError(err.message)
    } finally {
      setCheckInLoading(false)
    }
  }

  function handlePulseClick(empId) {
    setHighlightedId(empId)
    const card = document.getElementById(`employee-card-${empId}`)
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => setHighlightedId(null), 2500)
  }

  // Filter employees
  const filtered = employees.filter((e) => {
    const matchesQuery =
      e.name?.toLowerCase().includes(query.toLowerCase()) ||
      e.department?.toLowerCase().includes(query.toLowerCase()) ||
      (e.title && e.title.toLowerCase().includes(query.toLowerCase())) ||
      (e.loginId && e.loginId.toLowerCase().includes(query.toLowerCase()))

    const matchesDept = activeDept === 'All' || e.department === activeDept
    return matchesQuery && matchesDept
  })

  // Pin current user's card to top-left of the grid
  const sortedEmployees = [...filtered].sort((a, b) => {
    const isSelfA = String(a.id) === String(user?.employeeId)
    const isSelfB = String(b.id) === String(user?.employeeId)
    if (isSelfA) return -1
    if (isSelfB) return 1
    return 0
  })

  // Counts
  const totalEmployees = employees.length
  const presentCount = employees.filter((e) => e.status === 'present').length
  const leaveCount = employees.filter((e) => e.status === 'leave').length
  const absentCount = totalEmployees - presentCount - leaveCount

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1F]">
            Employees Directory
          </h1>
          <p className="text-xs font-normal tracking-wide text-[#6B6B76]">
            Real-time organizational headcount, attendance metrics, and talent directory
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5B4FE9] px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(91,79,233,0.3)] hover:bg-[#4A3EC8] transition-all self-start sm:self-auto shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* ── 2. Top Matched Pair: Live Team Pulse (Left) + Status-Colored Workday Check-In (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left (8 Cols): Live Team Pulse */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle min-h-[145px]">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F1F1F4]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F]">
                Live Team Pulse
              </span>
              <span className="text-[11px] font-medium text-[#6B6B76]">
                ({presentCount} active today)
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#9AA4AD] hidden sm:inline-block">
              Click avatar to quick-locate card
            </span>
          </div>

          {/* Horizontal Avatar Roll Call - with ample space so rings never clip */}
          <div className="flex items-center gap-5 overflow-x-auto py-2.5 px-2 scrollbar-none">
            {employees.map((emp) => {
              const isSelf = String(emp.id) === String(user?.employeeId)
              const rawAvatar = emp.avatarUrl || emp.avatar
              const photo = rawAvatar
                ? rawAvatar.startsWith('/uploads')
                  ? `http://localhost:4000${rawAvatar}`
                  : rawAvatar
                : PULSE_AVATARS[String(emp.id)] || PULSE_AVATARS[emp.loginId]
              const initials = emp.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)

              const ringColor =
                emp.status === 'present'
                  ? 'ring-[#10B981] bg-[#ECFDF5] text-[#065F46]'
                  : emp.status === 'leave'
                  ? 'ring-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF]'
                  : 'ring-[#F59E0B] bg-[#FFFBEB] text-[#92400E]'

              return (
                <button
                  key={emp.id}
                  onClick={() => handlePulseClick(emp.id)}
                  title={`${emp.name} (${emp.status})`}
                  className="group relative flex flex-col items-center gap-1.5 shrink-0 outline-none p-1 transition-transform hover:scale-105"
                >
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-[3px] ring-offset-2 ring-offset-white overflow-hidden transition-all ${ringColor} ${
                      isSelf ? 'ring-offset-[#5B4FE9]/30' : ''
                    }`}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={emp.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#1A1A1F] max-w-[60px] truncate group-hover:text-[#5B4FE9]">
                    {emp.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right (4 Cols): Status-Colored Rich Workday Check-In Card */}
        <div
          className={`lg:col-span-4 flex flex-col justify-between rounded-2xl border p-5 shadow-subtle space-y-3 transition-all duration-300 ${
            checkedIn
              ? 'bg-gradient-to-b from-[#ECFDF5]/80 via-white to-white border-[#10B981]/35 shadow-[0_4px_16px_rgba(16,185,129,0.08)]'
              : 'bg-gradient-to-b from-[#FFFBEB]/80 via-white to-white border-[#F59E0B]/35 shadow-[0_4px_16px_rgba(245,158,11,0.08)]'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-extrabold uppercase tracking-wider ${
                checkedIn ? 'text-[#065F46]' : 'text-[#92400E]'
              }`}
            >
              Workday Check-In
            </span>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                checkedIn
                  ? 'bg-[#10B981]/15 text-[#065F46] border-[#10B981]/30'
                  : 'bg-[#F59E0B]/15 text-[#92400E] border-[#F59E0B]/30'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  checkedIn ? 'bg-[#10B981] animate-ping' : 'bg-[#F59E0B]'
                }`}
              />
              <span>{checkedIn ? 'Active' : 'Offline'}</span>
            </div>
          </div>

          {/* User Status Box */}
          <div
            className={`rounded-xl px-3.5 py-2.5 border transition-all ${
              checkedIn
                ? 'bg-[#ECFDF5]/60 border-[#10B981]/25'
                : 'bg-[#FFFBEB]/60 border-[#F59E0B]/25'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#1A1A1F]">
                {user?.name || 'Current User'}
              </p>
              <span className="text-[10px] font-semibold text-[#6B6B76]">
                {checkedIn ? 'Logged On' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium">
              {checkedIn ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span className="text-[#065F46]">Checked in for duty</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                  <span className="text-[#92400E]">Not checked in</span>
                </>
              )}
            </div>
          </div>

          {/* Action Button: Red/Danger on Checked-in, Green/Success on Checked-out */}
          <button
            onClick={handleCheckInOut}
            disabled={checkInLoading}
            className={`w-full rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
              checkedIn
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)]'
                : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]'
            }`}
          >
            {checkInLoading ? (
              'Processing…'
            ) : checkedIn ? (
              <>
                <LogOut className="h-4 w-4" />
                <span>Check Out of Office</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Check In to Office</span>
              </>
            )}
          </button>
          {checkInError && <p className="text-xs text-red-500 font-medium">{checkInError}</p>}
        </div>
      </div>

      {/* ── 3. Asymmetric Two-Column Body ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left Column (~30% / 320px): Headcount Metrics on its own ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-5">
          {/* Stacked Vertical Stat Metrics List */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F1F4] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                Headcount Metrics
              </span>
              <span className="text-[11px] font-bold text-[#5B4FE9] bg-[#5B4FE9]/10 px-2 py-0.5 rounded-md">
                Live Data
              </span>
            </div>

            <div className="space-y-3">
              {/* Total Staff Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#5B4FE9]/[0.05] to-transparent border border-[#5B4FE9]/15">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B4FE9]/15 text-[#5B4FE9]">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#1A1A1F]">Total Staff</p>
                    <p className="text-[10px] text-[#6B6B76]">Registered team</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-[#1A1A1F]">{totalEmployees}</span>
              </div>

              {/* Present Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#10B981]/[0.05] to-transparent border border-[#10B981]/15">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#059669]">Present Today</p>
                    <p className="text-[10px] text-[#6B6B76]">In office / online</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-[#059669]">{presentCount}</span>
              </div>

              {/* On Leave Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#2563EB]/[0.05] to-transparent border border-[#2563EB]/15">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <CalendarOff className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#2563EB]">On Approved Leave</p>
                    <p className="text-[10px] text-[#6B6B76]">Paid / sick / unpaid</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-[#2563EB]">{leaveCount}</span>
              </div>

              {/* Absent Row */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B]/[0.05] to-transparent border border-[#F59E0B]/15">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#D97706]">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#D97706]">Pending / Absent</p>
                    <p className="text-[10px] text-[#6B6B76]">Unlogged status</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-[#D97706]">{absentCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (~70%): Department Filter Pills + Employee Grid ── */}
        <div className="flex-1 min-w-0 space-y-5 w-full">
          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-3 shadow-subtle">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-[#6B6B76] mr-2 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Departments:
              </span>
              {departments.map((dept) => {
                const isActive = activeDept === dept
                return (
                  <button
                    key={dept}
                    onClick={() => setActiveDept(dept)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#5B4FE9] text-white shadow-[0_2px_8px_rgba(91,79,233,0.3)]'
                        : 'bg-[#F4F4F6] text-[#6B6B76] hover:bg-[#EAEAEC] hover:text-[#1A1A1F]'
                    }`}
                  >
                    {dept}
                  </button>
                )
              })}
            </div>

            <span className="text-xs font-bold text-[#6B6B76] px-2 whitespace-nowrap">
              {filtered.length} of {totalEmployees} shown
            </span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-500">
              Failed to load directory: {error}
            </div>
          )}

          {/* Empty search state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAEAEC] bg-white py-20 text-center shadow-subtle">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F4F6] text-[#9AA4AD]">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#1A1A1F]">No employees matched</h3>
              <p className="mt-1 text-xs text-[#6B6B76] max-w-sm">
                No profiles found matching &ldquo;{query}&rdquo; in {activeDept} department.
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setActiveDept('All')
                }}
                className="mt-4 rounded-xl bg-[#5B4FE9]/10 px-4 py-2 text-xs font-bold text-[#5B4FE9] hover:bg-[#5B4FE9]/20"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Directory Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  isHighlighted={highlightedId === emp.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={refetch}
        />
      )}
    </div>
  )
}
