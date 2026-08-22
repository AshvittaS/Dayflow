import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import WorkweekHero from '../../components/auth/WorkweekHero'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const logoInputRef = useRef(null)

  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [touched, setTouched] = useState({})

  // Real-time validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  const isPhoneValid = /^[0-9+()-\s]{7,20}$/.test(formData.phone.trim())
  const isCompanyValid = formData.companyName.trim().length >= 2
  const isNameValid = formData.fullName.trim().length >= 2

  // Password strength evaluation
  const pass = formData.password
  const criteria = {
    length: pass.length >= 8,
    hasUpper: /[A-Z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[^A-Za-z0-9]/.test(pass),
  }

  const strengthScore = Object.values(criteria).filter(Boolean).length
  const strengthLevels = [
    { label: 'Too Short', color: 'bg-white/20', text: 'text-[#8e95a5]' },
    { label: 'Weak', color: 'bg-[#f43f5e]', text: 'text-[#f43f5e]' },
    { label: 'Fair', color: 'bg-[#f59e0b]', text: 'text-[#f59e0b]' },
    { label: 'Good', color: 'bg-[#38bdf8]', text: 'text-[#38bdf8]' },
    { label: 'Strong', color: 'bg-[#10b981]', text: 'text-[#10b981]' },
  ]
  const currentStrength = pass.length === 0 ? strengthLevels[0] : strengthLevels[strengthScore]

  const isPasswordMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitError) setSubmitError('')
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleLogoFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select a valid image file (PNG, JPG, or SVG).')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setSubmitError('Logo image must be under 3MB.')
      return
    }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(file)
    setSubmitError('')
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleLogoFile(file)
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({
      companyName: true,
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    })

    if (!isCompanyValid) {
      setSubmitError('Please enter your official company name.')
      return
    }
    if (!isNameValid) {
      setSubmitError('Please provide your full administrator name.')
      return
    }
    if (!isEmailValid) {
      setSubmitError('Please provide a valid company work email.')
      return
    }
    if (formData.password.length < 8) {
      setSubmitError('Password must be at least 8 characters long.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Passwords do not match. Please verify your confirmation password.')
      return
    }

    setSubmitError('')
    setIsLoading(true)

    try {
      await signUp({
        companyName: formData.companyName.trim(),
        name:        formData.fullName.trim(),
        email:       formData.email.trim(),
        phone:       formData.phone.trim(),
        password:    formData.password,
        confirmPassword: formData.confirmPassword
      })
      navigate('/signin')
    } catch (err) {
      setSubmitError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0b0c10] text-[#f8fafc]">
      {/* ── Left Hero Panel ── */}
      <WorkweekHero mode="signup" />

      {/* ── Right Registration Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-16 overflow-y-auto">
        {/* Mobile Header with brand */}
        <div className="mb-6 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#7c3aed] shadow-lg shadow-accent/25 ring-1 ring-white/20">
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
          <h1 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-white">
            Day<span className="text-accent">flow</span>
          </h1>
          <p className="font-mono text-xs text-[#8e95a5]">Human Resource Management</p>
        </div>

        <div className="w-full max-w-[460px]">
          {/* Navigation Switcher Tabs */}
          <div className="mb-6 flex rounded-xl border border-white/10 bg-[#12141a] p-1 shadow-inner">
            <Link
              to="/signin"
              className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-[#8e95a5] hover:text-white transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 rounded-lg bg-accent py-2 text-center text-xs font-semibold text-white shadow-md transition-all"
            >
              Create Workspace
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
              Admin Only Provisioning
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              Create your HR Workspace
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#8e95a5]">
              Set up your organization’s primary management account.
            </p>
          </div>

          {/* Critical Framing Alert */}
          <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 p-3.5 text-xs text-[#d8dde6] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                🛡️
              </span>
              <div>
                <span className="font-semibold text-white">Company Workspace Architecture: </span>
                This creates your master organization profile. Employees do not self-register — they receive auto-generated Login IDs once you onboard them.
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/10 p-3 text-xs text-[#f43f5e] animate-fade-in"
            >
              <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Company Name & Logo Upload */}
            <div>
              <label
                htmlFor="companyName"
                className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5] block mb-1.5"
              >
                Company Name & Brand Logo
              </label>
              <div className="flex items-start gap-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => logoInputRef.current?.click()}
                  className={`group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-all ${
                    logoPreview
                      ? 'border-accent/40 bg-[#181a22]'
                      : isDragging
                      ? 'border-accent bg-accent/10 scale-105'
                      : 'border-dashed border-[#353b4b] bg-[#141720] hover:border-accent/60 hover:bg-[#181a24]'
                  }`}
                  title="Click or drag to upload company logo"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-5 w-5 text-[#8e95a5] group-hover:text-accent transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </div>

                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                  className="hidden"
                />

                <div className="flex-1">
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    placeholder="e.g. Acme Technologies Inc."
                    className={`w-full rounded-xl border bg-[#141720] px-4 py-3 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all ${
                      touched.companyName && formData.companyName
                        ? isCompanyValid
                          ? 'border-[#10b981]/50 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20'
                          : 'border-[#f43f5e]/50 focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20'
                        : 'border-[#262a36] focus:border-accent focus:ring-2 focus:ring-accent/20'
                    }`}
                  />
                </div>
              </div>

              {logoFile && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-[#141720] px-3 py-1.5 text-[11px] text-[#8e95a5] border border-white/5">
                  <span className="truncate max-w-[200px] text-white">
                    📎 {logoFile.name} ({(logoFile.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[#f43f5e] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Administrator Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="fullName"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5] block mb-1.5"
                >
                  Admin Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Jane Smith"
                  className={`w-full rounded-xl border bg-[#141720] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all ${
                    touched.fullName && formData.fullName
                      ? isNameValid
                        ? 'border-[#10b981]/50'
                        : 'border-[#f43f5e]/50'
                      : 'border-[#262a36] focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5] block mb-1.5"
                >
                  Contact Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+91 98765 00000"
                  className={`w-full rounded-xl border bg-[#141720] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all ${
                    touched.phone && formData.phone
                      ? isPhoneValid
                        ? 'border-[#10b981]/50'
                        : 'border-[#f59e0b]/50'
                      : 'border-[#262a36] focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signupEmail"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5]"
                >
                  Company Work Email
                </label>
                {touched.email && formData.email && (
                  <span
                    className={`font-mono text-[10px] ${
                      isEmailValid ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    }`}
                  >
                    {isEmailValid ? '✓ Valid Work Email' : 'Invalid email format'}
                  </span>
                )}
              </div>
              <input
                id="signupEmail"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="admin@company.com"
                className={`w-full rounded-xl border bg-[#141720] px-4 py-2.5 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all ${
                  touched.email && formData.email
                    ? isEmailValid
                      ? 'border-[#10b981]/50 focus:border-[#10b981]'
                      : 'border-[#f43f5e]/50 focus:border-[#f43f5e]'
                    : 'border-[#262a36] focus:border-accent focus:ring-2 focus:ring-accent/20'
                }`}
              />
            </div>

            {/* Password with Animated Strength Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signupPassword"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5]"
                >
                  Master Password
                </label>
                {pass.length > 0 && (
                  <span className={`font-mono text-[10px] font-bold ${currentStrength.text}`}>
                    {currentStrength.label} ({strengthScore}/4)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min 8 characters, numbers & symbols"
                  className="w-full rounded-xl border border-[#262a36] bg-[#141720] px-4 py-2.5 pr-11 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
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

              {/* Multi-Segment Strength Meter */}
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step <= strengthScore ? currentStrength.color : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Password Checklist */}
              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.length ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/5 text-[#8e95a5]'
                  }`}
                >
                  {criteria.length ? '✓' : '•'} 8+ chars
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasUpper ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/5 text-[#8e95a5]'
                  }`}
                >
                  {criteria.hasUpper ? '✓' : '•'} Uppercase
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasNumber ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/5 text-[#8e95a5]'
                  }`}
                >
                  {criteria.hasNumber ? '✓' : '•'} Number
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasSpecial ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-white/5 text-[#8e95a5]'
                  }`}
                >
                  {criteria.hasSpecial ? '✓' : '•'} Symbol
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signupConfirmPassword"
                  className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8e95a5]"
                >
                  Confirm Password
                </label>
                {formData.confirmPassword && (
                  <span
                    className={`font-mono text-[10px] ${
                      isPasswordMatch ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    }`}
                  >
                    {isPasswordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="signupConfirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter master password"
                  className={`w-full rounded-xl border bg-[#141720] px-4 py-2.5 pr-11 text-sm text-[#f8fafc] placeholder-[#5a6275] outline-none transition-all ${
                    formData.confirmPassword
                      ? isPasswordMatch
                        ? 'border-[#10b981]/50 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20'
                        : 'border-[#f43f5e]/50 focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20'
                      : 'border-[#262a36] focus:border-accent focus:ring-2 focus:ring-accent/20'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#8e95a5] hover:text-white transition-colors"
                >
                  {showConfirm ? (
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
              className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent hover:bg-accent-hover py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Provisioning HR Workspace...
                </span>
              ) : (
                <>
                  <span>Create Workspace & Launch Dayflow</span>
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

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-[#8e95a5]">
            <span>Already have an active company workspace? </span>
            <Link
              to="/signin"
              className="font-semibold text-accent hover:underline underline-offset-4"
            >
              Sign In here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
