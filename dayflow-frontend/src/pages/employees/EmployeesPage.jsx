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
          <h1 className="text-2xl font-bold tracking-tight text-white">Employees</h1>
          <p className="mt-1 text-xs text-slate-400">
            Organizational directory and live team presence
          </p>
        </div>

        {/* Check In / Check Out Control for Logged-In User */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 self-start md:self-auto rounded-xl border border-base-border bg-base-panel px-4 py-2.5 shadow-subtle">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {checkedIn && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-present opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    checkedIn ? 'bg-status-present' : 'bg-slate-500'
                  }`}
                />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">
                  {checkedIn ? `Checked In` : 'Not checked in'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {user?.name ? `${user.name}` : 'Start your workday'}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-base-border" />

            <button
              onClick={handleCheckInOut}
              disabled={checkInLoading}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-60 ${
                checkedIn
                  ? 'border border-base-border bg-base-card text-white hover:bg-base-panel'
                  : 'bg-accent text-white hover:bg-accent-hover'
              }`}
            >
              {checkInLoading ? '…' : checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>
          {checkInError && <p className="text-xs text-red-400">{checkInError}</p>}
        </div>
      </div>

      {/* ── Presence Summary Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-base-border bg-base-card p-3.5 shadow-subtle">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Staff</p>
            <p className="text-lg font-bold text-white">{totalEmployees}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-base-border bg-base-card p-3.5 shadow-subtle">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Present</p>
            <p className="text-lg font-bold text-emerald-400">{presentCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-base-border bg-base-card p-3.5 shadow-subtle">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
            <CalendarOff className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">On Leave</p>
            <p className="text-lg font-bold text-blue-400">{leaveCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-base-border bg-base-card p-3.5 shadow-subtle">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Absent</p>
            <p className="text-lg font-bold text-amber-400">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input with live count */}
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="employee-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, department, or login ID…"
              className="w-full rounded-xl border border-base-border bg-base-card py-2 pl-9 pr-8 text-xs font-medium text-white placeholder-slate-400 shadow-subtle outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                  ? 'bg-accent text-white shadow-sm'
                  : 'border border-base-border bg-base-card text-slate-400 hover:bg-base-panel hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
          {!loading && (
            <span className="ml-2 text-xs font-medium text-slate-400 whitespace-nowrap">
              {filtered.length} of {totalEmployees} employees
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load employees: {error}
        </div>
      )}

      {/* ── Employee Card Grid ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-border bg-base-card py-20 text-center shadow-subtle">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-panel text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white">No employees found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            We couldn&apos;t find any employee matching &ldquo;{query}&rdquo;. Try searching for another name, role, or department.
          </p>
          <button
            onClick={() => {
              setQuery('')
              setActiveDept('All')
            }}
            className="mt-4 rounded-lg bg-accent/20 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/30"
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
