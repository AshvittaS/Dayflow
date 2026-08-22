import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WorkweekHero from '../../components/auth/WorkweekHero'

export default function SignIn() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [touched, setTouched] = useState({ loginId: false, password: false })

  // Validation logic
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId.trim())
  const isEmpId = /^[A-Za-z0-9-_]{4,15}$/.test(loginId.trim())
  const isLoginIdValid = isEmail || isEmpId
  const isPasswordValid = password.length >= 6

  function handlePrefill(role) {
    if (role === 'admin') {
      setLoginId('ADM-2024-FLOW')
      setPassword('AdminPass#2024')
    } else {
      setLoginId('DF23JD0001')
      setPassword('Employee#2024')
    }
    setErrorMsg('')
    setTouched({ loginId: true, password: true })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({ loginId: true, password: true })

    if (!loginId.trim()) {
      setErrorMsg('Please enter your Login ID or Work Email.')
      return
    }

    if (!password) {
      setErrorMsg('Please enter your account password.')
      return
    }

    if (!isLoginIdValid) {
      setErrorMsg('Please provide a valid Login ID (e.g. DF23JD0001) or company email.')
      return
    }

    setErrorMsg('')
    setIsLoading(true)

    // Simulate smooth auth verification
    setTimeout(() => {
      setIsLoading(false)
      navigate('/employees')
    }, 700)
  }

  return (
    <div className="flex min-h-screen bg-[#0b0c10] text-[#f8fafc]">
      {/* ── Left Hero Panel (Signature Living Workweek Cadence) ── */}
      <WorkweekHero mode="signin" />

      {/* ── Right Auth Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        {/* Mobile Header with brand */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#e85d3b] shadow-lg shadow-[#ff6b4a]/25 ring-1 ring-white/20">
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
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white">
            Day<span className="text-[#ff6b4a]">flow</span>
          </h1>
          <p className="font-mono text-xs text-[#8e95a5]">Human Cadence & HR System</p>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Navigation Pill Switcher */}
          <div className="mb-8 flex rounded-xl border border-white/10 bg-[#12141a] p-1 shadow-inner">
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#ff6b4a] py-2 text-center text-xs font-semibold text-white shadow-md transition-all"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-[#8e95a5] hover:text-white transition-all"
            >
              Create Workspace
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#8e95a5]">
                Identity Gateway
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-[#8e95a5]">
              Access your schedule, attendance pulse, and company directory.
            </p>
          </div>

          {/* Error Banner if validation fails */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/10 p-3.5 text-xs text-[#f43f5e] animate-fade-in"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Login ID / Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="loginId"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5]"
                >
                  Login ID / Work Email
                </label>
                {touched.loginId && loginId && (
                  <span
                    className={`font-mono text-[10px] ${
                      isLoginIdValid ? 'text-[#10b981]' : 'text-[#f59e0b]'
                    }`}
                  >
                    {isLoginIdValid ? '✓ Valid Format' : 'ID or Email'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="loginId"
                  type="text"
                  autoComplete="username"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, loginId: true }))}
                  placeholder="e.g. DF23JD0001 or alex@company.com"
                  className={`w-full rounded-xl border bg-[#141720] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all duration-200 ${
                    touched.loginId && loginId
                      ? isLoginIdValid
                        ? 'border-[#10b981]/50 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20'
                        : 'border-[#f59e0b]/50 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20'
                      : 'border-[#262a36] focus:border-[#ff6b4a] focus:ring-2 focus:ring-[#ff6b4a]/20'
                  }`}
                />
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e95a5]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* Requirement Note: System-generated IDs */}
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#141720]/80 p-2.5 border border-white/5 text-[11px] text-[#8e95a5] leading-relaxed">
                <span className="text-[#ff6b4a] font-bold">ℹ</span>
                <span>
                  <strong>Note:</strong> Login IDs (e.g. <span className="font-mono text-white">DF23JD0001</span>) are auto-generated by the system and assigned by your company admin.
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5]"
                >
                  Password
                </label>
                <span className="text-[11px] text-[#8e95a5]">
                  Admin or Staff credential
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border bg-[#141720] px-4 py-3 pr-11 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all duration-200 ${
                    touched.password && password
                      ? isPasswordValid
                        ? 'border-[#10b981]/50 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20'
                        : 'border-[#262a36] focus:border-[#ff6b4a] focus:ring-2 focus:ring-[#ff6b4a]/20'
                      : 'border-[#262a36] focus:border-[#ff6b4a] focus:ring-2 focus:ring-[#ff6b4a]/20'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#8e95a5] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#f55733] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff6b4a]/25 transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar for Easy Testing */}
          <div className="mt-6 rounded-xl border border-dashed border-[#262a36] bg-[#141720]/60 p-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#8e95a5] mb-2">
              ⚡ Instant Demo Credentials
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePrefill('admin')}
                className="rounded-lg border border-white/10 bg-[#1b1f2c] px-3 py-1.5 text-xs font-medium text-[#f8fafc] hover:border-[#ff6b4a]/50 hover:bg-[#202534] transition-all"
              >
                Fill Admin (ADM-2024)
              </button>
              <button
                type="button"
                onClick={() => handlePrefill('employee')}
                className="rounded-lg border border-white/10 bg-[#1b1f2c] px-3 py-1.5 text-xs font-medium text-[#8e95a5] hover:border-[#ff6b4a]/50 hover:text-white transition-all"
              >
                Fill Employee (DF23JD)
              </button>
            </div>
          </div>

          {/* Switch to Sign Up */}
          <div className="mt-8 text-center text-xs text-[#8e95a5]">
            <span>Need to provision an enterprise workspace? </span>
            <Link
              to="/signup"
              className="font-semibold text-[#ff6b4a] hover:underline underline-offset-4"
            >
              Create Company Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
