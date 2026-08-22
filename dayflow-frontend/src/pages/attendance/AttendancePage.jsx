import { useState } from 'react'
import { Calendar, CheckCircle2, Clock, CalendarOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAttendance } from '../../hooks/useAttendance.js'
import { useEmployees } from '../../hooks/useEmployees.js'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function dayName(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
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

function Stat({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}

export default function AttendancePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [month, setMonth] = useState(currentMonth())

  const { employees } = useEmployees()
  const { records, summary, loading, error } = useAttendance(
    month,
    isAdmin && selectedEmpId ? selectedEmpId : null
  )

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">Attendance</h1>
          <p className="mt-1 text-xs text-[#6B6B76]">
            Monthly logs and daily work hour audit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] shadow-subtle outline-none focus:border-[#5B4FE9]"
          />

          {isAdmin && (
            <div className="flex items-center gap-2">
              <label htmlFor="emp-select" className="text-xs font-medium text-[#6B6B76]">
                Employee:
              </label>
              <select
                id="emp-select"
                value={selectedEmpId || ''}
                onChange={(e) => setSelectedEmpId(e.target.value || null)}
                className="rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1F] shadow-subtle outline-none focus:border-[#5B4FE9]"
              >
                <option value="">Myself ({user?.name})</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Days Present"
          value={summary.daysPresent}
          icon={CheckCircle2}
          color="text-[#059669]"
          bg="bg-[#ECFDF5]"
        />
        <Stat
          label="Leaves Taken"
          value={summary.leavesTaken}
          icon={CalendarOff}
          color="text-[#2563EB]"
          bg="bg-[#EFF6FF]"
        />
        <Stat
          label="Total Working Days"
          value={summary.totalWorkingDays}
          icon={Calendar}
          color="text-[#5B4FE9]"
          bg="bg-[#5B4FE9]/10"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          Failed to load attendance: {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAEAEC] bg-white py-20 text-center shadow-subtle">
          <Clock className="h-10 w-10 text-[#92929D]" />
          <p className="mt-3 text-sm font-semibold text-[#1A1A1F]">No attendance records for this period</p>
          <p className="mt-1 text-xs text-[#6B6B76]">Try selecting a different month or checking in today.</p>
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          <table className="w-full text-xs">
            <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
              <tr>
                <th className="px-6 py-3.5">Day</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Check In</th>
                <th className="px-6 py-3.5">Check Out</th>
                <th className="px-6 py-3.5">Work Hours</th>
                <th className="px-6 py-3.5">Extra Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1F4]">
              {records.map((r, i) => {
                const full = isFullDay(r.workHours)
                const dateStr = r.date?.split('T')[0] || r.date
                return (
                  <tr
                    key={dateStr}
                    className={`transition-colors hover:bg-[#F9F9FB] ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'
                    }`}
                  >
                    <td className="px-6 py-3.5 font-medium text-[#6B6B76]">{dayName(dateStr)}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#1A1A1F]">{formatDate(dateStr)}</td>
                    <td className="px-6 py-3.5 font-mono text-[#1A1A1F]">{r.checkIn ?? '—'}</td>
                    <td className="px-6 py-3.5 font-mono text-[#1A1A1F]">
                      {r.checkOut ?? <span className="font-sans font-medium text-[#D97706]">Pending</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      {r.workHours ? (
                        <span
                          className={`font-mono font-bold ${
                            full ? 'text-[#059669]' : 'text-[#D97706]'
                          }`}
                        >
                          {r.workHours}
                        </span>
                      ) : (
                        <span className="text-[#92929D]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#6B6B76]">
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
