import { useState, useRef, useEffect } from 'react'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { timeOffTypes } from '../../data/mockData.js'
import { submitTimeOff } from '../../hooks/useTimeOff.js'

export default function TimeOffRequestModal({ onClose, onSubmitted }) {
  const { user } = useAuth()
  const [type, setType]               = useState(timeOffTypes[0])
  const [start, setStart]             = useState('')
  const [end, setEnd]                 = useState('')
  const [daysRequested, setDays]      = useState('')
  const [attachment, setAttachment]   = useState(null)
  const [attachError, setAttachError] = useState('')
  const [apiError, setApiError]       = useState('')
  const [loading, setLoading]         = useState(false)
  const firstFocusableRef = useRef(null)
  const panelRef = useRef(null)

  const needsAttachment = type === 'Sick Leave'

  useEffect(() => {
    if (start && end && end >= start) {
      const diff = Math.round((new Date(end) - new Date(start)) / 86400000) + 1
      setDays(String(diff))
    }
  }, [start, end])

  useEffect(() => { firstFocusableRef.current?.focus() }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (needsAttachment && !attachment) { setAttachError('A sick leave certificate is required.'); return }
    setAttachError('')
    setApiError('')
    setLoading(true)
    try {
      await submitTimeOff({ type, startDate: start, endDate: end, daysRequested: Number(daysRequested) || 1, attachment })
      onSubmitted?.()
      onClose()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={panelRef} className="w-full max-w-md rounded-2xl border border-[#EAEAEC] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#EAEAEC] px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-sm font-bold text-[#1A1A1F]">Request Time Off</h2>
            <p className="text-[11px] text-[#6B6B76]">Submit a leave request for admin evaluation</p>
          </div>
          <button ref={firstFocusableRef} onClick={onClose} aria-label="Close modal"
            className="rounded-lg p-1 text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
          {apiError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <Field label="Employee">
            <input disabled value={user?.name || ''} className="w-full rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] px-3.5 py-2.5 text-xs font-semibold text-[#6B6B76] cursor-not-allowed" />
          </Field>

          <Field label="Time Off Type">
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1A1A1F] outline-none focus:border-[#5B4FE9] focus:ring-2 focus:ring-[#5B4FE9]/10">
              {timeOffTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">Validity Period</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-date" className="mb-1 block text-[11px] text-[#6B6B76]">From</label>
                <input id="start-date" type="date" required value={start} onChange={(e) => setStart(e.target.value)}
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]" />
              </div>
              <div>
                <label htmlFor="end-date" className="mb-1 block text-[11px] text-[#6B6B76]">To</label>
                <input id="end-date" type="date" required min={start} value={end} onChange={(e) => setEnd(e.target.value)}
                  className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 text-xs font-medium text-[#1A1A1F] outline-none focus:border-[#5B4FE9]" />
              </div>
            </div>
          </div>

          <Field label="Days Requested">
            <input type="number" min="1" required value={daysRequested} onChange={(e) => setDays(e.target.value)}
              placeholder="Auto-calculated from dates"
              className="w-full rounded-xl border border-[#EAEAEC] bg-white px-3.5 py-2.5 font-mono text-xs font-semibold text-[#1A1A1F] placeholder-[#92929D] outline-none focus:border-[#5B4FE9]" />
          </Field>

          {needsAttachment && (
            <div>
              <label htmlFor="attachment" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">
                Medical Certificate<span className="ml-1 text-rose-500">*</span>
              </label>
              <div className={`rounded-xl border-2 border-dashed p-4 text-center ${attachError ? 'border-rose-300 bg-rose-50/50' : 'border-[#EAEAEC] hover:border-[#5B4FE9]/50'}`}>
                <input id="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => { setAttachment(e.target.files?.[0] ?? null); setAttachError('') }}
                  className="hidden" />
                <label htmlFor="attachment" className="cursor-pointer text-xs text-[#6B6B76] hover:text-[#5B4FE9]">
                  {attachment ? (
                    <span className="font-semibold text-[#5B4FE9]">{attachment.name}</span>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-1.5 h-5 w-5 text-[#92929D]" />
                      <span>Click to upload PDF, JPG, or PNG</span>
                    </>
                  )}
                </label>
              </div>
              {attachError && <p role="alert" className="mt-1 text-xs text-rose-600">{attachError}</p>}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#EAEAEC] pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-[#EAEAEC] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]">
              Discard
            </button>
            <button type="submit" disabled={loading}
              className="rounded-xl bg-[#5B4FE9] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#4A3EC8] disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
      {children}
    </div>
  )
}
