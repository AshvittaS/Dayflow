import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { currentUser, employees } from '../../data/mockData.js'
import SalaryInfoTab from './SalaryInfoTab.jsx'

const ALL_TABS = ['Resume', 'Private Info', 'Salary Info']

// § 4 — Profile page with three tabs: Resume | Private Info | Salary Info
// Salary Info is admin-only (§4 / §5).
// Viewing another employee's profile opens in view-only mode (§3).
export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Resume')

  const isOwnProfile = !id || id === currentUser.id
  const viewedEmployee = isOwnProfile
    ? currentUser
    : employees.find((e) => e.id === id) ?? null

  // If no employee found for the given id, show a friendly error
  if (!viewedEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm font-medium text-slate-400">Employee not found.</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 text-xs text-accent hover:underline"
        >
          ← Back to Employees
        </button>
      </div>
    )
  }

  // § 4 — Salary Info tab is Admin-only
  const isAdmin = currentUser.role === 'admin'
  const visibleTabs = isAdmin ? ALL_TABS : ALL_TABS.filter((t) => t !== 'Salary Info')

  const initials = viewedEmployee.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div>
      {/* Back link when browsing another employee's profile */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate('/employees')}
          className="mb-5 flex items-center gap-1 text-xs text-slate-500 hover:text-accent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Employees
        </button>
      )}

      {/* Profile header */}
      <div className="mb-6 flex flex-wrap items-end gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent ring-4 ring-base-panel">
            {initials}
          </div>
          {/* Status dot on the avatar */}
          <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-base-bg">
            {viewedEmployee.status === 'leave' ? (
              <span title="On leave" className="block text-center text-xs leading-none">✈️</span>
            ) : (
              <span
                title={viewedEmployee.status}
                className={`block h-full w-full rounded-full ${
                  viewedEmployee.status === 'present' ? 'bg-status-present' : 'bg-status-absent'
                }`}
              />
            )}
          </span>
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{viewedEmployee.name}</h1>
          <p className="text-sm text-slate-400">{viewedEmployee.department}</p>
          {viewedEmployee.loginId && (
            <p className="mt-0.5 text-xs text-slate-600">ID: {viewedEmployee.loginId}</p>
          )}
        </div>

        {/* View-only banner — inline, less intrusive */}
        {!isOwnProfile && (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            View-only mode
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-0 border-b border-base-border">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-b-2 border-accent text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Resume Tab ── */}
      {tab === 'Resume' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"   value={viewedEmployee.name} />
            <Field label="Company"     value="Dayflow Inc." />
            <Field label="Login ID"    value={viewedEmployee.loginId ?? '—'} />
            <Field label="Department"  value={viewedEmployee.department} />
            <Field label="Email"       value={viewedEmployee.email ?? '—'} />
            <Field label="Manager"     value={viewedEmployee.manager ?? '—'} />
          </div>

          {/* About */}
          {viewedEmployee.about && (
            <Section title="About">
              <p className="text-sm text-slate-300 leading-relaxed">{viewedEmployee.about}</p>
            </Section>
          )}

          {/* Skills */}
          {viewedEmployee.skills?.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {viewedEmployee.skills.map((s) => (
                  <span key={s} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent border border-accent/20">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {viewedEmployee.certifications?.length > 0 && (
            <Section title="Certifications">
              <ul className="space-y-1.5">
                {viewedEmployee.certifications.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Interests */}
          {viewedEmployee.interests?.length > 0 && (
            <Section title="Interests">
              <div className="flex flex-wrap gap-2">
                {viewedEmployee.interests.map((i) => (
                  <span key={i} className="rounded-full border border-base-border bg-base-card px-3 py-1 text-xs text-slate-400">
                    {i}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ── Private Info Tab ── */}
      {tab === 'Private Info' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile"     value={viewedEmployee.mobile ?? '—'} />
          <Field label="Department" value={viewedEmployee.department} />
          <Field label="Email"      value={viewedEmployee.email ?? '—'} />
          <Field label="Manager"    value={viewedEmployee.manager ?? '—'} />
        </div>
      )}

      {/* ── Salary Info Tab (admin-only — guard is here AND in the tab list) ── */}
      {tab === 'Salary Info' && isAdmin && <SalaryInfoTab />}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-base-border bg-base-card p-4">
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </div>
  )
}
