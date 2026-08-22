import { useState } from 'react'
import { attendanceRecords, currentUser, employees } from '../../data/mockData.js'

// § 6 — Attendance page.
// Employee view: day-wise attendance for the current month, own record only.
// Columns: Day, Date, Check In, Check Out, Work Hours, Extra Hours.
// Admin view: can switch to view all employees (role-gated).
// NOTE(team): Half-day status UI is not added — see SKILL.md §9 open question.

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function dayName(iso) {
  return DAY_NAMES[new Date(iso).getDay()]
}

/** Returns true if work hours string (HH:MM) is >= 8 hours */
function isFullDay(workHours) {
  if (!workHours) return false
  const [h] = workHours.split(':').map(Number)
  return h >= 8
}

export default function AttendancePage() {
  const isAdmin = currentUser.role === 'admin'
  const [selectedEmpId, setSelectedEmpId] = useState(currentUser.id)

  // For this mock, all employees share the same attendanceRecords shape.
  // A real API would filter by employee ID.
  const records = attendanceRecords

  const daysPresent = records.filter((r) => r.checkIn).length
  const totalWorkingDays = 22 // placeholder — derive from payroll calendar config
  const leavesTaken = 0        // placeholder — wire from timeOffRequests when merged

  const viewedName =
    selectedEmpId === currentUser.id
      ? currentUser.name
      : employees.find((e) => e.id === selectedEmpId)?.name ?? '—'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Attendance</h1>
          <p className="text-xs text-slate-500">August 2026</p>
        </div>

        {/* Admin: employee selector */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <label htmlFor="emp-select" className="text-xs text-slate-400">
              Viewing:
            </label>
            <select
              id="emp-select"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="rounded-lg border border-base-border bg-base-card px-3 py-1.5 text-sm text-white outline-none focus:border-accent"
            >
              <option value={currentUser.id}>{currentUser.name} (me)</option>
              {employees
                .filter((e) => e.id !== currentUser.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Summary stats ── */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Stat
          label="Days Present"
          value={daysPresent}
          icon="✅"
          color="text-status-present"
        />
        <Stat
          label="Leaves Taken"
          value={leavesTaken}
          icon="🏖️"
          color="text-status-leave"
        />
        <Stat
          label="Working Days"
          value={totalWorkingDays}
          icon="📅"
          color="text-slate-300"
        />
      </div>

      {/* ── Attendance table ── */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-border py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 h-10 w-10 text-slate-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-sm font-medium text-slate-400">No attendance records this month</p>
          <p className="mt-1 text-xs text-slate-600">
            Records will appear once check-ins are logged
          </p>
        </div>
      ) : (
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
              {records.map((r) => {
                const full = isFullDay(r.workHours)
                return (
                  <tr
                    key={r.date}
                    className="border-t border-base-border bg-base-card hover:bg-base-panel/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500">{dayName(r.date)}</td>
                    <td className="px-4 py-3 font-medium text-white">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-slate-300">{r.checkIn ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{r.checkOut ?? <span className="text-status-absent">Pending</span>}</td>
                    <td className="px-4 py-3">
                      {r.workHours ? (
                        <span
                          className={`font-semibold ${
                            full ? 'text-status-present' : 'text-status-absent'
                          }`}
                        >
                          {r.workHours}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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

      <p className="mt-3 text-xs text-slate-600">
        Showing {viewedName}'s attendance for August 2026.{' '}
        {isAdmin && selectedEmpId !== currentUser.id && (
          <span className="text-accent">Admin view — all employees visible.</span>
        )}
      </p>
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
