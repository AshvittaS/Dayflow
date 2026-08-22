import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import AvatarMenu from './AvatarMenu.jsx'

const links = [
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/timeoff', label: 'Time Off' }
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-base-border bg-base-panel/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <button aria-label="Go to Employees dashboard" onClick={() => navigate('/employees')} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20 ring-1 ring-accent/40">
            <span className="text-xs font-bold text-accent">D</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-white">Day<span className="text-accent">flow</span></span>
        </button>

        <nav className="flex gap-1" aria-label="Main navigation">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-accent/15 text-accent' : 'text-slate-400 hover:bg-base-card hover:text-white'}`
              }>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-base-card hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-base-panel" />
        </button>
        {user && <AvatarMenu user={user} />}
      </div>
    </header>
  )
}
