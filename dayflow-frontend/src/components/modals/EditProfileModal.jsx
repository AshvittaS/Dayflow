import { useState, useEffect, useRef } from 'react'
import { X, Edit3, Plus, AlertCircle, Trash2, Camera, Upload, Check } from 'lucide-react'
import { updateEmployee, deleteEmployee, uploadAvatar } from '../../hooks/useEmployees.js'

const DEPARTMENTS = ['Engineering', 'Design', 'HR', 'Sales', 'Administration']
const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'On Leave' }
]

const STOCK_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
]

export default function EditProfileModal({ employee, isAdmin, onClose, onUpdated, onDeleted }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    department: employee?.department || 'Engineering',
    title: employee?.title || '',
    location: employee?.location || 'Bengaluru',
    mobile: employee?.mobile || '',
    manager: employee?.manager || '',
    status: employee?.status || 'absent',
    about: employee?.about || '',
    dateOfBirth: employee?.dateOfBirth || '',
    gender: employee?.gender || '',
    address: employee?.address || '',
    avatarUrl: employee?.avatarUrl || employee?.avatar || '',
    skills: Array.isArray(employee?.skills) ? [...employee.skills] : [],
    certifications: Array.isArray(employee?.certifications) ? [...employee.certifications] : [],
    interests: Array.isArray(employee?.interests) ? [...employee.interests] : [],
    monthWage: employee?.monthWage || ''
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(employee?.avatarUrl || employee?.avatar || '')
  const fileInputRef = useRef(null)

  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
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

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  function handleSelectPreset(presetUrl) {
    setAvatarFile(null)
    setAvatarPreview(presetUrl)
    setFormData((prev) => ({ ...prev, avatarUrl: presetUrl }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleRemovePhoto() {
    setAvatarFile(null)
    setAvatarPreview('')
    setFormData((prev) => ({ ...prev, avatarUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleAddSkill() {
    if (!newSkill.trim() || formData.skills.includes(newSkill.trim())) return
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
    setNewSkill('')
  }

  function handleRemoveSkill(skill) {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1. If a local file was uploaded, upload it to the backend endpoint
      let finalAvatarUrl = formData.avatarUrl
      if (avatarFile) {
        const uploadRes = await uploadAvatar(employee.id, avatarFile)
        if (uploadRes?.avatarUrl) {
          finalAvatarUrl = uploadRes.avatarUrl
        }
      }

      // 2. Update employee profile data
      await updateEmployee(employee.id, {
        ...formData,
        avatarUrl: finalAvatarUrl
      })

      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      await deleteEmployee(employee.id)
      onDeleted?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete employee.')
    } finally {
      setLoading(false)
    }
  }

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : '?'

  const resolvedPreview = avatarPreview?.startsWith('/uploads')
    ? `http://localhost:4000${avatarPreview}`
    : avatarPreview

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl rounded-2xl border border-[#EAEAEC] bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEC] px-6 py-4 bg-[#FAFAFC] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4FE9]/10 text-[#5B4FE9]">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1F]">Edit Profile & Photo</h2>
              <p className="text-[11px] text-[#6B6B76]">
                {isAdmin ? 'Administrative master profile & photo manager' : 'Update your personal profile and photo'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1" noValidate>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── 0. Profile Photo Upload & Selector ── */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-[#F8F9FA] p-4">
            <h3 className="font-bold uppercase tracking-wider text-[#6B6B76] mb-3 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-[#5B4FE9]" />
              Profile Photo
            </h3>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full overflow-hidden border-2 border-white shadow-md bg-[#EEEDFC] text-[#5B4FE9] text-xl font-extrabold ring-2 ring-[#5B4FE9]/20"
                >
                  {resolvedPreview ? (
                    <img
                      src={resolvedPreview}
                      alt={formData.name || 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Upload new photo"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              {/* Upload & Preset Options */}
              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1A1A1F] hover:bg-[#EEEDFC] hover:text-[#5B4FE9] hover:border-[#5B4FE9]/30 shadow-subtle transition"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Local Photo</span>
                  </button>

                  {resolvedPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Preset Avatars */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] mb-1.5">
                    Or choose a preset portrait:
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto py-1">
                    {STOCK_PRESETS.map((preset, idx) => {
                      const isSelected = resolvedPreview === preset
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`relative h-8 w-8 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#5B4FE9] ring-2 ring-[#5B4FE9]/30 scale-110'
                              : 'border-white hover:border-[#5B4FE9]/50 hover:scale-105'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                          {isSelected && (
                            <span className="absolute inset-0 bg-[#5B4FE9]/40 flex items-center justify-center text-white">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Core Profile Details */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6B6B76] mb-3">
              Core Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#1A1A1F] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1F] block mb-1">Mobile Contact</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                />
              </div>
            </div>
          </div>

          {/* 2. Admin Privileged Fields */}
          {isAdmin && (
            <div className="p-4 rounded-xl border border-[#5B4FE9]/20 bg-[#EEEDFC]/30 space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-[#5B4FE9] flex items-center justify-between">
                <span>Administrative Controls</span>
                <span className="font-mono text-[10px] bg-[#5B4FE9]/10 px-2 py-0.5 rounded">Admin Only</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Department</label>
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
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Presence Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Office Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Monthly Base Wage (₹)</label>
                  <input
                    type="number"
                    value={formData.monthWage}
                    onChange={(e) => handleChange('monthWage', e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Personal Bio & Address */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6B6B76] mb-3">
              Personal Bio & Address
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-[#1A1A1F] block mb-1">About Summary</label>
                <textarea
                  rows={2}
                  value={formData.about}
                  onChange={(e) => handleChange('about', e.target.value)}
                  placeholder="Share a short bio, role scope, or background..."
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#1A1A1F] block mb-1">Gender</label>
                  <input
                    type="text"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    placeholder="e.g. Female / Male / Non-binary"
                    className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1F] block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. 102 Green Heights, Indiranagar, Bengaluru"
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]"
                />
              </div>
            </div>
          </div>

          {/* 4. Skills & Competencies Tag Manager */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6B6B76] mb-2">
              Skills & Competencies
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-[#5B4FE9]/10 border border-[#5B4FE9]/20 px-2.5 py-0.5 text-xs font-bold text-[#5B4FE9]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Add a skill (e.g. TypeScript, React)..."
                className="flex-1 rounded-xl border border-[#EAEAEC] bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-[#5B4FE9]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] px-3 py-1.5 font-bold text-[#1A1A1F] hover:bg-[#EEEDFC] hover:text-[#5B4FE9]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer with Actions & Optional Delete */}
        <div className="border-t border-[#EAEAEC] p-4 bg-[#FAFAFC] flex items-center justify-between shrink-0">
          {isAdmin ? (
            deleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-600">Permanently delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-lg border border-[#EAEAEC] px-2.5 py-1 text-xs font-bold text-[#6B6B76]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Archive / Delete Employee</span>
              </button>
            )
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#EAEAEC] bg-white px-4 py-2 text-xs font-bold text-[#6B6B76] hover:bg-[#F4F4F6]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-[#5B4FE9] px-5 py-2 text-xs font-bold text-white hover:bg-[#4A3EC8] disabled:opacity-60 shadow-sm transition"
            >
              {loading ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
