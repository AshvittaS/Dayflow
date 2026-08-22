import { useNavigate } from 'react-router-dom'
import StatusDot from '../../components/ui/StatusDot.jsx'

// § 3 — cards are clickable → opens that employee's profile in view-only mode.
// overrideStatus: optional live status pushed by the parent (e.g. after check-in).
export default function EmployeeCard({ employee, overrideStatus }) {
  const navigate = useNavigate()
  const displayStatus = overrideStatus ?? employee.status

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  // Pick a deterministic accent shade from the employee id for variety
  const avatarColors = [
    'bg-violet-500/20 text-violet-300',
    'bg-blue-500/20 text-blue-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-pink-500/20 text-pink-300',
    'bg-amber-500/20 text-amber-300',
  ]
  const idNum = parseInt(String(employee?.id || '0').replace(/\D/g, '') || '0', 10)
  const colorClass = avatarColors[idNum % avatarColors.length]

  return (
    <button
      onClick={() => navigate(`/profile/${employee.id}`)}
      className="group relative flex flex-col items-center gap-3 rounded-xl border border-base-border bg-base-card p-5 text-left transition duration-200 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5"
    >
      {/* Status indicator — top-right (§3) */}
      <span className="absolute right-3 top-3">
        <StatusDot status={displayStatus} />
      </span>

      {/* Avatar */}
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${colorClass}`}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
          {employee.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{employee.department}</p>
      </div>
    </button>
  )
}
