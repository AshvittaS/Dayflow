import { useState, useEffect, useRef } from 'react'
import { X, Calendar, FileText, Check, AlertCircle, ExternalLink, ShieldCheck, Clock } from 'lucide-react'

export default function LeaveDetailsModal({ request, onReview, onClose }) {
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!request) return null

  const isPending = request.status === 'Pending'

  async function handleAction(status) {
    setLoading(true)
    try {
      await onReview(request.id, status)
      onClose()
    } catch (err) {
      alert(err.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const initials = request.employee
    ? request.employee
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : '?'

  const isSickLeave = request.type === 'Sick Leave'

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
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEC] px-6 py-4 bg-[#FAFAFC]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#5B4FE9]" />
            <h2 className="text-sm font-bold text-[#1A1A1F]">Time Off Request Evaluation</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Employee Identity Card */}
          <div className="flex items-center gap-4 rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-4 shadow-subtle">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B4FE9]/10 text-sm font-bold text-[#5B4FE9] ring-2 ring-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1A1A1F] truncate">
                  {request.employee}
                </h3>
                <span className="font-mono text-[10px] bg-white border border-[#EAEAEC] px-2 py-0.5 rounded font-bold text-[#6B6B76]">
                  {request.loginId || `ID #${request.employeeId || ''}`}
                </span>
              </div>
              <p className="text-xs text-[#6B6B76] mt-0.5">
                {request.department || 'General Department'}
              </p>
              {request.email && (
                <p className="text-[11px] text-[#9AA4AD] truncate mt-0.5">
                  {request.email} • {request.mobile || 'No contact phone'}
                </p>
              )}
            </div>
          </div>

          {/* Request Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#EAEAEC] bg-white p-3.5 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] block">
                Leave Category
              </span>
              <span className="mt-1 inline-block rounded-md bg-[#5B4FE9]/10 border border-[#5B4FE9]/20 px-2 py-0.5 font-bold text-[#5B4FE9]">
                {request.type}
              </span>
            </div>

            <div className="rounded-xl border border-[#EAEAEC] bg-white p-3.5 shadow-subtle">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] block">
                Total Days
              </span>
              <span className="mt-1 font-mono text-base font-bold text-[#1A1A1F]">
                {request.daysRequested} {request.daysRequested === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          {/* Duration Timeline */}
          <div className="rounded-xl border border-[#EAEAEC] bg-white p-4 shadow-subtle space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] block">
              Requested Period
            </span>
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#1A1A1F] bg-[#F8F9FA] p-3 rounded-lg border border-[#EAEAEC]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#5B4FE9]" />
                <span>{request.startDate}</span>
              </div>
              <span className="text-[#9AA4AD]">→</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#5B4FE9]" />
                <span>{request.endDate}</span>
              </div>
            </div>
            {request.createdAt && (
              <p className="text-[10px] text-[#9AA4AD] text-right">
                Submitted on {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Medical Certificate Attachment (for Sick Leave) */}
          {request.attachmentUrl ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-bold text-blue-900">Medical Certificate Attached</p>
                    <p className="text-[10px] text-blue-700">Official medical practitioner certificate</p>
                  </div>
                </div>
                <a
                  href={`http://localhost:4000${request.attachmentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <span>View Doc</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : isSickLeave ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>No medical certificate attached to this sick leave request.</span>
            </div>
          ) : null}

          {/* Current Status State */}
          <div className="flex items-center justify-between border-t border-[#EAEAEC] pt-3">
            <span className="text-xs font-semibold text-[#6B6B76]">Current Decision Status:</span>
            <span
              className={`rounded-full px-3 py-1 font-bold text-[11px] ${
                request.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : request.status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {request.status}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="border-t border-[#EAEAEC] p-4 bg-[#FAFAFC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#EAEAEC] bg-white px-4 py-2 text-xs font-bold text-[#6B6B76] hover:bg-[#F4F4F6]"
          >
            Close
          </button>

          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction('Rejected')}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject Request</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction('Approved')}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve Leave</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-[#9AA4AD]">This request has been finalized.</span>
          )}
        </div>
      </div>
    </div>
  )
}
