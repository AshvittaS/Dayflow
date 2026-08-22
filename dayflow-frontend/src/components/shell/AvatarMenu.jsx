import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusDot from '../ui/StatusDot.jsx'

export default function AvatarMenu({ user, overrideStatus }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const currentStatus = overrideStatus ?? user?.status ?? 'absent'

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('')
    : '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User profile menu"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-xs font-semibold text-[#5B4FE9] ring-1 ring-[#5B4FE9]/25 transition hover:ring-[#5B4FE9]/50 hover:bg-[#5B4FE9]/15"
      >
        {initials}
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={currentStatus} size="sm" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-base-border bg-base-panel p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User brief header */}
          <div className="border-b border-base-border px-3 py-2.5">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 w-fit px-1.5 py-0.5 rounded">
              <ShieldCheck className="h-3 w-3" />
              <span>{user?.role === 'admin' ? 'HR Admin' : 'Employee'}</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                setOpen(false)
                navigate('/profile')
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-300 transition hover:bg-base-card hover:text-white"
            >
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => {
                setOpen(false)
                signOut()
                navigate('/signin')
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
