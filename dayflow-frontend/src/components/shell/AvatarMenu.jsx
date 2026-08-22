import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusDot from '../ui/StatusDot.jsx'

// § 2 — avatar click opens dropdown: My Profile, Log Out
export default function AvatarMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent"
      >
        {user.name.split(' ').map((n) => n[0]).join('')}
        <span className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={user.status} />
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-base-border bg-base-panel py-1 shadow-xl">
          <button
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-base-card"
          >
            My Profile
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/signin') }}
            className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-base-card"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
