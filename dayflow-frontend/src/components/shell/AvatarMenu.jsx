import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import StatusDot from '../ui/StatusDot.jsx'

export default function AvatarMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent"
      >
        {initials}
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={user?.status || 'absent'} />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-base-border bg-base-panel py-1 shadow-xl">
          <div className="border-b border-base-border px-4 py-2">
            <p className="text-xs font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-base-card"
          >
            My Profile
          </button>
          <button
            onClick={() => { setOpen(false); signOut(); navigate('/signin') }}
            className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-base-card"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
