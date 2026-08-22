import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAttendance } from '../../hooks/useAttendance.js'
import { employees as empList } from '../../data/mockData.js' // only for admin name list

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function dayName(iso) {
  return DAY_NAMES[new Date(iso).getDay()]
}

function isFullDay(workHours) {
  if (!workHours) return false
  const [h] = workHours.split(':').map(Number)
  return h >= 8
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AttendancePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [selectedEmpId, setSelectedEmpId] = useState(null) // null = self
  const [month, setMonth] = useState(currentMonth())

  const { records, summary, loading, error } = useAttendance(
    month,
    isAdmin && selectedEmpId ? selectedEmpId : null
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Attendance</h1>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="mt-1 rounded-lg border border-base-border bg-base-card px-3 py-1 text-xs text-white outline-none focus:border-accent" />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <label htmlFor="emp-select" className="text-xs text-slate-400">Viewing:</label>
            <select id="emp-select" value={selectedEmpId || ''} onChange={e => setSelectedEmpId(e.target.value || null)}
              className="rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-sm text-white outline-none focus:border-accent">
              <option value="">Myself</option>
              {empList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Stat label="Days Present"  value={summary.daysPresent}      icon="✅" color="text-status-present" />
        <Stat label="Leaves Taken"  value={summary.leavesTaken}      icon="🏖️" color="text-status-leave" />
        <Stat label="Working Days"  value={summary.totalWorkingDays} icon="📅" color="text-slate-300" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load attendance: {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-border py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p className="text-sm font-medium text-slate-400">No attendance records for this period</p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-base-border">
          <table className="w-full text-sm">
            <thead className="bg-base-panel text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Work Hours</th>
                <th className="px-4 py-3">Extra Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const full = isFullDay(r.workHours)
                const dateStr = r.date?.split('T')[0] || r.date
                return (
                  <tr key={dateStr} className="border-t border-base-border bg-base-card hover:bg-base-panel/60 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{dayName(dateStr)}</td>
                    <td className="px-4 py-3 font-medium text-white">{formatDate(dateStr)}</td>
                    <td className="px-4 py-3 text-slate-300">{r.checkIn ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{r.checkOut ?? <span className="text-status-absent">Pending</span>}</td>
                    <td className="px-4 py-3">
                      {r.workHours
                        ? <span className={`font-semibold ${full ? 'text-status-present' : 'text-status-absent'}`}>{r.workHours}</span>
                        : <span className="text-slate-600">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.extraHours && r.extraHours !== '00:00' ? r.extraHours : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, icon, color }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card p-5">
      <div className="mb-2 text-lg">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  )
}
