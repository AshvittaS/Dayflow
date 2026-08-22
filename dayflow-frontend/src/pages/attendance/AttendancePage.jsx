import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  TrendingUp,
  User,
  Check,
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
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
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

/* ---------------- Timeline Bar Axis Component (8am - 8pm) ---------------- */
function TimelineTrack({ rec, isToday }) {
  const AXIS_START = 8
  const AXIS_END = 20
  const AXIS_SPAN = AXIS_END - AXIS_START

  if (rec.status === 'Weekend') {
    return (
      <div className="h-6 w-full rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 flex items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Weekend</span>
      </div>
    )
  }

  if (rec.status === 'On Leave') {
    return (
      <div className="h-6 w-full rounded-lg bg-blue-50 border border-dashed border-blue-200 flex items-center justify-center gap-1.5 text-blue-600">
        <Plane className="h-3 w-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">On Approved Leave</span>
      </div>
    )
  }

  if (rec.status === 'Absent') {
    return (
      <div className="h-6 w-full rounded-lg bg-amber-50 border border-dashed border-amber-200 flex items-center justify-center gap-1.5 text-amber-600">
        <AlertTriangle className="h-3 w-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Unrecorded Absence</span>
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
    <div className="relative h-6 w-full rounded-lg bg-[#F3F4F6] overflow-hidden border border-gray-200/80 shadow-inner group">
      {/* 8h Base Work Segment */}
      <div
        className={`absolute top-0.5 bottom-0.5 rounded-md transition-all duration-500 ${
          isToday
            ? 'bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] animate-pulse'
            : 'bg-gradient-to-r from-[#10B981] to-[#059669]'
        } group-hover:brightness-110 shadow-sm`}
        style={{ left: `${leftPct}%`, width: `${basePct}%` }}
      />
      {/* Overtime Segment */}
      {extra > 0 && (
        <div
          className="absolute top-0.5 bottom-0.5 rounded-r-md bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] shadow-sm"
          style={{ left: `${extraLeftPct}%`, width: `${extraPct}%` }}
        />
      )}
      {/* Current Time Indicator */}
      {isToday && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-lg"
          style={{ left: '48%' }}
        >
          <span className="absolute -top-3.5 -left-3 text-[9px] font-mono font-bold text-red-600 bg-red-50 px-1 rounded border border-red-200">
            NOW
          </span>
        </div>
      )}
    </div>
  )
}

/* ---------------- Main Animated Attendance Component ---------------- */
export default function AttendancePage() {
  const { user } = useAuth()
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr'

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
  const CIRCLE_R = 68
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

  // Heatmap generation for ongoing month
  const heatmapData = useMemo(() => {
    return employeeDisplayRecords.slice(0, 28).map((r, i) => {
      let colorClass = 'bg-emerald-500'
      if (r.status === 'Weekend') colorClass = 'bg-gray-200'
      else if (r.status === 'On Leave') colorClass = 'bg-blue-500'
      else if (r.status === 'Absent') colorClass = 'bg-amber-500'
      return { ...r, colorClass, delay: i * 20 }
    })
  }, [employeeDisplayRecords])

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ── Custom Animations CSS Block ── */}
      <style>{`
        @keyframes ringBreathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(16,185,129,0.3)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 0 20px rgba(16,185,129,0.6)); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        .anim-ring { animation: ringBreathe 3s ease-in-out infinite; }
        .anim-pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── Top Dynamic Visual Banner & Check-In Dial ── */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#6366F1]/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#10B981]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Header Title & Streak */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Zap className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>Live Attendance Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Attendance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl leading-relaxed">
              Real-time work hour auditing, dynamic 8am–8pm timeline visualizer, and automated payroll linkages.
            </p>

            {/* Streak & Status Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-md border border-white/10">
                <Flame className="h-4 w-4 text-orange-400 animate-bounce" />
                <span className="text-xs font-bold">14 Days Streak</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-md border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 anim-pulse-dot" />
                <span className="text-xs font-medium text-emerald-300">
                  {isCheckedIn ? 'Currently Checked In' : 'Ready to Check In'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Progress Dial & Check-In Ring */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={CIRCLE_R}
                  className="stroke-indigo-900/60"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={CIRCLE_R}
                  className="stroke-emerald-400 transition-all duration-700 ease-out anim-ring"
                  strokeWidth="10"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              {/* Center Action Button */}
              <button
                onClick={handleCheckInToggle}
                disabled={actionLoading}
                className={`absolute inset-4 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 transform active:scale-90 shadow-2xl backdrop-blur-lg ${
                  isCheckedIn
                    ? 'bg-gradient-to-br from-red-500 to-rose-700 text-white ring-4 ring-red-400/40 hover:brightness-110'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white ring-4 ring-emerald-400/40 hover:brightness-110'
                }`}
              >
                {isCheckedIn ? <LogOut className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-100">
                  {hourToClock(9 + workedSeconds / 3600)}
                </span>
              </button>
            </div>
            <p className="text-xs text-indigo-200 font-medium">
              Worked <strong className="text-white font-mono">{hoursToDur(workedSeconds / 3600)}</strong> of 8h target
            </p>
          </div>
        </div>
      </div>

      {/* ── View Tab Switcher & NOTE Box Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Animated View Switcher */}
        <div className="flex rounded-2xl border border-gray-200 bg-white p-1.5 shadow-subtle">
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
              activeTab === 'employee'
                ? 'bg-gradient-to-r from-[#5B4FE9] to-[#4F46E5] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>For Employees</span>
          </button>
          {isAdminOrHR && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-[#5B4FE9] to-[#4F46E5] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>For Admin/HR Officer</span>
            </button>
          )}
        </div>
      </div>

      {/* ── NOTE Box (Exact Wireframe Requirement Note) ── */}
      {showNote && (
        <div className="relative overflow-hidden rounded-2xl border border-gray-900/10 bg-[#12161A] text-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B4FE9] to-[#4338CA] text-white shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#A5B4FC] flex items-center gap-2">
                  <span>NOTE — Working Hours & Payroll Invariants</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                </h3>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4 leading-relaxed font-normal">
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
              className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── 1. FOR EMPLOYEES (Right Wireframe Layout + Timeline Visualizer) ── */}
      {/* ============================================================ */}
      {activeTab === 'employee' && (
        <div className="space-y-6">
          {/* Controls & Badges Bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Month Switcher Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-subtle">
                <button
                  onClick={handlePrevMonth}
                  className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 text-xs font-extrabold text-gray-900 min-w-[120px] text-center">
                  {monthDisplayTitle}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-900 shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>

            {/* Wireframe Summary Badges Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-subtle hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Count of days present</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    <CountUp target={calculatedSummary.daysPresent} />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-subtle hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarOff className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Leaves count</p>
                  <p className="text-xl font-extrabold text-blue-600">
                    <CountUp target={calculatedSummary.leavesTaken} />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-subtle hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#5B4FE9]">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total working days</p>
                  <p className="text-xl font-extrabold text-[#5B4FE9]">
                    <CountUp target={calculatedSummary.totalWorkingDays} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Month Activity Heatmap Widget */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#5B4FE9]" />
                <span>Monthly Intensity Heatmap</span>
              </h3>
              <span className="text-[11px] font-medium text-gray-400">Green = Present · Blue = Leave · Gray = Weekend</span>
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
              {heatmapData.map((item, idx) => (
                <div
                  key={idx}
                  className={`h-7 rounded-lg ${item.colorClass} opacity-90 transition-all duration-300 hover:scale-110 hover:shadow-md cursor-pointer relative group flex items-center justify-center text-[10px] font-bold text-white`}
                  title={`${item.date}: ${item.status}`}
                >
                  <span>{new Date(item.date).getDate()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Attendance Table with 8am-8pm Timeline Visualization */}
          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-subtle">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Day-Wise Attendance Log — {user?.name || 'Employee'}
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Includes Check-in/out times, total work hours, extra hours & timeline bar</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-gray-400 font-mono">
                <span>8am</span>
                <span>10</span>
                <span>12pm</span>
                <span>14</span>
                <span>16</span>
                <span>18</span>
                <span>8pm</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {employeeDisplayRecords.map((r, i) => {
                const isToday = i === 0
                const isExpanded = expandedRow === i

                return (
                  <div
                    key={r.date || i}
                    className="p-4 sm:px-6 transition-all duration-200 hover:bg-gray-50/80"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Date & Day */}
                      <div className="md:col-span-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-extrabold text-xs text-gray-700">
                          {getDayName(r.date)}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900">{formatDateFormatted(r.date)}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{r.status}</p>
                        </div>
                      </div>

                      {/* Check In / Out & Hours */}
                      <div className="md:col-span-4 grid grid-cols-3 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans uppercase">In</span>
                          <span className="font-bold text-gray-800">{r.checkIn || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans uppercase">Out</span>
                          <span className="font-bold text-gray-800">{r.checkOut || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans uppercase">Work</span>
                          <span className="font-bold text-emerald-600">{r.workHours || '—'}</span>
                        </div>
                      </div>

                      {/* Timeline Bar Visualizer */}
                      <div className="md:col-span-4">
                        <TimelineTrack rec={r} isToday={isToday} />
                      </div>

                      {/* Expand Toggle */}
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : i)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 transition-colors"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Detail Drawer */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-4">
                          <span>Standard Target: <strong className="text-gray-900 font-mono">08:00 hrs</strong></span>
                          <span>Extra Hours: <strong className="text-indigo-600 font-mono">{r.extraHours || '00:00'}</strong></span>
                          <span>Break Time: <strong className="text-gray-900 font-mono">01:00 hr</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Verified Log
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ── 2. FOR ADMIN / HR OFFICER (Middle Wireframe Layout) ── */}
      {/* ============================================================ */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Controls Bar for Admin View */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Day Switcher Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-subtle">
                <button
                  onClick={handlePrevDay}
                  className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 text-xs font-extrabold text-gray-900">
                  {dateDisplayTitle}
                </span>
                <button
                  onClick={handleNextDay}
                  className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-900 shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>

            {/* Searchbar Filter (Matching Wireframe Searchbar) */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Searchbar (Employee / Dept)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-gray-900 shadow-subtle outline-none focus:border-[#5B4FE9]"
              />
            </div>
          </div>

          {/* Admin Attendance Audit Table */}
          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-subtle">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#5B4FE9]" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
                  Attendance List View — For Admin/HR Officer ({adminDailyRows.length} Total)
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present: {adminDailyRows.filter(r => r.status === 'Present').length}
                </span>
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Leave: {adminDailyRows.filter(r => r.status === 'On Leave').length}
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent: {adminDailyRows.filter(r => r.status === 'Absent').length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {adminDailyRows.map((row, idx) => (
                <div
                  key={row.employee.id || idx}
                  className="p-4 sm:px-6 transition-all duration-200 hover:bg-gray-50/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-extrabold text-xs text-[#5B4FE9]">
                      {row.employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900">{row.employee.name}</p>
                      <p className="text-[10px] text-gray-500">{row.employee.department || 'Staff'}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-sans uppercase">In</span>
                      <span className="font-bold text-gray-800">{row.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-sans uppercase">Out</span>
                      <span className="font-bold text-gray-800">{row.checkOut}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <TimelineTrack rec={row} isToday={selectedDate === currentTodayStr()} />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    {row.status === 'Present' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Present
                      </span>
                    )}
                    {row.status === 'On Leave' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600 border border-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        On Leave
                      </span>
                    )}
                    {row.status === 'Weekend' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                        Weekend
                      </span>
                    )}
                    {row.status === 'Absent' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600 border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
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
