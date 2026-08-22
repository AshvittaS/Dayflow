import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  X,
  Clock,
  Eye,
  Plane,
  Activity,
  ShieldCheck,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTimeOff, useAllocations, reviewRequest } from '../../hooks/useTimeOff.js'
import { timeOffBalances } from '../../data/mockData.js'
import TimeOffRequestModal from './TimeOffRequestModal.jsx'
import LeaveDetailsModal from '../../components/modals/LeaveDetailsModal.jsx'

/* ─────────────────── Constants ─────────────────── */
const STATUS_STYLE = {
  Pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200'
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

/* ─────────────────── Helpers ─────────────────── */
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

/* ─────────────────── Smooth CountUp ─────────────────── */
function CountUp({ target = 0, duration = 700 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const num = Number(target) || 0
    const start = performance.now()
    let raf
    function tick(now) {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = String(Math.round(eased * num))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return <span ref={ref}>0</span>
}

/* ─────────────────── Balance Card ─────────────────── */
function BalanceCard({ label, value, color, bg, icon: Icon, accentRing }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-subtle transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${accentRing}`}
    >
      {/* Glowing background blob on hover */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${bg} opacity-40 blur-2xl transition-all duration-300 group-hover:opacity-70 group-hover:scale-125`} />

      <div className="relative flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-[#F8F9FA] border border-[#EAEAEC] px-2 py-0.5 text-[10px] font-semibold text-[#6B6B76]">
          days left
        </span>
      </div>

      <div className="relative mt-4">
        <p className={`text-3xl font-bold tracking-tight ${color}`}>
          <CountUp target={value} />
        </p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
      </div>

      {/* Progress bar showing used vs allocated */}
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#EAEAEC]">
        <div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')} transition-all duration-700`}
          style={{ width: `${Math.min(100, (value / 21) * 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ─────────────────── Status Badge ─────────────────── */
function StatusBadge({ status }) {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 text-[11px] font-semibold text-[#059669]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
        Approved
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
      Rejected
    </span>
  )
}

/* ─────────────────── Main Component ─────────────────── */
export default function TimeOffPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_officer'
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminTab, setAdminTab] = useState('Time Off')

  const today = new Date()
  const [calYear, setCalYear]   = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [hoveredDay, setHoveredDay] = useState(null)
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
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  /* ── EMPLOYEE VIEW ── */
  if (!isAdmin) {
    const cells = buildCalendarDays(calYear, calMonth)

    return (
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">My Time Off</h1>
            <p className="mt-1 text-xs text-[#6B6B76]">
              Leave allocations, calendar schedule, and request tracking
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5B4FE9] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#4A3EC8] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Request Time Off</span>
          </button>
        </div>

        {/* Animated Balance Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BalanceCard
            label="Paid Time Off"
            value={timeOffBalances['Paid Time Off']}
            color="text-[#059669]"
            bg="bg-[#ECFDF5]"
            icon={Plane}
            accentRing="border-[#EAEAEC] hover:border-[#059669]/30"
          />
          <BalanceCard
            label="Sick Leave"
            value={timeOffBalances['Sick Leave']}
            color="text-[#2563EB]"
            bg="bg-[#EFF6FF]"
            icon={Activity}
            accentRing="border-[#EAEAEC] hover:border-[#2563EB]/30"
          />
          <BalanceCard
            label="Unpaid Leave"
            value={timeOffBalances['Unpaid Leave']}
            color="text-[#6B6B76]"
            bg="bg-[#F4F4F6]"
            icon={Clock}
            accentRing="border-[#EAEAEC] hover:border-[#6B6B76]/30"
          />
        </div>

        {/* Interactive Calendar */}
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b border-[#EAEAEC] bg-[#F8F9FA] px-6 py-4">
            <button
              onClick={prevMonth}
              className="rounded-xl border border-[#EAEAEC] bg-white p-1.5 text-[#6B6B76] shadow-subtle hover:bg-[#5B4FE9] hover:text-white hover:border-[#5B4FE9] transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#5B4FE9]" />
              <span className="text-sm font-bold text-[#1A1A1F]">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="rounded-xl border border-[#EAEAEC] bg-white p-1.5 text-[#6B6B76] shadow-subtle hover:bg-[#5B4FE9] hover:text-white hover:border-[#5B4FE9] transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 border-b border-[#EAEAEC] bg-[#F8F9FA]">
            {DAY_LABELS.map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#6B6B76]">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-[#EAEAEC] p-px">
            {cells.map((day, idx) => {
              if (!day) return <div key={`blank-${idx}`} className="bg-white min-h-[52px]" />
              const iso = isoDate(calYear, calMonth, day)
              const hl = calendarHighlight(iso, myRequests)
              const isToday = iso === todayIso
              const isHovered = hoveredDay === iso

              return (
                <div
                  key={iso}
                  onMouseEnter={() => setHoveredDay(iso)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative flex flex-col items-center justify-center min-h-[52px] cursor-default transition-all duration-150 ${
                    hl === 'Approved' ? 'bg-emerald-50 hover:bg-emerald-100'
                    : hl === 'Pending' ? 'bg-amber-50 hover:bg-amber-100'
                    : hl === 'Rejected' ? 'bg-rose-50 hover:bg-rose-100'
                    : 'bg-white hover:bg-[#F8F9FA]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isToday
                        ? 'bg-[#5B4FE9] text-white shadow-sm scale-110'
                        : hl === 'Approved'
                        ? 'text-emerald-700 font-bold'
                        : hl === 'Pending'
                        ? 'text-amber-700 font-bold'
                        : hl === 'Rejected'
                        ? 'text-rose-700 font-bold line-through decoration-rose-400'
                        : 'text-[#1A1A1F]'
                    }`}
                  >
                    {day}
                  </span>

                  {/* Status dot below date */}
                  {hl && (
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      hl === 'Approved' ? 'bg-emerald-500'
                      : hl === 'Pending' ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border-t border-[#EAEAEC] px-6 py-3">
            {[
              { label: 'Today', color: 'bg-[#5B4FE9]' },
              { label: 'Approved', color: 'bg-emerald-500' },
              { label: 'Pending', color: 'bg-amber-400' },
              { label: 'Rejected', color: 'bg-rose-500' }
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[#6B6B76]">
                <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests Table */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
          </div>
        )}

        {!loading && myRequests.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              My Recent Requests
            </h2>
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
                    <tr
                      key={r.id}
                      className={`transition-all duration-150 hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-[#1A1A1F]">{r.type}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.startDate}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.endDate}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-[#1A1A1F]">{r.daysRequested}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && myRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#EAEAEC] bg-[#F8F9FA] py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-[#5B4FE9]">
              <Plane className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-[#1A1A1F]">No requests yet</p>
            <p className="text-xs text-[#6B6B76]">Click "Request Time Off" to submit your first leave request.</p>
          </div>
        )}

        {showModal && <TimeOffRequestModal onClose={() => setShowModal(false)} onSubmitted={refetch} />}
      </div>
    )
  }

  /* ── ADMIN VIEW ── */
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">Time Off Management</h1>
          <p className="mt-1 text-xs text-[#6B6B76]">
            Review employee time off requests and inspect leave allocations
          </p>
        </div>

        {/* Summary Chips */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">
              {requests.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            <span className="text-xs font-semibold text-[#059669]">
              {requests.filter(r => r.status === 'Approved').length} Approved
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-1 w-fit">
        {[
          { label: 'Time Off', icon: Plane },
          { label: 'Allocation', icon: Users }
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setAdminTab(label)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              adminTab === label
                ? 'bg-white text-[#5B4FE9] shadow-subtle'
                : 'text-[#6B6B76] hover:text-[#1A1A1F]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Time Off Requests Table */}
      {adminTab === 'Time Off' && (
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          <div className="border-b border-[#EAEAEC] bg-[#F8F9FA] px-6 py-3.5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#5B4FE9]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F]">
              All Leave Requests ({requests.length})
            </h2>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
            </div>
          )}

          {!loading && (
            <table className="w-full text-xs">
              <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">From</th>
                  <th className="px-6 py-3.5">To</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F4]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-xs text-[#92929D]">
                      <div className="flex flex-col items-center gap-3">
                        <Plane className="h-8 w-8 text-[#EAEAEC]" />
                        <span>No time off requests submitted yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`group transition-all duration-150 hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-[10px] font-bold text-[#5B4FE9]">
                            {String(r.employee || 'E').split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <span className="font-semibold text-[#1A1A1F]">{r.employee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-[#1A1A1F]">{r.type}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.startDate}</td>
                      <td className="px-6 py-3.5 font-mono text-[#6B6B76]">{r.endDate}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-[#1A1A1F]">{r.daysRequested}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAEAEC] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1F] hover:bg-[#EEEDFC] hover:text-[#5B4FE9] hover:border-[#5B4FE9]/40 shadow-subtle transition-all active:scale-95"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#5B4FE9]" />
                          <span>{r.status === 'Pending' ? 'Evaluate' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Allocation Table */}
      {adminTab === 'Allocation' && (
        <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
          <div className="border-b border-[#EAEAEC] bg-[#F8F9FA] px-6 py-3.5 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#5B4FE9]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F]">
              Leave Allocations ({allocations.length} Employees)
            </h2>
          </div>

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
                  <th className="px-6 py-3.5">Paid Time Off</th>
                  <th className="px-6 py-3.5">Sick Leave</th>
                  <th className="px-6 py-3.5">Unpaid Leave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F4]">
                {allocations.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`transition-all duration-150 hover:bg-[#F9F9FB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-[10px] font-bold text-[#5B4FE9]">
                          {String(a.name || 'E').split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <span className="font-semibold text-[#1A1A1F]">{a.name}</span>
                      </div>
                    </td>
                    {['Paid Time Off', 'Sick Leave', 'Unpaid Leave'].map(type => {
                      const al = a.allocations?.[type]
                      const remaining = al?.remaining ?? null
                      const total = al?.totalDays ?? null
                      const usedPct = remaining !== null && total ? ((total - remaining) / total) * 100 : 0

                      return (
                        <td key={type} className="px-6 py-3.5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#1A1A1F] text-sm">{remaining ?? '—'}</span>
                              <span className="text-[11px] text-[#92929D]">/ {total ?? '—'} days</span>
                            </div>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#EAEAEC]">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  type === 'Paid Time Off' ? 'bg-[#059669]'
                                  : type === 'Sick Leave' ? 'bg-[#2563EB]'
                                  : 'bg-[#92929D]'
                                }`}
                                style={{ width: `${100 - usedPct}%` }}
                              />
                            </div>
                          </div>
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

      {/* Leave Evaluation Modal */}
      {selectedRequest && (
        <LeaveDetailsModal
          request={selectedRequest}
          onReview={async (id, status) => {
            await handleReview(id, status)
          }}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
}
