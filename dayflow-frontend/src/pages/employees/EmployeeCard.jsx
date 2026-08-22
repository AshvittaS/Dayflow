import { useNavigate } from 'react-router-dom'
import { MapPin, Mail, ArrowUpRight, Plane, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EmployeeCard({ employee, overrideStatus, isHighlighted }) {
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

  // Consistent Department Color System (Reused across cards and filter pills)
  const deptStyles = {
    Engineering: {
      bar: 'border-l-[#5B4FE9]',
      badge: 'bg-[#5B4FE9]/10 text-[#5B4FE9]',
      glow: 'hover:border-[#5B4FE9]/40'
    },
    Design: {
      bar: 'border-l-[#C026D3]',
      badge: 'bg-[#C026D3]/10 text-[#C026D3]',
      glow: 'hover:border-[#C026D3]/40'
    },
    HR: {
      bar: 'border-l-[#059669]',
      badge: 'bg-[#059669]/10 text-[#059669]',
      glow: 'hover:border-[#059669]/40'
    },
    Sales: {
      bar: 'border-l-[#D97706]',
      badge: 'bg-[#D97706]/10 text-[#D97706]',
      glow: 'hover:border-[#D97706]/40'
    },
    Administration: {
      bar: 'border-l-[#2563EB]',
      badge: 'bg-[#2563EB]/10 text-[#2563EB]',
      glow: 'hover:border-[#2563EB]/40'
    }
  }

  const deptTheme = deptStyles[employee?.department] || {
    bar: 'border-l-slate-400',
    badge: 'bg-slate-100 text-slate-700',
    glow: 'hover:border-slate-400'
  }

  // Soft gradient themes for avatar backgrounds
  const avatarThemes = [
    { from: 'from-[#EEEDFC]', to: 'to-[#E0DEF9]', text: 'text-[#4F46E5]' },
    { from: 'from-[#ECFDF5]', to: 'to-[#D1FAE5]', text: 'text-[#059669]' },
    { from: 'from-[#EFF6FF]', to: 'to-[#DBEAFE]', text: 'text-[#2563EB]' },
    { from: 'from-[#FFF7ED]', to: 'to-[#FFEDD5]', text: 'text-[#EA580C]' },
    { from: 'from-[#FDF4FF]', to: 'to-[#FAE8FF]', text: 'text-[#C026D3]' },
    { from: 'from-[#F0FDFA]', to: 'to-[#CCFBF1]', text: 'text-[#0D9488]' }
  ]

  const strId = String(employee?.id || '0')
  const charCode = strId.charCodeAt(strId.length - 1) || 0
  const theme = avatarThemes[charCode % avatarThemes.length]

  // Status configuration
  const statusStyles = {
    present: { label: 'Present', dot: 'bg-[#10B981]', ring: 'ring-[#10B981]/30' },
    leave: { label: 'On Leave', isLeave: true, ring: 'ring-[#3B82F6]/30' },
    absent: { label: 'Absent', dot: 'bg-[#F59E0B]', ring: 'ring-[#F59E0B]/30' }
  }
  const currentStatus = statusStyles[displayStatus] || statusStyles.absent

  return (
    <div
      id={`employee-card-${employee.id}`}
      onClick={() => navigate(`/profile/${employee.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/profile/${employee.id}`)
      }}
      className={`group relative flex flex-col justify-between rounded-2xl border border-l-[3.5px] p-5 text-left transition-all duration-200 ease-out cursor-pointer ${
        deptTheme.bar
      } ${
        isSelf
          ? 'bg-gradient-to-br from-[#5B4FE9]/[0.08] via-[#5B4FE9]/[0.02] to-white border-[#5B4FE9]/40 ring-1 ring-[#5B4FE9]/25 shadow-md'
          : 'bg-white border-[#EAEAEC] shadow-subtle hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.08)]'
      } ${deptTheme.glow} ${
        isHighlighted ? 'ring-2 ring-[#5B4FE9] -translate-y-1 shadow-lg' : ''
      } hover:-translate-y-1`}
    >
      {/* ── Top Row: Quiet metadata + Presence indicator ── */}
      <div className="flex items-center justify-between w-full">
        {isSelf ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5B4FE9] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Your Profile (Home Base)</span>
          </div>
        ) : (
          <span className="font-mono text-[10px] font-medium text-[#9AA4AD]">
            {employee?.loginId || `ID #${employee.id}`}
          </span>
        )}

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6B6B76]">
          {currentStatus.isLeave ? (
            <Plane className="h-3 w-3 text-[#3B82F6] fill-[#3B82F6]" />
          ) : (
            <span className={`h-2 w-2 rounded-full ${currentStatus.dot} ring-2 ${currentStatus.ring}`} />
          )}
          <span className="capitalize">{currentStatus.label}</span>
        </div>
      </div>

      {/* ── Center: Avatar + Name + Department Badge ── */}
      <div className="my-4 flex items-center gap-4">
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold shadow-sm ring-2 ring-white bg-gradient-to-b ${theme.from} ${theme.to} ${theme.text}`}
          style={{ width: '52px', height: '52px' }}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold tracking-tight text-[#1A1A1F] truncate group-hover:text-[#5B4FE9] transition-colors">
            {employee?.name}
          </h3>
          <p className="text-xs text-[#6B6B76] truncate font-medium mt-0.5">
            {employee?.title || employee?.department}
          </p>
          <span
            className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${deptTheme.badge}`}
          >
            {employee?.department}
          </span>
        </div>
      </div>

      {/* ── Footer: Hairline divider + Quick info + Hover Affordance ── */}
      <div className="border-t border-[#F1F1F4] pt-3 flex items-center justify-between text-[11px] text-[#6B6B76]">
        <div className="flex items-center gap-1.5 truncate max-w-[55%]">
          <MapPin className="h-3 w-3 text-[#9AA4AD] shrink-0" />
          <span className="truncate">{employee?.location ? employee.location.split(',')[0] : 'Bengaluru'}</span>
        </div>

        {/* Hover-revealed "View Profile →" link */}
        <div className="flex items-center gap-1 font-bold text-xs text-[#5B4FE9] opacity-80 group-hover:opacity-100 transition-all">
          <span className="group-hover:underline">View</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  )
}
