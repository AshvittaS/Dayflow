import { useState } from 'react'
import {
  timeOffBalances,
  timeOffRequests,
  leaveAllocations,
  currentUser
} from '../../data/mockData.js'
import TimeOffRequestModal from './TimeOffRequestModal.jsx'

// § 7 — Time Off page
// Employee view: balance cards + month calendar + own requests list.
// Admin view: two sub-tabs — Time Off (all requests) | Allocation (per-employee balances).
// Status enum: Pending | Approved | Rejected  (SKILL.md §7)

const STATUS_STYLE = {
  Pending:  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  Approved: 'bg-green-500/15  text-green-400  border border-green-500/30',
  Rejected: 'bg-red-500/15   text-red-400   border border-red-500/30'
}

// NOTE(team): exact color ↔ status mapping not confirmed in wireframe — using
// yellow/green/red heuristic per SKILL.md §9.

// ─────────────────────────────────────────────
// Mini month-grid calendar helpers
// ─────────────────────────────────────────────
function buildCalendarDays(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null) // leading blanks
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function calendarHighlight(dateStr, requests) {
  // Check if this date falls within any approved/pending request range
  for (const r of requests) {
    const start = new Date(r.startDate)
    const end = new Date(r.endDate)
    const d = new Date(dateStr)
    if (d >= start && d <= end) return r.status
  }
  return null
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

// ─────────────────────────────────────────────
export default function TimeOffPage() {
  const [showModal, setShowModal] = useState(false)
  const [requests, setRequests] = useState(timeOffRequests)
  const isAdmin = currentUser.role === 'admin'
  const [adminTab, setAdminTab] = useState('Time Off')

  // Calendar state — default to current month
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  // Only show the logged-in user's own requests on the calendar
  const myRequests = requests.filter((r) => r.employee === currentUser.name)

  function addRequest(r) {
    const days = r.daysRequested || 1
    setRequests((prev) => [
      ...prev,
      {
        id: `to-${Date.now()}`,
        employee: currentUser.name,
        startDate: r.start,
        endDate: r.end,
        type: r.type,
        status: 'Pending',
        daysRequested: days
      }
    ])
  }

  function setStatus(id, status) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  // ── EMPLOYEE VIEW ──
  if (!isAdmin) {
    const cells = buildCalendarDays(calYear, calMonth)
    const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-white">My Time Off</h1>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-[0.98]"
          >
            + Request Time Off
          </button>
        </div>

        {/* Balance cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <BalanceCard label="Paid Time Off"  value={timeOffBalances['Paid Time Off']} color="text-status-present" />
          <BalanceCard label="Sick Leave"      value={timeOffBalances['Sick Leave']}    color="text-status-leave" />
          <BalanceCard label="Unpaid Leave"    value={timeOffBalances['Unpaid Leave']}  color="text-slate-400" />
        </div>

        {/* Mini calendar */}
        <div className="mb-6 overflow-hidden rounded-xl border border-base-border bg-base-card">
          {/* Calendar header */}
          <div className="flex items-center justify-between border-b border-base-border px-5 py-3">
            <button onClick={prevMonth} className="rounded p-1 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-semibold text-white">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} className="rounded p-1 text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 border-b border-base-border bg-base-panel">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-px bg-base-border">
            {cells.map((day, idx) => {
              if (!day) return <div key={`blank-${idx}`} className="bg-base-card py-3" />
              const iso = isoDate(calYear, calMonth, day)
              const highlight = calendarHighlight(iso, myRequests)
              const isToday = iso === todayIso

              return (
                <div
                  key={iso}
                  className={`flex flex-col items-center justify-center py-3 text-xs ${
                    highlight === 'Approved' ? 'bg-green-500/20' :
                    highlight === 'Pending'  ? 'bg-yellow-500/20' :
                    highlight === 'Rejected' ? 'bg-red-500/20' :
                    'bg-base-card'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-medium ${
                      isToday
                        ? 'bg-accent text-white'
                        : highlight === 'Approved' ? 'text-green-300'
                        : highlight === 'Pending'  ? 'text-yellow-300'
                        : highlight === 'Rejected' ? 'text-red-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {day}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 border-t border-base-border px-5 py-2.5">
            {[
              { label: 'Today',    color: 'bg-accent' },
              { label: 'Approved', color: 'bg-green-500/40' },
              { label: 'Pending',  color: 'bg-yellow-500/40' },
              { label: 'Rejected', color: 'bg-red-500/40' }
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Own requests list */}
        {myRequests.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-300">My Requests</h2>
            <div className="overflow-hidden rounded-xl border border-base-border">
              <table className="w-full text-sm">
                <thead className="bg-base-panel text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Days</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((r) => (
                    <tr key={r.id} className="border-t border-base-border bg-base-card">
                      <td className="px-4 py-3 font-medium text-white">{r.type}</td>
                      <td className="px-4 py-3 text-slate-400">{r.startDate}</td>
                      <td className="px-4 py-3 text-slate-400">{r.endDate}</td>
                      <td className="px-4 py-3 text-slate-400">{r.daysRequested ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showModal && (
          <TimeOffRequestModal
            onClose={() => setShowModal(false)}
            onSubmit={addRequest}
          />
        )}
      </div>
    )
  }

  // ── ADMIN VIEW ──
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Time Off Management</h1>
      </div>

      {/* Admin sub-tabs */}
      <div className="mb-6 flex gap-0 border-b border-base-border">
        {['Time Off', 'Allocation'].map((t) => (
          <button
            key={t}
            onClick={() => setAdminTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              adminTab === t
                ? 'border-b-2 border-accent text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Time Off sub-tab: all requests */}
      {adminTab === 'Time Off' && (
        <div className="overflow-hidden rounded-xl border border-base-border">
          <table className="w-full text-sm">
            <thead className="bg-base-panel text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Status</th>
                {/* § 7 — only admin/HR can approve/reject */}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No time off requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-base-border bg-base-card hover:bg-base-panel/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-white">{r.employee}</td>
                    <td className="px-4 py-3 text-slate-400">{r.startDate}</td>
                    <td className="px-4 py-3 text-slate-400">{r.endDate}</td>
                    <td className="px-4 py-3 text-slate-300">{r.type}</td>
                    <td className="px-4 py-3 text-slate-400">{r.daysRequested ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setStatus(r.id, 'Approved')}
                            className="rounded px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500/10"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setStatus(r.id, 'Rejected')}
                            className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocation sub-tab: per-employee leave balances */}
      {adminTab === 'Allocation' && (
        <div className="overflow-hidden rounded-xl border border-base-border">
          <table className="w-full text-sm">
            <thead className="bg-base-panel text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3 text-right">Paid Time Off</th>
                <th className="px-4 py-3 text-right">Sick Leave</th>
                <th className="px-4 py-3 text-right">Unpaid Leave</th>
              </tr>
            </thead>
            <tbody>
              {leaveAllocations.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-base-border bg-base-card hover:bg-base-panel/60 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white">{a.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-status-present">{a.paidTimeOff}</span>
                    <span className="ml-1 text-xs text-slate-600">days</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-status-leave">{a.sickLeave}</span>
                    <span className="ml-1 text-xs text-slate-600">days</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-slate-300">{a.unpaidLeave}</span>
                    <span className="ml-1 text-xs text-slate-600">days</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BalanceCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card p-5">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-600">days available</p>
    </div>
  )
}
