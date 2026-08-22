import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, Upload, Check, X } from 'lucide-react'
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
    { label: 'Too Short', color: 'bg-slate-200', text: 'text-[#9AA4AD]' },
    { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' },
    { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' },
    { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
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
    reader.onload = (ev) => setLogoPreview(ev.target.result)
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
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#1A1A1F]">
      {/* ── Left Hero Panel ── */}
      <WorkweekHero mode="signup" />

      {/* ── Right Registration Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-16 overflow-y-auto">
        {/* Mobile Header with brand */}
        <div className="mb-6 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B4FE9] text-white shadow-lg shadow-[#5B4FE9]/25 ring-1 ring-white/20">
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
          <h1 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-[#1A1A1F]">
            Day<span className="text-[#5B4FE9]">flow</span>
          </h1>
          <p className="font-mono text-xs text-[#6B6B76]">Human Resource Management</p>
        </div>

        <div className="w-full max-w-[460px]">
          {/* Navigation Switcher Tabs */}
          <div className="mb-6 flex rounded-xl border border-[#EAEAEC] bg-[#F1F1F4] p-1 shadow-inner">
            <Link
              to="/signin"
              className="flex-1 rounded-lg py-2 text-center text-xs font-semibold text-[#6B6B76] hover:text-[#1A1A1F] transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 rounded-lg bg-white py-2 text-center text-xs font-bold text-[#1A1A1F] shadow-sm transition-all"
            >
              Create Workspace
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5B4FE9]/20 bg-[#5B4FE9]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#5B4FE9]">
              <ShieldCheck className="h-3 w-3" />
              Admin Only Provisioning
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#1A1A1F]">
              Create your HR Workspace
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6B76]">
              Set up your organization’s primary management account.
            </p>
          </div>

          {/* Critical Framing Alert */}
          <div className="mb-5 rounded-xl border border-[#5B4FE9]/20 bg-[#EEEDFC]/40 p-3.5 text-xs text-[#1A1A1F] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-xs font-bold text-[#5B4FE9]">
                🛡️
              </span>
              <div>
                <span className="font-bold text-[#1A1A1F]">Company Architecture: </span>
                This creates your master organization profile. Employees do not self-register — they receive auto-generated Login IDs once you onboard them.
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {submitError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Company Name & Logo Upload */}
            <div>
              <label
                htmlFor="companyName"
                className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76] block mb-1.5"
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
                      ? 'border-[#5B4FE9]/40 bg-white'
                      : isDragging
                      ? 'border-[#5B4FE9] bg-[#5B4FE9]/10 scale-105'
                      : 'border-dashed border-[#D5D5DC] bg-white hover:border-[#5B4FE9] hover:bg-[#EEEDFC]/30'
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
                    <Upload className="h-5 w-5 text-[#9AA4AD] group-hover:text-[#5B4FE9] transition-colors" />
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
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all ${
                      touched.companyName && formData.companyName
                        ? isCompanyValid
                          ? 'border-[#10B981]/50 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15'
                          : 'border-[#F43F5E]/50 focus:border-[#F43F5E] focus:ring-2 focus:ring-[#F43F5E]/15'
                        : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                    }`}
                  />
                </div>
              </div>

              {logoFile && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-[11px] text-[#6B6B76] border border-[#EAEAEC] shadow-subtle">
                  <span className="truncate max-w-[200px] text-[#1A1A1F]">
                    📎 {logoFile.name} ({(logoFile.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-rose-600 hover:underline font-semibold"
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
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76] block mb-1.5"
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
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all ${
                    touched.fullName && formData.fullName
                      ? isNameValid
                        ? 'border-[#10B981]/50'
                        : 'border-[#F43F5E]/50'
                      : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76] block mb-1.5"
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
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all ${
                    touched.phone && formData.phone
                      ? isPhoneValid
                        ? 'border-[#10B981]/50'
                        : 'border-[#F59E0B]/50'
                      : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                  }`}
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signupEmail"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76]"
                >
                  Company Work Email
                </label>
                {touched.email && formData.email && (
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isEmailValid ? 'text-[#059669]' : 'text-rose-600'
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
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all ${
                  touched.email && formData.email
                    ? isEmailValid
                      ? 'border-[#10B981]/50 focus:border-[#10B981]'
                      : 'border-[#F43F5E]/50 focus:border-[#F43F5E]'
                    : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                }`}
              />
            </div>

            {/* Password with Animated Strength Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="signupPassword"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76]"
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
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-4 py-2.5 pr-11 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15 transition-all"
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

              {/* Multi-Segment Strength Meter */}
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step <= strengthScore ? currentStrength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Password Checklist */}
              <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.length ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-[#6B6B76]'
                  }`}
                >
                  {criteria.length ? '✓' : '•'} 8+ chars
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasUpper ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-[#6B6B76]'
                  }`}
                >
                  {criteria.hasUpper ? '✓' : '•'} Uppercase
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasNumber ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-[#6B6B76]'
                  }`}
                >
                  {criteria.hasNumber ? '✓' : '•'} Number
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 transition-colors ${
                    criteria.hasSpecial ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-[#6B6B76]'
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
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6B76]"
                >
                  Confirm Password
                </label>
                {formData.confirmPassword && (
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isPasswordMatch ? 'text-[#059669]' : 'text-rose-600'
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
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-[#1A1A1F] placeholder-[#9AA4AD] shadow-subtle outline-none transition-all ${
                    formData.confirmPassword
                      ? isPasswordMatch
                        ? 'border-[#10B981]/50 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15'
                        : 'border-[#F43F5E]/50 focus:border-[#F43F5E] focus:ring-2 focus:ring-[#F43F5E]/15'
                      : 'border-[#EAEAEC] focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/15'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#9AA4AD] hover:text-[#1A1A1F] transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#5B4FE9] hover:bg-[#4A3EC8] py-3.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(91,79,233,0.35)] transition-all duration-200 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
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
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-[#6B6B76]">
            <span>Already have an active company workspace? </span>
            <Link
              to="/signin"
              className="font-bold text-[#5B4FE9] hover:underline underline-offset-4"
            >
              Sign In here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
