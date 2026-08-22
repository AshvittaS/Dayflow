import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [logoFile, setLogoFile]         = useState(null)
  const [logoPreview, setLogoPreview]   = useState(null)
  const [passwordError, setPasswordError] = useState('')
  const [apiError, setApiError]         = useState('')
  const [loading, setLoading]           = useState(false)
  const logoInputRef = useRef(null)

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const password = form.password.value
    const confirm  = form.confirmPassword.value
    if (password !== confirm) { setPasswordError('Passwords do not match.'); return }
    setPasswordError('')
    setApiError('')
    setLoading(true)
    try {
      await signUp({
        companyName: form.companyName.value.trim(),
        name:        form.name.value.trim(),
        email:       form.email.value.trim(),
        phone:       form.phone.value.trim(),
        password,
        confirmPassword: confirm
      })
      navigate('/signin')
    } catch (err) {
      setApiError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-base-bg">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-base-panel border-r border-base-border px-16 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-2 ring-accent/40">
              <span className="text-xl font-bold text-accent">D</span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">Day<span className="text-accent">flow</span></span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-white">Get your team started</h2>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Create your company's admin account. After setup, you can add employees and configure payroll, attendance, and leave policies.
          </p>
          <div className="mt-10 rounded-xl border border-base-border bg-base-card p-5 text-left text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">What happens next</p>
            {['Your company account is created','A unique Login ID is generated for you','Add employees and configure their roles','Set up payroll, leave, and attendance rules'].map((step, i) => (
              <div key={i} className="mb-2 flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">{i + 1}</span>
                <span className="text-slate-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 ring-2 ring-accent/40">
            <span className="text-base font-bold text-accent">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Day<span className="text-accent">flow</span></span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-400">Admin / HR Officer account for your company</p>
          </div>

          {apiError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Company Name + Logo */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Company Name</label>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Upload company logo"
                  onClick={() => logoInputRef.current?.click()}
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-base-border bg-base-card text-slate-500 hover:border-accent hover:text-accent">
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  }
                </button>
                <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                <input name="companyName" type="text" required placeholder="Acme Corp"
                  className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
              </div>
              {logoFile && <p className="mt-1 text-xs text-slate-500">Logo: {logoFile.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="signupName" className="mb-1.5 block text-xs font-medium text-slate-300">Name</label>
                <input id="signupName" name="name" type="text" required placeholder="Jane Smith"
                  className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="signupPhone" className="mb-1.5 block text-xs font-medium text-slate-300">Phone</label>
                <input id="signupPhone" name="phone" type="tel" required placeholder="+91 98765 00000"
                  className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
              </div>
            </div>

            <div>
              <label htmlFor="signupEmail" className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
              <input id="signupEmail" name="email" type="email" required placeholder="jane@acme.com"
                className="w-full rounded-lg border border-base-border bg-base-card px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
            </div>

            {[{ id: 'signupPassword', name: 'password', label: 'Password', show: showPassword, toggle: () => setShowPassword(v => !v) },
              { id: 'signupConfirmPassword', name: 'confirmPassword', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(v => !v), error: passwordError }
            ].map(f => (
              <div key={f.name}>
                <label htmlFor={f.id} className="mb-1.5 block text-xs font-medium text-slate-300">{f.label}</label>
                <div className="relative">
                  <input id={f.id} name={f.name} type={f.show ? 'text' : 'password'} required placeholder="••••••••"
                    className={`w-full rounded-lg border bg-base-card px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-600 outline-none focus:ring-1 ${f.error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20' : 'border-base-border focus:border-accent focus:ring-accent/30'}`} />
                  <button type="button" aria-label="Toggle" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {f.show
                      ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {f.error && <p role="alert" className="mt-1 text-xs text-red-400">{f.error}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-accent hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
