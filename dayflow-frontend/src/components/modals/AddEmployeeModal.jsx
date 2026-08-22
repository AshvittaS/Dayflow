import { useState, useRef, useEffect } from 'react'
import { X, UserPlus, Check, AlertCircle, Copy } from 'lucide-react'
import { createEmployee } from '../../hooks/useEmployees.js'

const DEPARTMENTS = ['Engineering', 'Design', 'HR', 'Sales', 'Administration']

export default function AddEmployeeModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    title: '',
    location: 'Bengaluru',
    mobile: '',
    monthWage: '60000',
    manager: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdResult, setCreatedResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await createEmployee({
        ...formData,
        title: formData.title.trim() || formData.department,
        monthWage: Number(formData.monthWage) || 50000
      })
      setCreatedResult(res)
      onCreated?.()
    } catch (err) {
      setError(err.message || 'Failed to create employee.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyCredentials() {
    if (!createdResult) return
    const text = `Dayflow Login Credentials:\nLogin ID: ${createdResult.employee.loginId}\nPassword: ${createdResult.initialPassword}\nPortal: ${window.location.origin}/signin`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg rounded-2xl border border-[#EAEAEC] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEC] px-6 py-4 bg-[#FAFAFC]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9]/10 text-[#5B4FE9]">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1F]">Onboard New Employee</h2>
              <p className="text-[11px] text-[#6B6B76]">
                Generates a unique Login ID and provisions payroll structure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Card or Form */}
        {createdResult ? (
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">
                Employee Successfully Onboarded!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                An account has been created for {createdResult.employee.name}.
              </p>
            </div>

            <div className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#EAEAEC] pb-2">
                <span className="text-[#6B6B76]">Assigned Login ID:</span>
                <span className="font-mono font-bold text-[#1A1A1F]">
                  {createdResult.employee.loginId}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#EAEAEC] pb-2">
                <span className="text-[#6B6B76]">Temporary Password:</span>
                <span className="font-mono font-bold text-[#5B4FE9]">
                  {createdResult.initialPassword}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#6B6B76]">Department:</span>
                <span className="font-semibold text-[#1A1A1F]">
                  {createdResult.employee.department}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#EAEAEC] bg-white py-2.5 text-xs font-bold text-[#1A1A1F] hover:bg-[#F4F4F6] shadow-subtle transition"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-[#5B4FE9] py-2.5 text-xs font-bold text-white hover:bg-[#4A3EC8] shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] placeholder-[#9AA4AD] outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="maya.sharma@dayflow.dev"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] placeholder-[#9AA4AD] outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Lead Designer"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] placeholder-[#9AA4AD] outline-none focus:border-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] placeholder-[#9AA4AD] outline-none focus:border-[#5B4FE9]"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#6B6B76] block mb-1">
                  Monthly Base Wage (₹)
                </label>
                <input
                  type="number"
                  value={formData.monthWage}
                  onChange={(e) => handleChange('monthWage', e.target.value)}
                  placeholder="60000"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EAEAEC] pt-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#EAEAEC] bg-white px-4 py-2.5 text-xs font-bold text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#5B4FE9] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#4A3EC8] disabled:opacity-60 shadow-sm transition"
              >
                {loading ? 'Creating Account…' : 'Create & Onboard'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
