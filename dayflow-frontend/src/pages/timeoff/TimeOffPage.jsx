import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Calendar, Check, X, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTimeOff, useAllocations, reviewRequest } from '../../hooks/useTimeOff.js'
import { timeOffBalances } from '../../data/mockData.js'
import TimeOffRequestModal from './TimeOffRequestModal.jsx'

const STATUS_STYLE = {
  Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200'
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function calendarHighlight(dateStr, requests) {
  for (const r of requests) {
    if (dateStr >= r.startDate && dateStr <= r.endDate) return r.status
  }
  return null
}

export default function TimeOffPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showModal, setShowModal] = useState(false)
  const [adminTab, setAdminTab] = useState('Time Off')

  const today = new Date()
  const [calYear, setCalYear]   = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  const { requests, loading, error, refetch } = useTimeOff()
  const { allocations, loading: allocLoading } = useAllocations()

  const myRequests = isAdmin ? [] : requests

  async function handleReview(id, status) {
    try {
      await reviewRequest(id, status)
      refetch()
    } catch (err) {
      alert(err.message)
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) }
    else setCalMonth((m) => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) }
    else setCalMonth((m) => m + 1)
  }

  // ── EMPLOYEE VIEW ──
  if (!isAdmin) {
    const cells = buildCalendarDays(calYear, calMonth)
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">My Time Off</h1>
            <p className="mt-1 text-xs text-[#6B6B76]">
              Leave allocations, calendar schedule, and request tracking
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5B4FE9] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#4A3EC8] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Request Time Off</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BalanceCard label="Paid Time Off" value={timeOffBalances['Paid Time Off']} color="text-[#059669]" bg="bg-[#ECFDF5]" />
          <BalanceCard label="Sick Leave" value={timeOffBalances['Sick Leave']} color="text-[#2563EB]" bg="bg-[#EFF6FF]" />
          <BalanceCard label="Unpaid Leave" value={timeOffBalances['Unpaid Leave']} color="text-[#6B6B76]" bg="bg-[#F4F4F6]" />
        </div>

        {/* Calendar */}
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          <div className="flex items-center justify-between border-b border-[#EAEAEC] px-6 py-4">
            <button onClick={prevMonth} className="rounded-lg p-1 text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-[#1A1A1F]">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="rounded-lg p-1 text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-[#EAEAEC] bg-[#F8F9FA]">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-[#6B6B76]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#EAEAEC]">
            {cells.map((day, idx) => {
              if (!day) return <div key={`blank-${idx}`} className="bg-white py-3" />
              const iso = isoDate(calYear, calMonth, day)
              const hl = calendarHighlight(iso, myRequests)
              const isToday = iso === todayIso
              return (
                <div
                  key={iso}
                  className={`flex flex-col items-center justify-center py-3 text-xs ${
                    hl === 'Approved' ? 'bg-emerald-50' : hl === 'Pending' ? 'bg-amber-50' : hl === 'Rejected' ? 'bg-rose-50' : 'bg-white'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full font-semibold ${
                      isToday
                        ? 'bg-[#5B4FE9] text-white shadow-sm'
                        : hl === 'Approved'
                        ? 'text-emerald-700 font-bold'
                        : hl === 'Pending'
                        ? 'text-amber-700 font-bold'
                        : hl === 'Rejected'
                        ? 'text-rose-700 font-bold'
                        : 'text-[#1A1A1F]'
                    }`}
                  >
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 border-t border-[#EAEAEC] px-6 py-3 text-xs text-[#6B6B76]">
            {[{ label: 'Today', color: 'bg-[#5B4FE9]' }, { label: 'Approved', color: 'bg-emerald-500' }, { label: 'Pending', color: 'bg-amber-500' }, { label: 'Rejected', color: 'bg-rose-500' }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
          </div>
        )}

        {!loading && myRequests.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B6B76]">My Recent Requests</h2>
            <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
              <table className="w-full text-xs">
                <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
                  <tr>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">From</th>
                    <th className="px-6 py-3.5">To</th>
                    <th className="px-6 py-3.5">Days</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1F4]">
                  {myRequests.map((r, i) => (
                    <tr key={r.id} className={`transition-colors hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}>
                      <td className="px-6 py-3.5 font-semibold text-[#1A1A1F]">{r.type}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.startDate}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.endDate}</td>
                      <td className="px-6 py-3.5 font-mono text-[#1A1A1F]">{r.daysRequested}</td>
                      <td className="px-6 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[r.status]}`}>
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

        {showModal && <TimeOffRequestModal onClose={() => setShowModal(false)} onSubmitted={refetch} />}
      </div>
    )
  }

  // ── ADMIN VIEW ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">Time Off Management</h1>
          <p className="mt-1 text-xs text-[#6B6B76]">
            Review employee time off requests and inspect leave allocations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#EAEAEC] pb-px">
        {['Time Off', 'Allocation'].map((t) => (
          <button
            key={t}
            onClick={() => setAdminTab(t)}
            className={`relative px-4 py-3 text-xs font-semibold tracking-wide transition-all ${
              adminTab === t ? 'text-[#5B4FE9]' : 'text-[#6B6B76] hover:text-[#1A1A1F]'
            }`}
          >
            {t}
            {adminTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#5B4FE9]" />}
          </button>
        ))}
      </div>

      {adminTab === 'Time Off' && (
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
            </div>
          )}
          {!loading && (
            <table className="w-full text-xs">
              <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Start</th>
                  <th className="px-6 py-3.5">End</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F4]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-[#6B6B76]">
                      No time off requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r, i) => (
                    <tr key={r.id} className={`transition-colors hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}>
                      <td className="px-6 py-3.5 font-bold text-[#1A1A1F]">{r.employee}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.startDate}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.endDate}</td>
                      <td className="px-6 py-3.5 font-medium text-[#1A1A1F]">{r.type}</td>
                      <td className="px-6 py-3.5 font-mono font-semibold text-[#1A1A1F]">{r.daysRequested}</td>
                      <td className="px-6 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {r.status === 'Pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReview(r.id, 'Approved')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(r.id, 'Rejected')}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#92929D]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {adminTab === 'Allocation' && (
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          {allocLoading && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
            </div>
          )}
          {!allocLoading && (
            <table className="w-full text-xs">
              <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5 text-right">Paid Time Off</th>
                  <th className="px-6 py-3.5 text-right">Sick Leave</th>
                  <th className="px-6 py-3.5 text-right">Unpaid Leave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F4]">
                {allocations.map((a, i) => (
                  <tr key={a.id} className={`transition-colors hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}>
                    <td className="px-6 py-3.5 font-bold text-[#1A1A1F]">{a.name}</td>
                    {['Paid Time Off', 'Sick Leave', 'Unpaid Leave'].map((type) => {
                      const al = a.allocations?.[type]
                      return (
                        <td key={type} className="px-6 py-3.5 text-right font-mono">
                          <span className="font-bold text-[#1A1A1F]">{al?.remaining ?? '—'}</span>
                          <span className="ml-1 text-[11px] text-[#92929D]">/ {al?.totalDays ?? '—'}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function BalanceCard({ label, value, color, bg }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Calendar className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[11px] text-[#92929D]">days available</p>
      </div>
    </div>
  )
}
