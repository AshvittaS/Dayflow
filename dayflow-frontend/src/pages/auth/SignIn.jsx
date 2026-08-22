import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: replace with real auth call
    navigate('/employees')
  }

  return (
    <div className="flex min-h-screen bg-base-bg">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-base-panel border-r border-base-border px-16 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative z-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-2 ring-accent/40">
              <span className="text-xl font-bold text-accent">D</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              Day<span className="text-accent">flow</span>
            </span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-white">
            Human Resource Management
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Streamline attendance, payroll, and leave management — all in one
            beautiful, unified platform.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Attendance Tracking', 'Payroll', 'Leave Management', 'Employee Profiles'].map(
              (f) => (
                <span
                  key={f}
                  className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 ring-2 ring-accent/40">
            <span className="text-base font-bold text-accent">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Day<span className="text-accent">flow</span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your Dayflow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="loginId" className="mb-1.5 block text-xs font-medium text-slate-300">
                Login ID / Email
              </label>
              <input
                id="loginId"
                type="text"
                required
                placeholder="e.g. DF23JD0001 or you@company.com"
                className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Setting up your company?{' '}
            <Link to="/signup" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
