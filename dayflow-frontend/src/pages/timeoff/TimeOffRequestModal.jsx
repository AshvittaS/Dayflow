import { useState, useRef, useEffect } from 'react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={panelRef} className="w-full max-w-sm rounded-2xl border border-base-border bg-base-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-border px-6 py-4">
          <h2 id="modal-title" className="text-sm font-semibold text-white">Time Off Request</h2>
          <button ref={firstFocusableRef} onClick={onClose} aria-label="Close modal"
            className="rounded-full p-1 text-slate-400 hover:bg-base-card hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5" noValidate>
          {apiError && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{apiError}</div>}

          <Field label="Employee">
            <input disabled value={user?.name || ''} className="w-full rounded-lg border border-base-border bg-base-bg px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
          </Field>

          <Field label="Time off Type">
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent/30">
              {timeOffTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-400">Validity Period</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="start-date" className="mb-1 block text-xs text-slate-500">From</label>
                <input id="start-date" type="date" required value={start} onChange={e => setStart(e.target.value)}
                  className="w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm text-white outline-none focus:border-accent" />
              </div>
              <div className="flex-1">
                <label htmlFor="end-date" className="mb-1 block text-xs text-slate-500">To</label>
                <input id="end-date" type="date" required min={start} value={end} onChange={e => setEnd(e.target.value)}
                  className="w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm text-white outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          <Field label="Days Requested">
            <input type="number" min="1" required value={daysRequested} onChange={e => setDays(e.target.value)}
              placeholder="Auto-calculated from dates"
              className="w-full rounded-lg border border-base-border bg-base-card px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-accent" />
          </Field>

          {needsAttachment && (
            <div>
              <label htmlFor="attachment" className="mb-1.5 block text-xs font-medium text-slate-400">
                Attachment<span className="ml-1 text-red-400">*</span>
                <span className="ml-1 text-slate-600">(sick leave certificate)</span>
              </label>
              <div className={`rounded-lg border-2 border-dashed p-4 text-center ${attachError ? 'border-red-500/50' : 'border-base-border hover:border-accent/40'}`}>
                <input id="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => { setAttachment(e.target.files?.[0] ?? null); setAttachError('') }}
                  className="hidden" />
                <label htmlFor="attachment" className="cursor-pointer text-xs text-slate-400 hover:text-accent">
                  {attachment
                    ? <span className="text-accent">{attachment.name}</span>
                    : <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-1.5 h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Click to upload PDF, JPG, or PNG
                      </>
                  }
                </label>
              </div>
              {attachError && <p role="alert" className="mt-1 text-xs text-red-400">{attachError}</p>}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-base-border pt-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-base-border px-4 py-2 text-xs font-medium text-slate-300 hover:bg-base-card">
              Discard
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-accent/20 hover:bg-accent-hover disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit'}
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
      <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      {children}
    </div>
  )
}
