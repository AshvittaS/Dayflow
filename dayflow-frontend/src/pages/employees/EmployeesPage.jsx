import { useState } from 'react'
import { Search, X, Users, CheckCircle2, Clock, CalendarOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useEmployees } from '../../hooks/useEmployees.js'
import { checkIn, checkOut } from '../../hooks/useAttendance.js'
import EmployeeCard from './EmployeeCard.jsx'

export default function EmployeesPage() {
  const { user } = useAuth()
  const { employees, loading, error, refetch } = useEmployees()
  const [query, setQuery] = useState('')
  const [activeDept, setActiveDept] = useState('All')
  const [checkedIn, setCheckedIn] = useState(user?.status === 'present')
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkInError, setCheckInError] = useState('')

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
      refetch() // refresh employee list so status dot updates
    } catch (err) {
      setCheckInError(err.message)
    } finally {
      setCheckInLoading(false)
    }
  }

  const filtered = employees.filter((e) => {
    const matchesQuery =
      e.name?.toLowerCase().includes(query.toLowerCase()) ||
      e.department?.toLowerCase().includes(query.toLowerCase()) ||
      (e.title && e.title.toLowerCase().includes(query.toLowerCase())) ||
      (e.loginId && e.loginId.toLowerCase().includes(query.toLowerCase()))

    const matchesDept = activeDept === 'All' || e.department === activeDept
    return matchesQuery && matchesDept
  })

  // Dynamic presence breakdown based on live database status
  const totalEmployees = employees.length
  const presentCount = employees.filter((e) => e.status === 'present').length
  const leaveCount = employees.filter((e) => e.status === 'leave').length
  const absentCount = totalEmployees - presentCount - leaveCount

  return (
    <div className="space-y-6">
      {/* ── Page Header & Top Controls ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">Employees</h1>
          <p className="mt-1 text-xs text-[#6B6B76]">
            Organizational directory and live team presence
          </p>
        </div>

        {/* Check In / Check Out Control for Logged-In User */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 self-start md:self-auto rounded-xl border border-[#EAEAEC] bg-white px-4 py-2.5 shadow-subtle">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {checkedIn && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    checkedIn ? 'bg-[#10B981]' : 'bg-[#92929D]'
                  }`}
                />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#1A1A1F]">
                  {checkedIn ? `Checked In` : 'Not checked in'}
                </span>
                <span className="text-[11px] text-[#6B6B76]">
                  {user?.name ? `${user.name}` : 'Start your workday'}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#EAEAEC]" />

            <button
              onClick={handleCheckInOut}
              disabled={checkInLoading}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-60 ${
                checkedIn
                  ? 'border border-[#EAEAEC] bg-[#F8F9FA] text-[#1A1A1F] hover:bg-[#F1F1F4]'
                  : 'bg-[#5B4FE9] text-white hover:bg-[#4A3EC8]'
              }`}
            >
              {checkInLoading ? '…' : checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>
          {checkInError && <p className="text-xs text-red-500">{checkInError}</p>}
        </div>
      </div>

      {/* ── Presence Summary Metrics ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Staff */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B4FE9]/10 text-[#5B4FE9]">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">Total Staff</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A1F]">{totalEmployees}</p>
          </div>
        </div>

        {/* Present */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">Present</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#059669]">{presentCount}</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <CalendarOff className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">On Leave</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#2563EB]">{leaveCount}</p>
          </div>
        </div>

        {/* Absent */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706]">
            <Clock className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">Absent</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[#D97706]">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input with live count */}
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92929D]" />
            <input
              id="employee-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, department, or login ID…"
              className="w-full rounded-xl border border-[#EAEAEC] bg-white py-2 pl-9 pr-8 text-xs font-medium text-[#1A1A1F] placeholder-[#92929D] shadow-subtle outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92929D] hover:text-[#1A1A1F]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeDept === dept
                  ? 'bg-[#5B4FE9] text-white shadow-sm'
                  : 'border border-[#EAEAEC] bg-white text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
              }`}
            >
              {dept}
            </button>
          ))}
          {!loading && (
            <span className="ml-2 text-xs font-medium text-[#6B6B76] whitespace-nowrap">
              {filtered.length} of {totalEmployees} employees
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          Failed to load employees: {error}
        </div>
      )}

      {/* ── Employee Card Grid ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAEAEC] bg-white py-20 text-center shadow-subtle">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F4F6] text-[#92929D]">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-[#1A1A1F]">No employees found</h3>
          <p className="mt-1 text-xs text-[#6B6B76] max-w-sm">
            We couldn&apos;t find any employee matching &ldquo;{query}&rdquo;. Try searching for another name, role, or department.
          </p>
          <button
            onClick={() => {
              setQuery('')
              setActiveDept('All')
            }}
            className="mt-4 rounded-lg bg-[#5B4FE9]/10 px-4 py-2 text-xs font-semibold text-[#5B4FE9] hover:bg-[#5B4FE9]/20"
          >
            Reset Filters
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  )
}
