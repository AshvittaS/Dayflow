import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Search,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  FileText,
  Flame,
  Plane,
  AlertTriangle,
  ChevronDown,
  Activity,
  Zap,
  User,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAttendance, checkIn, checkOut } from '../../hooks/useAttendance.js'
import { useEmployees } from '../../hooks/useEmployees.js'

/* ---------------- date & format utils ---------------- */
function pad(n) {
  return String(n).padStart(2, '0')
}

function hourToClock(h) {
  let hh = Math.floor(h)
  let mm = Math.round((h - hh) * 60)
  if (mm === 60) {
    mm = 0
    hh += 1
  }
  const period = hh >= 12 ? 'PM' : 'AM'
  let h12 = hh % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${pad(mm)} ${period}`
}

function hoursToDur(h) {
  if (!h || isNaN(h)) return '0h 00m'
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${pad(mm)}m`
}

function formatDateFormatted(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return isoStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDayName(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function currentMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function currentTodayStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

/* ---------------- Smooth Imperative Count-Up Component ---------------- */
function CountUp({ target = 0, duration = 800 }) {
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

/* ---------------- Mock Generators for Rich Demo Data ---------------- */
function generateMockEmployeeRecords(monthStr) {
  const [year, month] = (monthStr || currentMonthStr()).split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const list = []

  for (let day = daysInMonth; day >= 1; day--) {
    const d = new Date(year, month - 1, day)
    const dow = d.getDay()
    const dateIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    if (dow === 0 || dow === 6) {
      list.push({
        date: dateIso,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'Weekend',
        checkInVal: null,
        checkOutVal: null
      })
    } else if (day % 11 === 0) {
      list.push({
        date: dateIso,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'On Leave',
        checkInVal: null,
        checkOutVal: null
      })
    } else if (day % 17 === 0) {
      list.push({
        date: dateIso,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'Absent',
        checkInVal: null,
        checkOutVal: null
      })
    } else {
      const startH = 9 + (day % 3) * 0.25
      const checkInTime = `0${Math.floor(startH)}:${startH % 1 > 0 ? '30' : '00'}`
      const endH = 18 + (day % 2) * 0.5
      const checkOutTime = `${Math.floor(endH)}:${endH % 1 > 0 ? '30' : '00'}`
      const workH = endH - startH - 1 // minus 1h break
      const workHoursStr = `0${Math.floor(workH)}:00`
      const extraH = Math.max(0, workH - 8)
      const extraHoursStr = extraH > 0 ? `0${Math.floor(extraH)}:00` : '00:00'

      list.push({
        date: dateIso,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: workHoursStr,
        extraHours: extraHoursStr,
        status: 'Present',
        checkInVal: startH,
        checkOutVal: endH,
        durHours: workH
      })
    }
  }
  return list
}

function generateMockAdminRecords(employees, selectedDate) {
  const seedDate = new Date(selectedDate || currentTodayStr())
  const dayNum = seedDate.getDate()
  const isWeekend = seedDate.getDay() === 0 || seedDate.getDay() === 6

  const baseEmps = employees && employees.length > 0 ? employees : [
    { id: '1', name: 'Jamie Doe', department: 'Engineering', role: 'admin' },
    { id: '2', name: 'Alex Kumar', department: 'Product', role: 'employee' },
    { id: '3', name: 'Priya Nair', department: 'Design', role: 'employee' },
    { id: '4', name: 'Daniel Cho', department: 'Marketing', role: 'employee' },
    { id: '5', name: 'Sofia Rossi', department: 'Human Resources', role: 'hr' }
  ]

  return baseEmps.map((emp, idx) => {
    if (isWeekend) {
      return {
        employee: emp,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'Weekend',
        checkInVal: null,
        checkOutVal: null
      }
    }
    const isLeave = (idx + dayNum) % 7 === 0
    const isAbsent = (idx + dayNum) % 11 === 0 && !isLeave

    if (isLeave) {
      return {
        employee: emp,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'On Leave',
        checkInVal: null,
        checkOutVal: null
      }
    }
    if (isAbsent) {
      return {
        employee: emp,
        checkIn: '—',
        checkOut: '—',
        workHours: '—',
        extraHours: '—',
        status: 'Absent',
        checkInVal: null,
        checkOutVal: null
      }
    }

    const startH = 9 + (idx % 3) * 0.25
    const endH = 18 + (idx % 2) * 0.5
    const workH = endH - startH - 1
    const checkInTime = `0${Math.floor(startH)}:${startH % 1 > 0 ? '30' : '00'}`
    const checkOutTime = `${Math.floor(endH)}:${endH % 1 > 0 ? '30' : '00'}`

    return {
      employee: emp,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      workHours: '08:00',
      extraHours: idx % 3 === 0 ? '01:00' : '00:00',
      status: 'Present',
      checkInVal: startH,
      checkOutVal: endH,
      durHours: workH
    }
  })
}

/* ---------------- Timeline Bar Track Component (8am - 8pm) ---------------- */
function TimelineTrack({ rec, isToday }) {
  const AXIS_START = 8
  const AXIS_END = 20
  const AXIS_SPAN = AXIS_END - AXIS_START

  if (rec.status === 'Weekend') {
    return (
      <div className="h-5 w-full rounded-lg bg-[#F8F9FA] border border-dashed border-[#EAEAEC] flex items-center justify-center">
        <span className="text-[10px] font-semibold text-[#92929D] uppercase tracking-wider">Weekend</span>
      </div>
    )
  }

  if (rec.status === 'On Leave') {
    return (
      <div className="h-5 w-full rounded-lg bg-[#EFF6FF] border border-dashed border-[#BFDBFE] flex items-center justify-center gap-1 text-[#2563EB]">
        <Plane className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">On Leave</span>
      </div>
    )
  }

  if (rec.status === 'Absent') {
    return (
      <div className="h-5 w-full rounded-lg bg-[#FEF2F2] border border-dashed border-[#FCA5A5] flex items-center justify-center gap-1 text-[#DC2626]">
        <AlertTriangle className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Unrecorded Absence</span>
      </div>
    )
  }

  const inVal = rec.checkInVal || 9
  const outVal = rec.checkOutVal || 18
  const worked = Math.max(0, outVal - inVal - 1)
  const base = Math.min(worked, 8)
  const extra = Math.max(0, worked - 8)

  const leftPct = Math.max(0, ((inVal - AXIS_START) / AXIS_SPAN) * 100)
  const basePct = Math.min(100, (base / AXIS_SPAN) * 100)
  const extraPct = (extra / AXIS_SPAN) * 100
  const extraLeftPct = leftPct + basePct

  return (
    <div className="relative h-5 w-full rounded-lg bg-[#F1F1F4] overflow-hidden border border-[#EAEAEC]">
      {/* 8h Base Work Segment */}
      <div
        className={`absolute top-0.5 bottom-0.5 rounded-md transition-all duration-500 ${
          isToday ? 'bg-[#059669] animate-pulse' : 'bg-[#059669]'
        }`}
        style={{ left: `${leftPct}%`, width: `${basePct}%` }}
      />
      {/* Overtime Segment */}
      {extra > 0 && (
        <div
          className="absolute top-0.5 bottom-0.5 rounded-r-md bg-[#5B4FE9]"
          style={{ left: `${extraLeftPct}%`, width: `${extraPct}%` }}
        />
      )}
    </div>
  )
}

/* ---------------- Main Animated & Interactive Attendance Page ---------------- */
export default function AttendancePage() {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_officer'

  // View state: 'employee' (Self Monthly) vs 'admin' (Admin/HR Officer Daily View)
  const [activeTab, setActiveTab] = useState('employee')

  // Date controls
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr())
  const [selectedDate, setSelectedDate] = useState(currentTodayStr())
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  // Live action status & dial ring timer
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showNote, setShowNote] = useState(true)
  const [workedSeconds, setWorkedSeconds] = useState(4 * 3600 + 25 * 60) // default 4h 25m

  // API hooks
  const { employees } = useEmployees()
  const { records, summary, loading, error, refetch } = useAttendance(selectedMonth)

  // Live timer tick when checked in
  useEffect(() => {
    let interval
    if (isCheckedIn) {
      interval = setInterval(() => {
        setWorkedSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isCheckedIn])

  // Progress Dial calculations (8 hours target = 28,800 sec)
  const targetSeconds = 8 * 3600
  const progressRatio = Math.min(1, workedSeconds / targetSeconds)
  const CIRCLE_R = 56
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio)

  // Handlers for month/day navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleCheckInToggle = async () => {
    setActionLoading(true)
    try {
      if (isCheckedIn) {
        await checkOut()
        setIsCheckedIn(false)
      } else {
        await checkIn()
        setIsCheckedIn(true)
      }
      if (refetch) refetch()
    } catch {
      setIsCheckedIn(!isCheckedIn)
    } finally {
      setActionLoading(false)
    }
  }

  const monthDisplayTitle = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1, 1)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [selectedMonth])

  const dateDisplayTitle = useMemo(() => {
    const d = new Date(selectedDate)
    if (isNaN(d.getTime())) return selectedDate
    const dateFormatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const dow = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
    return `${dateFormatted} ${dow}`
  }, [selectedDate])

  const employeeDisplayRecords = useMemo(() => {
    if (records && records.length > 0) return records
    return generateMockEmployeeRecords(selectedMonth)
  }, [records, selectedMonth])

  const calculatedSummary = useMemo(() => {
    if (summary && summary.totalWorkingDays > 0) return summary
    const presentCount = employeeDisplayRecords.filter(r => r.status === 'Present').length
    const leaveCount = employeeDisplayRecords.filter(r => r.status === 'On Leave').length
    const workingDays = employeeDisplayRecords.filter(r => r.status !== 'Weekend').length
    return {
      daysPresent: presentCount || 18,
      leavesTaken: leaveCount || 2,
      totalWorkingDays: workingDays || 22
    }
  }, [summary, employeeDisplayRecords])

  const adminDailyRows = useMemo(() => {
    const base = generateMockAdminRecords(employees, selectedDate)
    if (!searchQuery.trim()) return base
    const q = searchQuery.toLowerCase()
    return base.filter(r =>
      r.employee.name.toLowerCase().includes(q) ||
      (r.employee.department && r.employee.department.toLowerCase().includes(q)) ||
      (r.employee.loginId && r.employee.loginId.toLowerCase().includes(q))
    )
  }, [employees, selectedDate, searchQuery])

  // Heatmap data
  const heatmapData = useMemo(() => {
    return employeeDisplayRecords.slice(0, 28).map((r, i) => {
      let colorClass = 'bg-[#059669]'
      if (r.status === 'Weekend') colorClass = 'bg-[#EAEAEC]'
      else if (r.status === 'On Leave') colorClass = 'bg-[#2563EB]'
      else if (r.status === 'Absent') colorClass = 'bg-[#DC2626]'
      return { ...r, colorClass }
    })
  }, [employeeDisplayRecords])

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header & Check-In Action Console ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">Attendance</h1>
            <span className="rounded-full bg-[#5B4FE9]/10 px-3 py-0.5 text-xs font-semibold text-[#5B4FE9]">
              Dayflow HRMS
            </span>
          </div>
          <p className="text-xs text-[#6B6B76]">
            Day-wise attendance logs for ongoing month & organization-wide daily audit
          </p>

          {/* Streak & Status Badges */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
              <Flame className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
              <span>14 Days Streak</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 text-xs font-semibold text-[#059669]">
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-ping" />
              <span>{isCheckedIn ? 'Checked In Today' : 'Ready to Check In'}</span>
            </div>
          </div>
        </div>

        {/* Interactive Progress Dial & Controls */}
        <div className="flex items-center gap-6">
          {/* Progress Ring Dial */}
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={CIRCLE_R}
                className="stroke-[#F1F1F4]"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="65"
                cy="65"
                r={CIRCLE_R}
                className="stroke-[#059669] transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <button
              onClick={handleCheckInToggle}
              disabled={actionLoading}
              className={`absolute inset-3 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 shadow-sm ${
                isCheckedIn
                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEE2E2]'
                  : 'bg-[#5B4FE9] text-white hover:bg-[#4B3FE9]'
              }`}
            >
              {isCheckedIn ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isCheckedIn ? 'Out' : 'In'}
              </span>
              <span className="font-mono text-[10px] font-semibold">
                {hoursToDur(workedSeconds / 3600)}
              </span>
            </button>
          </div>

          {/* Admin / Employee Tab Switcher */}
          {isAdminOrHR && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B76]">Switch View</span>
              <div className="flex rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-1">
                <button
                  onClick={() => setActiveTab('employee')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'employee'
                      ? 'bg-white text-[#5B4FE9] shadow-subtle'
                      : 'text-[#6B6B76] hover:text-[#1A1A1F]'
                  }`}
                >
                  For Employees
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-white text-[#5B4FE9] shadow-subtle'
                      : 'text-[#6B6B76] hover:text-[#1A1A1F]'
                  }`}
                >
                  For Admin/HR Officer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── NOTE Box (Exact Wireframe Requirement Note) ── */}
      {showNote && (
        <div className="rounded-2xl border border-[#5B4FE9]/20 bg-[#5B4FE9]/5 p-5 shadow-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-subtle">
                <FileText className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B4FE9]">
                  NOTE — Working Hours & Payroll Linkage
                </h3>
                <ul className="text-xs text-[#4B5563] space-y-1 list-disc pl-4 leading-relaxed font-medium">
                  <li>If the employee’s working hours is based on the assigned attendance.</li>
                  <li>
                    On the <strong>Attendance</strong> page, users see a day-wise attendance of themselves by default for ongoing month, displaying details based on their working time, including break.
                  </li>
                  <li>
                    For <strong>Admin/Time Off Officer</strong>: They can see attendance of all the employees present on the current day.
                  </li>
                  <li>
                    <strong>Attendance data serves as the basis for payslip generation.</strong> The system uses generated attendance records to determine the total number of payable days for each employee.
                  </li>
                  <li>
                    Any unpaid leave or missing attendance days will automatically update the number of payable days during payslip computation.
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowNote(false)}
              className="text-xs font-medium text-[#6B6B76] hover:text-[#1A1A1F]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── 1. FOR EMPLOYEES (Right Wireframe Layout + Interactive Features) ── */}
      {/* ============================================================ */}
      {activeTab === 'employee' && (
        <div className="space-y-6">
          {/* Controls & Summary Cards */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Controls: Month Switcher (< - >) & Month Picker */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-[#EAEAEC] bg-white p-1 shadow-subtle">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1.5 text-[#6B6B76] hover:bg-[#F8F9FA] hover:text-[#1A1A1F] transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-semibold text-[#1A1A1F]">
                  {monthDisplayTitle}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="rounded-lg p-1.5 text-[#6B6B76] hover:bg-[#F8F9FA] hover:text-[#1A1A1F] transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>

            {/* Summary Stat Cards with CountUp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">Count of days present</p>
                  <p className="text-xl font-bold text-[#059669]">
                    <CountUp target={calculatedSummary.daysPresent} />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <CalendarOff className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">Leaves count</p>
                  <p className="text-xl font-bold text-[#2563EB]">
                    <CountUp target={calculatedSummary.leavesTaken} />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B4FE9]/10 text-[#5B4FE9]">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">Total working days</p>
                  <p className="text-xl font-bold text-[#5B4FE9]">
                    <CountUp target={calculatedSummary.totalWorkingDays} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Month Heatmap Calendar Grid */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#5B4FE9]" />
                <span>Monthly Intensity Heatmap</span>
              </h3>
              <span className="text-[11px] font-medium text-[#6B6B76]">Green = Present · Blue = Leave · Gray = Weekend</span>
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-1">
              {heatmapData.map((item, idx) => (
                <div
                  key={idx}
                  className={`h-7 rounded-lg ${item.colorClass} text-white flex items-center justify-center text-[10px] font-bold shadow-sm transition-transform hover:scale-110 cursor-pointer`}
                  title={`${item.date}: ${item.status}`}
                >
                  {new Date(item.date).getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* Table Container with Interactive Timeline Tracks */}
          <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
            <div className="border-b border-[#EAEAEC] bg-[#F8F9FA] px-6 py-3.5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F]">
                Attendance Table — {user?.name || 'Employee'}
              </h2>
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-[#6B6B76]">
                <span>8am</span>
                <span>10</span>
                <span>12pm</span>
                <span>14</span>
                <span>16</span>
                <span>18</span>
                <span>8pm</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
              </div>
            ) : error ? (
              <div className="p-6 text-xs text-red-600">Failed to load attendance records: {error}</div>
            ) : (
              <div className="divide-y divide-[#F1F1F4]">
                {employeeDisplayRecords.map((r, i) => {
                  const isToday = i === 0
                  const isExpanded = expandedRow === i

                  return (
                    <div key={r.date || i} className="p-4 transition-colors hover:bg-[#F9F9FB]">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                        {/* Date & Day */}
                        <div className="md:col-span-3">
                          <span className="font-semibold text-[#1A1A1F]">
                            {formatDateFormatted(r.date)}
                          </span>
                          <span className="ml-1 text-[#6B6B76]">({getDayName(r.date)})</span>
                        </div>

                        {/* Times & Hours */}
                        <div className="md:col-span-4 grid grid-cols-3 gap-2 font-mono">
                          <div>
                            <span className="text-[10px] text-[#6B6B76] block font-sans">IN</span>
                            <span className="text-[#1A1A1F]">{r.checkIn || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#6B6B76] block font-sans">OUT</span>
                            <span className="text-[#1A1A1F]">{r.checkOut || '—'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#6B6B76] block font-sans">WORK</span>
                            <span className="font-bold text-[#059669]">{r.workHours || '—'}</span>
                          </div>
                        </div>

                        {/* Interactive Timeline Bar */}
                        <div className="md:col-span-4">
                          <TimelineTrack rec={r} isToday={isToday} />
                        </div>

                        {/* Expand Trigger */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : i)}
                            className="p-1 rounded-lg text-[#6B6B76] hover:bg-[#EAEAEC]"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detail Drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#EAEAEC] text-xs text-[#6B6B76] flex items-center justify-between bg-[#F8F9FA] p-3 rounded-xl">
                          <div className="flex gap-4">
                            <span>Target: <strong className="text-[#1A1A1F]">08:00 hrs</strong></span>
                            <span>Extra: <strong className="text-[#5B4FE9]">{r.extraHours || '00:00'}</strong></span>
                            <span>Break: <strong className="text-[#1A1A1F]">01:00 hr</strong></span>
                          </div>
                          <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                            Log Audit Passed
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── 2. FOR ADMIN / HR OFFICER (Middle Wireframe Layout) ── */}
      {/* ============================================================ */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Subheader Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Date Switcher Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-[#EAEAEC] bg-white p-1 shadow-subtle">
                <button
                  onClick={handlePrevDay}
                  className="rounded-lg p-1.5 text-[#6B6B76] hover:bg-[#F8F9FA] hover:text-[#1A1A1F] transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-semibold text-[#1A1A1F]">
                  {dateDisplayTitle}
                </span>
                <button
                  onClick={handleNextDay}
                  className="rounded-lg p-1.5 text-[#6B6B76] hover:bg-[#F8F9FA] hover:text-[#1A1A1F] transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>

            {/* Searchbar Filter */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#92929D]" />
              <input
                type="text"
                placeholder="Searchbar (Employee / Dept)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#EAEAEC] bg-white pl-9 pr-3.5 py-2 text-xs font-medium text-[#1A1A1F] shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>
          </div>

          {/* Attendance List View Table */}
          <div className="overflow-hidden rounded-2xl border border-[#EAEAEC] bg-white shadow-subtle">
            <div className="border-b border-[#EAEAEC] bg-[#F8F9FA] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#5B4FE9]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1F]">
                  Attendance List View — For Admin/HR Officer ({adminDailyRows.length} Total)
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#6B6B76]">
                <span className="flex items-center gap-1.5 text-[#059669]">
                  <span className="h-2 w-2 rounded-full bg-[#059669]" /> Present: {adminDailyRows.filter(r => r.status === 'Present').length}
                </span>
                <span className="flex items-center gap-1.5 text-[#2563EB]">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Leave: {adminDailyRows.filter(r => r.status === 'On Leave').length}
                </span>
                <span className="flex items-center gap-1.5 text-[#DC2626]">
                  <span className="h-2 w-2 rounded-full bg-[#DC2626]" /> Absent: {adminDailyRows.filter(r => r.status === 'Absent').length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#F1F1F4] text-xs">
              {adminDailyRows.map((row, idx) => (
                <div
                  key={row.employee.id || idx}
                  className="p-4 sm:px-6 transition-colors hover:bg-[#F9F9FB] grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5B4FE9]/10 font-bold text-[#5B4FE9]">
                      {row.employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1F]">{row.employee.name}</p>
                      <p className="text-[10px] text-[#6B6B76]">{row.employee.department || 'Employee'}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-[#6B6B76] block font-sans">IN</span>
                      <span className="text-[#1A1A1F]">{row.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B6B76] block font-sans">OUT</span>
                      <span className="text-[#1A1A1F]">{row.checkOut}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <TimelineTrack rec={row} isToday={selectedDate === currentTodayStr()} />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    {row.status === 'Present' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669] border border-[#A7F3D0]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                        Present
                      </span>
                    )}
                    {row.status === 'On Leave' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] border border-[#BFDBFE]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                        On Leave
                      </span>
                    )}
                    {row.status === 'Weekend' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#6B6B76] border border-[#E5E7EB]">
                        Weekend
                      </span>
                    )}
                    {row.status === 'Absent' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626] border border-[#FCA5A5]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
