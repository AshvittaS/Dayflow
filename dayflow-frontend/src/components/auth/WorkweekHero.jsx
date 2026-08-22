import { useState, useEffect, useRef } from 'react'

export default function WorkweekHero({ mode = 'signin' }) {
  const [timeString, setTimeString] = useState('')
  const [activeDayIndex, setActiveDayIndex] = useState(2) // Default Wednesday
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const panelRef = useRef(null)

  // Live real-time clock
  useEffect(() => {
    function updateTime() {
      const now = new Date()
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  function handleMouseMove(e) {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const workdays = [
    { day: 'Mon', full: 'Monday', attendance: '96%', count: '46/48', status: 'Shift Open', barHeight: '88%' },
    { day: 'Tue', full: 'Tuesday', attendance: '98%', count: '47/48', status: 'Peak Flow', barHeight: '96%' },
    { day: 'Wed', full: 'Wednesday', attendance: '94%', count: '45/48', status: 'Active Cadence', barHeight: '92%' },
    { day: 'Thu', full: 'Thursday', attendance: '92%', count: '44/48', status: 'Deep Work', barHeight: '85%' },
    { day: 'Fri', full: 'Friday', attendance: '90%', count: '43/48', status: 'Sprint Sync', barHeight: '80%' },
    { day: 'Sat', full: 'Saturday', attendance: '12%', count: '6/48', status: 'On-Call', barHeight: '20%' },
    { day: 'Sun', full: 'Sunday', attendance: '0%', count: '0/48', status: 'Rest Cycle', barHeight: '8%' },
  ]

  const activeDay = workdays[activeDayIndex] || workdays[2]

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#F4F4F7] border-r border-[#EAEAEC] p-12 text-[#1A1A1F] select-none"
    >
      {/* ── Subtle Ambient Light Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(91, 79, 233, 0.08), rgba(16, 185, 129, 0.03) 40%, transparent 75%)`,
        }}
      />

      {/* Decorative accent blurs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#5B4FE9]/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#10B981]/10 blur-[100px]"
      />

      {/* ── Top Bar: Logo & Live Chrono-Ticker ── */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-[0_4px_14px_rgba(91,79,233,0.35)] ring-1 ring-white">
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-[#1A1A1F]">
                Day<span className="text-[#5B4FE9]">flow</span>
              </span>
              <span className="rounded bg-[#5B4FE9]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#5B4FE9]">
                HRMS
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#6B6B76]">
              Human Cadence & Presence System
            </p>
          </div>
        </div>

        {/* Live Synchronized Clock */}
        <div className="flex items-center gap-2.5 rounded-full border border-[#EAEAEC] bg-white px-3.5 py-1.5 shadow-subtle">
          <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#1A1A1F]">
            {timeString || '09:00:00 AM'}
          </span>
          <span className="border-l border-[#EAEAEC] pl-2 font-mono text-[10px] uppercase font-bold text-[#6B6B76]">
            IST • LIVE
          </span>
        </div>
      </div>

      {/* ── Center: Living Workweek & Presence Matrix ── */}
      <div className="relative z-10 my-8 space-y-6">
        {/* Editorial Headline */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5B4FE9]/20 bg-[#5B4FE9]/10 px-3 py-1 text-xs font-bold text-[#5B4FE9] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B4FE9]" />
            {mode === 'signup' ? 'Enterprise Workspace Provisioning' : 'Living Presence & Workday Rhythm'}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1F] leading-tight">
            {mode === 'signup' ? (
              <>
                Orchestrate your company’s <br />
                <span className="text-[#5B4FE9]">presence & rhythm.</span>
              </>
            ) : (
              <>
                Where work happens in <br />
                <span className="text-[#5B4FE9]">uninterrupted flow.</span>
              </>
            )}
          </h2>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#6B6B76]">
            {mode === 'signup'
              ? 'Provision the centralized HR architecture for your enterprise. Manage attendance, shifts, leave governance, and payroll from one unified cockpit.'
              : 'Sign in to access your personal dashboard, log attendance timestamps, manage time-off requests, and monitor your monthly payroll breakdown.'}
          </p>
        </div>

        {/* ── Signature Visual Motif: 7-Day Living Workweek Card ── */}
        <div className="rounded-2xl border border-[#EAEAEC] bg-white p-5 shadow-subtle transition-all duration-300 hover:shadow-cardHover hover:border-[#5B4FE9]/30">
          {/* Header of the Cadence Widget */}
          <div className="flex items-center justify-between border-b border-[#F1F1F4] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9]/10 text-[#5B4FE9]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1A1A1F]">
                  Weekly Cadence & Team Presence
                </h3>
                <p className="font-mono text-[11px] text-[#6B6B76]">
                  Sprint Cycle • 48 Total Members
                </p>
              </div>
            </div>
            {/* Live active indicator badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#059669]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
              <span>94.2% In Flow</span>
            </div>
          </div>

          {/* Interactive 7-Day Frequency Bars */}
          <div className="mt-5 grid grid-cols-7 gap-2.5 h-36 items-end">
            {workdays.map((item, idx) => {
              const isSelected = activeDayIndex === idx
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  onMouseEnter={() => setActiveDayIndex(idx)}
                  className={`group relative flex flex-col items-center justify-end h-full rounded-xl transition-all duration-200 p-1.5 ${
                    isSelected
                      ? 'bg-[#5B4FE9]/10 ring-1 ring-[#5B4FE9]/30'
                      : 'hover:bg-[#F4F4F6]'
                  }`}
                >
                  {/* Attendance percentage tooltip on hover */}
                  <span
                    className={`absolute -top-7 rounded bg-[#1A1A1F] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white transition-all duration-150 shadow-md ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                  >
                    {item.attendance}
                  </span>

                  {/* Animated Bar Column */}
                  <div className="relative w-full rounded-lg bg-[#F1F1F4] overflow-hidden flex flex-col justify-end" style={{ height: '90px' }}>
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ease-out ${
                        isSelected
                          ? 'bg-[#5B4FE9] shadow-sm'
                          : idx < 5
                          ? 'bg-[#5B4FE9]/60 group-hover:bg-[#5B4FE9]'
                          : 'bg-[#D5D5DC]'
                      }`}
                      style={{ height: item.barHeight }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 font-mono text-[11px] font-bold transition-colors ${
                      isSelected ? 'text-[#5B4FE9]' : 'text-[#6B6B76] group-hover:text-[#1A1A1F]'
                    }`}
                  >
                    {item.day}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Day Detail Micro-Bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3.5 py-2 border border-[#EAEAEC]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A1A1F]">
                {activeDay.full}
              </span>
              <span className="font-mono text-[11px] text-[#6B6B76]">
                ({activeDay.count} active)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[#059669]">
                {activeDay.status}
              </span>
              <div className="h-3 w-px bg-[#EAEAEC]" />
              <span className="font-mono text-xs font-bold text-[#5B4FE9]">
                {activeDay.attendance} Attendance
              </span>
            </div>
          </div>
        </div>

        {/* ── Live Presence Metric Badges ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#EAEAEC] bg-white p-3.5 shadow-subtle">
            <p className="font-mono text-[10px] font-bold uppercase text-[#6B6B76]">Avg Check-In</p>
            <p className="mt-1 font-mono text-sm font-bold text-[#1A1A1F]">08:54 AM</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#059669]">⚡ 98% On-time</p>
          </div>
          <div className="rounded-xl border border-[#EAEAEC] bg-white p-3.5 shadow-subtle">
            <p className="font-mono text-[10px] font-bold uppercase text-[#6B6B76]">Leave Balance</p>
            <p className="mt-1 font-mono text-sm font-bold text-[#1A1A1F]">Real-Time</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#2563EB]">1-Click Workflow</p>
          </div>
          <div className="rounded-xl border border-[#EAEAEC] bg-white p-3.5 shadow-subtle">
            <p className="font-mono text-[10px] font-bold uppercase text-[#6B6B76]">Security</p>
            <p className="mt-1 font-mono text-sm font-bold text-[#1A1A1F]">Role-Gated</p>
            <p className="mt-0.5 text-[10px] font-semibold text-[#5B4FE9]">Admin Controlled</p>
          </div>
        </div>
      </div>

      {/* ── Bottom Footnote ── */}
      <div className="relative z-10 flex items-center justify-between border-t border-[#EAEAEC] pt-4 text-xs text-[#6B6B76]">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-[#5B4FE9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>Enterprise-grade encryption & ISO 27001 compliance</span>
        </div>
        <span className="font-mono text-[11px] text-[#9AA4AD]">v2.4.0-stable</span>
      </div>
    </div>
  )
}
