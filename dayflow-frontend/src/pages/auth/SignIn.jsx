import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, User, Lock, Eye, EyeOff, AlertCircle, Info, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import WorkweekHero from '../../components/auth/WorkweekHero'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [touched, setTouched] = useState({ loginId: false, password: false })

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId.trim())
  const isEmpId = /^[A-Za-z0-9-_]{4,15}$/.test(loginId.trim())
  const isLoginIdValid = isEmail || isEmpId
  const isPasswordValid = password.length >= 6

  function handlePrefill(role) {
    if (role === 'admin') {
      setLoginId('DF26JD0001')
      setPassword('Password@123')
    } else {
      setLoginId('DF26AK0002')
      setPassword('Password@123')
    }
    setErrorMsg('')
    setTouched({ loginId: true, password: true })
  }

  async function handleSubmit(e) {
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

    setErrorMsg('')
    setIsLoading(true)

    try {
      await signIn(loginId.trim(), password)
      navigate('/employees')
    } catch (err) {
      setErrorMsg(err.message || 'Sign in failed. Check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A1F]">
      {/* ── Left Hero Panel ── */}
      <WorkweekHero mode="signin" />

      {/* ── Right Auth Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        {/* Mobile Header with brand */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-lg shadow-[#5B4FE9]/25 ring-1 ring-white/20">
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
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1A1A1F]">
            Day<span className="text-[#5B4FE9]">flow</span>
          </h1>
          <p className="font-mono text-xs text-[#6B6B76]">Human Resource Management</p>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Navigation Pill Switcher */}
          <div className="mb-8 flex rounded-xl border border-[#EAEAEC] bg-[#F1F1F4] p-1 shadow-inner">
            <button
              type="button"
              className="flex-1 rounded-lg bg-white py-2 text-center text-xs font-bold text-[#1A1A1F] shadow-sm transition-all"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              className="flex-1 rounded-lg py-2 text-center text-xs font-semibold text-[#6B6B76] hover:text-[#1A1A1F] transition-all"
            >
              Create Workspace
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B6B76]">
                Identity Gateway
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A1A1F]">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-[#6B6B76]">
              Access your schedule, live attendance pulse, and team directory.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
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
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76]"
                >
                  Login ID / Work Email
                </label>
                {touched.loginId && loginId && (
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isLoginIdValid ? 'text-[#059669]' : 'text-[#D97706]'
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
                  placeholder="e.g. DF26JD0001 or jamie.doe@dayflow.dev"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all duration-200 ${
                    touched.loginId && loginId
                      ? isLoginIdValid
                        ? 'border-[#10B981]/50 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15'
                        : 'border-[#F59E0B]/50 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/15'
                      : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                  }`}
                />
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA4AD]">
                  <User className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#F8F9FA] p-2.5 border border-[#EAEAEC] text-[11px] text-[#6B6B76] leading-relaxed">
                <Info className="h-3.5 w-3.5 text-[#5B4FE9] shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Login IDs (e.g. <span className="font-mono font-bold text-[#1A1A1F]">DF26JD0001</span>) are auto-generated and assigned by the system admin.
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76]"
                >
                  Password
                </label>
                <span className="text-[11px] text-[#9AA4AD]">
                  Admin or Staff credential
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all duration-200 ${
                    touched.password && password
                      ? isPasswordValid
                        ? 'border-[#10B981]/50 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15'
                        : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                      : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#9AA4AD] hover:text-[#1A1A1F] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#5B4FE9] hover:bg-[#4A3EC8] py-3.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(91,79,233,0.35)] transition-all duration-200 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
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
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 rounded-xl border border-dashed border-[#EAEAEC] bg-white p-3.5 text-center shadow-subtle">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] mb-2 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-[#5B4FE9]" />
              Instant Demo Credentials
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePrefill('admin')}
                className="rounded-lg border border-[#EAEAEC] bg-[#F8F9FA] px-3 py-1.5 text-xs font-semibold text-[#1A1A1F] hover:border-[#5B4FE9] hover:bg-[#EEEDFC] hover:text-[#5B4FE9] transition-all"
              >
                Fill Admin (DF26JD)
              </button>
              <button
                type="button"
                onClick={() => handlePrefill('employee')}
                className="rounded-lg border border-[#EAEAEC] bg-[#F8F9FA] px-3 py-1.5 text-xs font-semibold text-[#6B6B76] hover:border-[#5B4FE9] hover:bg-[#EEEDFC] hover:text-[#5B4FE9] transition-all"
              >
                Fill Employee (DF26AK)
              </button>
            </div>
          </div>

          {/* Switch to Sign Up */}
          <div className="mt-8 text-center text-xs text-[#6B6B76]">
            <span>Need to provision an enterprise workspace? </span>
            <Link
              to="/signup"
              className="font-bold text-[#5B4FE9] hover:underline underline-offset-4"
            >
              Create Company Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
