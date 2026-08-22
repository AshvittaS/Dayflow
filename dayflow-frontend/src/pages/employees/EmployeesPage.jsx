import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useEmployees } from '../../hooks/useEmployees.js'
import { checkIn, checkOut } from '../../hooks/useAttendance.js'
import EmployeeCard from './EmployeeCard.jsx'

export default function EmployeesPage() {
  const { user } = useAuth()
  const { employees, loading, error, refetch } = useEmployees()
  const [query, setQuery] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkInError, setCheckInError] = useState('')

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.department?.toLowerCase().includes(query.toLowerCase())
  )

  async function handleCheckInOut() {
    setCheckInError('')
    setCheckInLoading(true)
    try {
      if (checkedIn) await checkOut()
      else await checkIn()
      setCheckedIn(v => !v)
      refetch() // refresh employee list so status dot updates
    } catch (err) {
      setCheckInError(err.message)
    } finally {
      setCheckInLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="employee-search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or department…"
              className="w-72 rounded-lg border border-base-border bg-base-card py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          {!loading && (
            <span className="text-xs text-slate-500">{filtered.length} of {employees.length} employees</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 rounded-lg border border-base-border bg-base-panel px-4 py-2">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${checkedIn ? 'bg-status-present' : 'bg-slate-500'}`} />
              <span className="text-xs text-slate-400">
                {checkedIn ? `Checked in — ${user?.name}` : 'Not checked in'}
              </span>
            </div>
            <button onClick={handleCheckInOut} disabled={checkInLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60 ${checkedIn ? 'bg-slate-600 hover:bg-slate-700' : 'bg-accent hover:bg-accent-hover'}`}>
              {checkInLoading ? '…' : checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>
          {checkInError && <p className="text-xs text-red-400">{checkInError}</p>}
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

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-border py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="text-sm font-medium text-slate-400">No employees found</p>
          <p className="mt-1 text-xs text-slate-600">Try a different name or department</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
        </div>
      )}
    </div>
  )
}
