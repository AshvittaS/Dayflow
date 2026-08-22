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

  // Interactive mouse ambient tracking
  function handleMouseMove(e) {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const workdays = [
    { day: 'Mon', full: 'Monday', attendance: '96%', count: '46/48', status: 'Shift Open', barHeight: '88%', active: false },
    { day: 'Tue', full: 'Tuesday', attendance: '98%', count: '47/48', status: 'Peak Flow', barHeight: '96%', active: false },
    { day: 'Wed', full: 'Wednesday', attendance: '94%', count: '45/48', status: 'Active Cadence', barHeight: '92%', active: true },
    { day: 'Thu', full: 'Thursday', attendance: '92%', count: '44/48', status: 'Deep Work', barHeight: '85%', active: false },
    { day: 'Fri', full: 'Friday', attendance: '90%', count: '43/48', status: 'Sprint Sync', barHeight: '80%', active: false },
    { day: 'Sat', full: 'Saturday', attendance: '12%', count: '6/48', status: 'On-Call', barHeight: '20%', active: false },
    { day: 'Sun', full: 'Sunday', attendance: '0%', count: '0/48', status: 'Rest Cycle', barHeight: '8%', active: false },
  ]

  const activeDay = workdays[activeDayIndex] || workdays[2]

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#0e1017] border-r border-[#262a36] p-12 text-[#f8fafc] select-none"
    >
      {/* ── Ambient Interactive Radial Background ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 107, 74, 0.12), rgba(245, 158, 11, 0.04) 40%, transparent 75%)`,
        }}
      />
      
      {/* Subtle background grid pattern representing time slots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative accent wave glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[#ff6b4a]/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#f59e0b]/10 blur-[120px]"
      />

      {/* ── Top Bar: Logo & Live Chrono-Ticker ── */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Brand Logo with living glyph */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#e85d3b] shadow-lg shadow-[#ff6b4a]/25 ring-1 ring-white/20">
            {/* Custom cadence wave glyph */}
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h3l3-7 4 14 3-7h5" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Day<span className="text-[#ff6b4a]">flow</span>
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#ff6b4a]">
                HRMS 2.0
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#8e95a5]">
              Human Cadence & Presence System
            </p>
          </div>
        </div>

        {/* Live Synchronized Chrono-Ticker */}
        <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#151821]/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
          <div className="flex h-2 w-2 items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
          </div>
          <span className="font-mono text-xs font-medium tracking-wider text-[#f8fafc]">
            {timeString || '09:00:00 AM'}
          </span>
          <span className="border-l border-white/15 pl-2 font-mono text-[10px] uppercase text-[#8e95a5]">
            IST • SYNCED
          </span>
        </div>
      </div>

      {/* ── Center: Living Workweek & Presence Matrix ── */}
      <div className="relative z-10 my-8 space-y-6">
        {/* Editorial Headline */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b4a]/25 bg-[#ff6b4a]/10 px-3 py-1 text-xs font-semibold text-[#ff6b4a] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b4a]" />
            {mode === 'signup' ? 'Enterprise Workspace Provisioning' : 'Living Presence & Workday Rhythm'}
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white leading-tight">
            {mode === 'signup' ? (
              <>
                Orchestrate your company’s <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#f59e0b] to-[#ff6b4a]">
                  presence & rhythm.
                </span>
              </>
            ) : (
              <>
                Where work happens in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#f59e0b] to-[#ff6b4a]">
                  uninterrupted flow.
                </span>
              </>
            )}
          </h2>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#8e95a5]">
            {mode === 'signup'
              ? 'Provision the centralized HR architecture for your enterprise. Manage attendance, shifts, leave governance, and payroll from one unified cockpit.'
              : 'Sign in to access your personal dashboard, log attendance timestamps, manage time-off requests, and monitor your monthly payroll breakdown.'}
          </p>
        </div>

        {/* ── Signature Visual Motif: 7-Day Living Workweek Grid ── */}
        <div className="rounded-2xl border border-white/10 bg-[#141720]/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#ff6b4a]/30">
          {/* Header of the Cadence Widget */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff6b4a]/15 text-[#ff6b4a]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-white">
                  Weekly Cadence & Team Presence
                </h3>
                <p className="font-mono text-[11px] text-[#8e95a5]">
                  Sprint Cycle • 48 Total Members
                </p>
              </div>
            </div>
            {/* Live active indicator badge */}
            <div className="flex items-center gap-1.5 rounded-md border border-[#10b981]/30 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
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
                      ? 'bg-white/10 ring-1 ring-[#ff6b4a]/50'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Attendance percentage tooltip on hover */}
                  <span
                    className={`absolute -top-7 rounded bg-[#1e222d] border border-white/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white transition-all duration-150 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                  >
                    {item.attendance}
                  </span>

                  {/* Animated Bar Column */}
                  <div className="relative w-full rounded-lg bg-white/5 overflow-hidden flex flex-col justify-end" style={{ height: '90px' }}>
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ease-out ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#ff6b4a] to-[#f59e0b] shadow-lg shadow-[#ff6b4a]/30'
                          : idx < 5
                          ? 'bg-gradient-to-t from-[#2a303f] to-[#3e475e] group-hover:from-[#ff6b4a]/50 group-hover:to-[#f59e0b]/50'
                          : 'bg-white/10'
                      }`}
                      style={{ height: item.barHeight }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 font-mono text-[11px] font-semibold transition-colors ${
                      isSelected ? 'text-[#ff6b4a]' : 'text-[#8e95a5] group-hover:text-white'
                    }`}
                  >
                    {item.day}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Day Detail Micro-Bar */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#1b1f2b] px-3.5 py-2 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold text-white">
                {activeDay.full}
              </span>
              <span className="font-mono text-[11px] text-[#8e95a5]">
                ({activeDay.count} active)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-[#10b981]">
                {activeDay.status}
              </span>
              <div className="h-3 w-px bg-white/10" />
              <span className="font-mono text-xs font-bold text-[#ff6b4a]">
                {activeDay.attendance} Attendance
              </span>
            </div>
          </div>
        </div>

        {/* ── Live Presence Metric Badges ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-[#141720]/80 p-3 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase text-[#8e95a5]">Avg Check-In</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">08:54 AM</p>
            <p className="mt-0.5 text-[10px] text-[#10b981]">⚡ 98% On-time</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#141720]/80 p-3 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase text-[#8e95a5]">Leave Balance</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">Real-Time</p>
            <p className="mt-0.5 text-[10px] text-[#f59e0b]">1-Click Workflow</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#141720]/80 p-3 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase text-[#8e95a5]">Security</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">Role-Gated</p>
            <p className="mt-0.5 text-[10px] text-[#ff6b4a]">Admin Controlled</p>
          </div>
        </div>
      </div>

      {/* ── Bottom Quote / Security Trust Footnote ── */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#8e95a5]">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
            <svg className="h-3 w-3 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <span>Enterprise-grade encryption & ISO 27001 compliance</span>
        </div>
        <span className="font-mono text-[11px] text-white/40">v2.4.0-stable</span>
      </div>
    </div>
  )
}
