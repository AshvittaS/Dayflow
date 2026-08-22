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

  // Harmonious, desaturated background & text colors for avatars
  const avatarThemes = [
    { bg: 'bg-[#EEEDFC]', text: 'text-[#5B4FE9]' }, // Indigo
    { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' }, // Emerald
    { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' }, // Blue
    { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]' }, // Warm Orange
    { bg: 'bg-[#FDF4FF]', text: 'text-[#C026D3]' }, // Fuchsia
    { bg: 'bg-[#F0FDFA]', text: 'text-[#0D9488]' }  // Teal
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
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 text-left transition-all duration-200 cursor-pointer ${
        isSelf
          ? 'border-[#5B4FE9]/30 ring-1 ring-[#5B4FE9]/20 shadow-[0_2px_8px_rgba(91,79,233,0.06)]'
          : 'border-[#EAEAEC] shadow-subtle'
      } hover:-translate-y-1 hover:border-[#5B4FE9]/50 hover:shadow-[0_12px_24px_-6px_rgba(91,79,233,0.1),0_4px_8px_-4px_rgba(0,0,0,0.03)]`}
    >
      {/* Top row: Self tag (if current user) + pinned status indicator */}
      <div className="flex items-center justify-between w-full">
        {isSelf ? (
          <span className="inline-flex items-center rounded-full bg-[#5B4FE9]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5B4FE9]">
            You
          </span>
        ) : (
          <span className="font-mono text-[10px] text-[#92929D]">{employee?.loginId}</span>
        )}

        {/* Pinned status indicator in top-right */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#F8F9FA] border border-[#EAEAEC] px-2 py-0.5">
          <StatusDot status={displayStatus} size="sm" />
          <span className="text-[10px] font-medium text-[#6B6B76] capitalize">
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

        <h3 className="mt-3 text-sm font-bold text-[#1A1A1F] group-hover:text-[#5B4FE9] transition-colors">
          {employee?.name}
        </h3>
        <p className="text-xs font-medium text-[#6B6B76]">
          {employee?.title || employee?.department}
        </p>
        <span className="mt-1 text-[11px] text-[#92929D]">
          {employee?.department}
        </span>
      </div>

      {/* Card footer: Quick metadata (location & email) */}
      <div className="mt-2 border-t border-[#F1F1F4] pt-3 flex items-center justify-between text-[11px] text-[#6B6B76]">
        <div className="flex items-center gap-1 truncate max-w-[55%]">
          <MapPin className="h-3 w-3 text-[#92929D] shrink-0" />
          <span className="truncate">{employee?.location ? employee.location.split(',')[0] : 'Office'}</span>
        </div>
        <div className="flex items-center gap-1 truncate max-w-[45%]">
          <Mail className="h-3 w-3 text-[#92929D] shrink-0" />
          <span className="truncate">{employee?.email ? employee.email.split('@')[0] : ''}</span>
        </div>
      </div>
    </div>
  )
}
