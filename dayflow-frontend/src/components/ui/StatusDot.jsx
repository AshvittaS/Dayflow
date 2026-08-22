import { Plane } from 'lucide-react'

// § 3 — Status indicator:
// - 🟢 green dot = present in office
// - ✈️ airplane glyph = on approved leave
// - 🟡 amber dot = absent, no leave applied
export default function StatusDot({ status, size = 'md', showLabel = false }) {
  if (status === 'leave') {
    return (
      <span
        title="On Approved Leave"
        className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-2 ring-white"
        style={{
          width: size === 'lg' ? '20px' : size === 'sm' ? '12px' : '16px',
          height: size === 'lg' ? '20px' : size === 'sm' ? '12px' : '16px'
        }}
      >
        <Plane className={`${size === 'lg' ? 'h-3 w-3' : size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'} text-slate-500 fill-slate-500`} />
      </span>
    )
  }

  const isPresent = status === 'present'
  const dotColor = isPresent ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
  const pulseRing = isPresent ? 'ring-2 ring-white shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'ring-2 ring-white shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
  const label = isPresent ? 'Present' : 'Absent'

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5'
  }

  if (showLabel) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B76]">
        <span className={`inline-block rounded-full ${dotColor} ${sizeClasses[size] || sizeClasses.md}`} />
        {label}
      </span>
    )
  }

  return (
    <span
      title={label}
      className={`inline-block rounded-full ${dotColor} ${pulseRing} ${sizeClasses[size] || sizeClasses.md}`}
    />
  )
}
