import { useNavigate } from 'react-router-dom'
import { MapPin, Mail, Plane } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EmployeeCard({ employee, overrideStatus }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayStatus = overrideStatus ?? employee?.status ?? 'absent'
  const isSelf = String(employee?.id) === String(user?.employeeId)

  const initials = employee?.name
    ? employee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : '?'

  // Soft gradient themes for avatar backgrounds with white ring & shadow
  const avatarThemes = [
    { from: 'from-[#EEEDFC]', to: 'to-[#E0DEF9]', text: 'text-[#4F46E5]' }, // Indigo
    { from: 'from-[#ECFDF5]', to: 'to-[#D1FAE5]', text: 'text-[#059669]' }, // Emerald
    { from: 'from-[#EFF6FF]', to: 'to-[#DBEAFE]', text: 'text-[#2563EB]' }, // Blue
    { from: 'from-[#FFF7ED]', to: 'to-[#FFEDD5]', text: 'text-[#EA580C]' }, // Orange
    { from: 'from-[#FDF4FF]', to: 'to-[#FAE8FF]', text: 'text-[#C026D3]' }, // Fuchsia
    { from: 'from-[#F0FDFA]', to: 'to-[#CCFBF1]', text: 'text-[#0D9488]' }  // Teal
  ]

  const strId = String(employee?.id || '0')
  const charCode = strId.charCodeAt(strId.length - 1) || 0
  const theme = avatarThemes[charCode % avatarThemes.length]

  // Rich semantic status badge styling
  const statusConfig = {
    present: {
      label: 'Present',
      bg: 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]/25',
      dot: 'bg-[#10B981]'
    },
    leave: {
      label: 'On Leave',
      bg: 'bg-[#EFF6FF] text-[#1E40AF] border-[#3B82F6]/25',
      dot: 'bg-[#3B82F6]',
      isLeave: true
    },
    absent: {
      label: 'Absent',
      bg: 'bg-[#FFFBEB] text-[#92400E] border-[#F59E0B]/25',
      dot: 'bg-[#F59E0B]'
    }
  }

  const currentBadge = statusConfig[displayStatus] || statusConfig.absent

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
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ease-out cursor-pointer ${
        isSelf
          ? 'bg-gradient-to-b from-[#5B4FE9]/[0.02] to-white border-[#5B4FE9]/35 ring-1 ring-[#5B4FE9]/20 shadow-[0_4px_16px_rgba(91,79,233,0.08)] hover:shadow-[0_16px_32px_-8px_rgba(91,79,233,0.16)]'
          : 'bg-white border-[#EAEAEC] shadow-subtle hover:border-[#5B4FE9]/40 hover:shadow-[0_16px_32px_-8px_rgba(91,79,233,0.12),0_4px_8px_-4px_rgba(0,0,0,0.03)]'
      } hover:-translate-y-1`}
    >
      {/* ── Top Row: Monospace ID / Celebratory "You" tag + Semantic Status Pill ── */}
      <div className="flex items-center justify-between w-full">
        {isSelf ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#5B4FE9] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(91,79,233,0.35)]">
            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
            You
          </span>
        ) : (
          <span className="font-mono text-[10px] font-medium text-[#9AA4AD] tracking-wider">
            {employee?.loginId || `DF26#${employee.id}`}
          </span>
        )}

        {/* Softly tinted semantic status pill */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${currentBadge.bg}`}
        >
          {currentBadge.isLeave ? (
            <Plane className="h-2.5 w-2.5 text-[#3B82F6] fill-[#3B82F6]" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${currentBadge.dot}`} />
          )}
          <span>{currentBadge.label}</span>
        </div>
      </div>

      {/* ── Main Body: Avatar with gradient + 2-Line Name & Department ── */}
      <div className="my-4 flex flex-col items-center text-center">
        <div
          className={`flex h-15 w-15 items-center justify-center rounded-full text-base font-extrabold shadow-sm ring-4 ring-white transition-transform duration-200 group-hover:scale-105 bg-gradient-to-b ${theme.from} ${theme.to} ${theme.text}`}
          style={{ width: '58px', height: '58px' }}
        >
          {initials}
        </div>

        <h3 className="mt-3.5 text-[15px] font-bold tracking-tight text-[#1A1A1F] group-hover:text-[#5B4FE9] transition-colors">
          {employee?.name}
        </h3>
        <p className="mt-0.5 text-xs text-[#6B6B76] font-medium">
          {employee?.department || 'Operations'}
        </p>
      </div>

      {/* ── Card Footer: Full-width hairline + Location & Work Email ── */}
      <div className="border-t border-[#F1F1F4] pt-3 flex items-center justify-between text-[11px] text-[#6B6B76]">
        <div className="flex items-center gap-1.5 truncate max-w-[55%]">
          <MapPin className="h-3 w-3 text-[#9AA4AD] shrink-0" />
          <span className="truncate">{employee?.location ? employee.location.split(',')[0] : 'Bengaluru'}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate max-w-[45%] font-mono text-[10px] text-[#9AA4AD]">
          <Mail className="h-3 w-3 text-[#9AA4AD] shrink-0" />
          <span className="truncate">{employee?.email ? employee.email.split('@')[0] : ''}</span>
        </div>
      </div>
    </div>
  )
}
