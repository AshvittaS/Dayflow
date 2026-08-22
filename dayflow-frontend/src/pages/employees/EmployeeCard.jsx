import { useNavigate } from 'react-router-dom'
import { MapPin, Mail } from 'lucide-react'
import StatusDot from '../../components/ui/StatusDot.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EmployeeCard({ employee, overrideStatus }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayStatus = overrideStatus ?? employee?.status ?? 'absent'
  const isSelf = String(employee?.id) === String(user?.employeeId)

  const initials = employee?.name
    ? employee.name.split(' ').map((n) => n[0]).join('')
    : '?'

  // Harmonious background & text colors for avatars
  const avatarThemes = [
    { bg: 'bg-[#5B4FE9]/15', text: 'text-accent' },
    { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    { bg: 'bg-orange-500/15', text: 'text-orange-400' },
    { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
    { bg: 'bg-teal-500/15', text: 'text-teal-400' }
  ]

  const strId = String(employee?.id || '0')
  const charCode = strId.charCodeAt(strId.length - 1) || 0
  const theme = avatarThemes[charCode % avatarThemes.length]

  return (
    <div
      onClick={() => navigate(`/profile/${employee.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/profile/${employee.id}`)
        }
      }}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-base-card p-5 text-left transition-all duration-200 cursor-pointer ${
        isSelf
          ? 'border-accent/40 ring-1 ring-accent/30 shadow-md shadow-accent/10'
          : 'border-base-border'
      } hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10`}
    >
      {/* Top row: Self tag (if current user) + pinned status indicator */}
      <div className="flex items-center justify-between w-full">
        {isSelf ? (
          <span className="inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
            You
          </span>
        ) : (
          <span className="font-mono text-[10px] text-slate-400">{employee?.loginId}</span>
        )}

        {/* Pinned status indicator in top-right */}
        <div className="flex items-center gap-1.5 rounded-full bg-base-panel border border-base-border px-2 py-0.5">
          <StatusDot status={displayStatus} size="sm" />
          <span className="text-[10px] font-medium text-slate-400 capitalize">
            {displayStatus === 'leave' ? 'On Leave' : displayStatus}
          </span>
        </div>
      </div>

      {/* Main card body: Avatar + Name + Role/Dept */}
      <div className="my-3 flex flex-col items-center text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-base font-bold shadow-sm transition group-hover:scale-105 ${theme.bg} ${theme.text}`}
        >
          {initials}
        </div>

        <h3 className="mt-3 text-sm font-bold text-white group-hover:text-accent transition-colors">
          {employee?.name}
        </h3>
        <p className="text-xs font-medium text-slate-400">
          {employee?.title || employee?.department}
        </p>
        <span className="mt-1 text-[11px] text-slate-400">
          {employee?.department}
        </span>
      </div>

      {/* Card footer: Quick metadata (location & email) */}
      <div className="mt-2 border-t border-base-border pt-3 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1 truncate max-w-[55%]">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{employee?.location ? employee.location.split(',')[0] : 'Office'}</span>
        </div>
        <div className="flex items-center gap-1 truncate max-w-[45%]">
          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{employee?.email ? employee.email.split('@')[0] : ''}</span>
        </div>
      </div>
    </div>
  )
}
