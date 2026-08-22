import { useState } from 'react'
import {
  Users,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Check,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics.js'
import { useTimeOff, reviewRequest } from '../../hooks/useTimeOff.js'

export default function AdminDashboard() {
  const { overview, trends, departments, loading, error, refetch: refetchAnalytics } = useAnalytics()
  const { requests, refetch: refetchTimeOff } = useTimeOff('Pending')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const pendingRequests = requests.filter((r) => r.status === 'Pending')

  async function handleTriage(id, status) {
    setActionLoadingId(id)
    try {
      await reviewRequest(id, status)
      await Promise.all([refetchAnalytics(), refetchTimeOff()])
    } catch (err) {
      alert(err.message || 'Action failed')
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-subtle">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm font-bold text-red-800">Analytics Error</p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
        <button
          onClick={refetchAnalytics}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const todayPresent = overview?.todayAttendance?.present ?? 0
  const todayTotal = overview?.headcount ?? 1
  const presenceRate = overview?.todayAttendance?.presenceRate ?? 0
  const payrollTotal = overview?.payroll?.totalMonthlyPayroll ?? 0
  const pfTotal = overview?.payroll?.totalPfLiabilities ?? 0
  const pendingCount = overview?.pendingLeavesCount ?? pendingRequests.length

  // Calculate maximum overtime hours for chart scaling
  const maxOvertime = Math.max(...trends.map((t) => t.overtimeHours || 0), 4)

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#5B4FE9]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#5B4FE9]">
              <ShieldCheck className="h-3 w-3" />
              Executive Console
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A1F]">
            Organization Intelligence
          </h1>
          <p className="mt-0.5 text-xs text-[#6B6B76]">
            Real-time workforce health, attendance cadence, and payroll analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-medium text-[#6B6B76]">
            Live Sync Active
          </span>
        </div>
      </div>

      {/* ── 1. Executive KPI Ribbon ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Workforce */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B76]">
              Total Staff
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9]/10 text-[#5B4FE9]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1F]">{overview?.headcount ?? 0}</p>
          <p className="mt-0.5 text-[11px] text-[#6B6B76]">
            Across {departments.length} active departments
          </p>
        </div>

        {/* Presence Rate */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B76]">
              Today&apos;s Presence
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#059669]">{presenceRate}%</p>
          <p className="mt-0.5 text-[11px] text-[#6B6B76]">
            {todayPresent} of {todayTotal} checked in today
          </p>
        </div>

        {/* Monthly Payroll Burn */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B76]">
              Monthly Payroll
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-[#1A1A1F]">
            ₹{payrollTotal.toLocaleString('en-IN')}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6B6B76]">
            + ₹{pfTotal.toLocaleString('en-IN')} statutory PF
          </p>
        </div>

        {/* Action Items */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B76]">
              Pending Actions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#D97706]">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#D97706]">{pendingCount}</p>
          <p className="mt-0.5 text-[11px] text-[#6B6B76]">
            Leave requests awaiting review
          </p>
        </div>
      </div>

      {/* ── 2. Charts Row: 7-Day Trend & Proportional Departments ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance & Overtime 7-Day SVG Trend Visualizer */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle lg:col-span-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#F1F1F4] pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1F]">Workforce Attendance Cadence</h2>
              <p className="text-xs text-[#6B6B76]">7-day daily presence rate and overtime trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#6B6B76]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#5B4FE9]" />
                Presence %
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]" />
                Overtime (Hrs)
              </span>
            </div>
          </div>

          {/* SVG Trend Waveform & Bars */}
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-2 items-end h-44 border-b border-[#EAEAEC] pb-2">
              {trends.map((t, idx) => {
                const presenceHeight = `${Math.max(15, t.presenceRate)}%`
                const overtimeHeight = `${Math.min(100, Math.max(5, (t.overtimeHours / maxOvertime) * 100))}%`

                return (
                  <div key={t.date || idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1.5 w-full justify-center h-full">
                      {/* Presence Bar */}
                      <div
                        style={{ height: presenceHeight }}
                        className="w-4 sm:w-6 rounded-t-md bg-[#5B4FE9] transition-all duration-300 group-hover:brightness-110 relative"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1A1A1F] text-white text-[10px] font-mono py-0.5 px-1.5 rounded whitespace-nowrap z-10 shadow-md">
                          {t.presenceRate}%
                        </div>
                      </div>

                      {/* Overtime Bar */}
                      <div
                        style={{ height: overtimeHeight }}
                        className="w-2.5 sm:w-3.5 rounded-t-md bg-[#F59E0B]/80 transition-all duration-300 group-hover:brightness-110 relative"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1A1A1F] text-white text-[10px] font-mono py-0.5 px-1.5 rounded whitespace-nowrap z-10 shadow-md">
                          {t.overtimeHours}h OT
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-[#6B6B76]">
                      {t.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Proportional Department Breakdown */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
          <div className="border-b border-[#F1F1F4] pb-4 mb-4">
            <h2 className="text-sm font-bold text-[#1A1A1F]">Department Share</h2>
            <p className="text-xs text-[#6B6B76]">Headcount and budget distribution</p>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1A1A1F]">{dept.department}</span>
                  <span className="font-mono text-[#6B6B76]">
                    {dept.employeeCount} staff ({dept.headcountSharePct}%)
                  </span>
                </div>
                {/* Clean Proportional Bar adhering to DESIGN_SYSTEM.md */}
                <div className="h-2 w-full rounded-full bg-[#F4F4F6] overflow-hidden">
                  <div
                    style={{ width: `${Math.max(8, dept.headcountSharePct)}%` }}
                    className="h-full rounded-full bg-[#5B4FE9] transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#92929D] font-mono">
                  <span>Wage share</span>
                  <span>₹{dept.totalWage.toLocaleString('en-IN')} / mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Approval Triage Hub (1-Click Action Queue) ── */}
      <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#F1F1F4] pb-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#1A1A1F]">Leave Approval Triage Hub</h2>
            <p className="text-xs text-[#6B6B76]">
              Instant evaluation queue — actions immediately sync with team schedules and KPIs
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-[#5B4FE9] bg-[#5B4FE9]/10 px-2.5 py-1 rounded-lg">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-xs font-bold text-[#1A1A1F]">All clear! No pending requests</p>
            <p className="mt-0.5 text-[11px] text-[#6B6B76]">
              Any incoming leave or time off requests will appear here for fast triage.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#EAEAEC]">
            <table className="w-full text-xs">
              <thead className="border-b border-[#EAEAEC] bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3 text-right">Instant Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1F4]">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-[#F9F9FB]">
                    <td className="px-5 py-3 font-bold text-[#1A1A1F]">{req.employee}</td>
                    <td className="px-5 py-3 font-medium text-[#6B6B76]">{req.type}</td>
                    <td className="px-5 py-3 font-mono text-[#6B6B76]">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-[#1A1A1F]">
                      {req.daysRequested}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleTriage(req.id, 'Approved')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleTriage(req.id, 'Rejected')}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
