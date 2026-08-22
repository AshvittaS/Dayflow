import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  Award,
  Heart,
  Calendar,
  CreditCard,
  Briefcase
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useEmployee } from '../../hooks/useEmployees.js'
import StatusDot from '../../components/ui/StatusDot.jsx'
import SalaryInfoTab from './SalaryInfoTab.jsx'

const ALL_TABS = ['Resume', 'Private Info', 'Salary Info']

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Resume')

  const isOwnProfile = !id || String(id) === String(currentUser?.employeeId)
  const empId = isOwnProfile ? currentUser?.employeeId : id
  const { employee: viewedEmployee, loading, error } = useEmployee(empId)

  const isAdmin = currentUser?.role === 'admin'
  const visibleTabs = isAdmin ? ALL_TABS : ALL_TABS.filter((t) => t !== 'Salary Info')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B4FE9] border-t-transparent" />
      </div>
    )
  }

  if (error || !viewedEmployee) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAEAEC] bg-white py-32 text-center shadow-subtle">
        <p className="text-sm font-bold text-[#1A1A1F]">Employee record not found</p>
        <p className="mt-1 text-xs text-[#6B6B76]">The requested profile ID does not exist or has been archived.</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#5B4FE9] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#4A3EC8]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </button>
      </div>
    )
  }

  const initials = viewedEmployee.name
    ? viewedEmployee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : '?'

  return (
    <div className="space-y-6">
      {/* ── Top Navigation Bar: Back link & Mode indicator ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="group inline-flex items-center gap-2 text-xs font-bold text-[#6B6B76] transition hover:text-[#5B4FE9]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Employees</span>
        </button>

        {!isOwnProfile && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEC] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6B76] shadow-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9AA4AD]" />
            View-only Mode
          </span>
        )}
      </div>

      {/* ── Profile Header Block ── */}
      <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar with Status indicator */}
            <div className="relative self-start sm:self-auto">
              <div
                className="flex items-center justify-center rounded-full text-2xl font-extrabold text-[#4F46E5] bg-gradient-to-b from-[#EEEDFC] to-[#E0DEF9] ring-4 ring-[#F8F9FA] shadow-md"
                style={{ width: '76px', height: '76px' }}
              >
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1">
                <StatusDot status={viewedEmployee.status || 'absent'} size="lg" />
              </span>
            </div>

            {/* Core Identity */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1F]">
                  {viewedEmployee.name}
                </h1>
                <span className="font-mono text-xs font-semibold bg-[#F8F9FA] border border-[#EAEAEC] rounded-lg px-2.5 py-0.5 text-[#6B6B76]">
                  Login ID: {viewedEmployee.loginId || '—'}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#5B4FE9]">
                {viewedEmployee.title || viewedEmployee.department || 'Employee'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-[#6B6B76] font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#9AA4AD]" />
                  {viewedEmployee.department || 'General'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#9AA4AD]" />
                  {viewedEmployee.location || 'Office'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="flex flex-col gap-2 self-start sm:self-auto sm:items-end text-xs text-[#6B6B76]">
            {viewedEmployee.email && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#F8F9FA] border border-[#EAEAEC] px-3.5 py-1.5 font-medium text-[#1A1A1F]">
                <Mail className="h-3.5 w-3.5 text-[#5B4FE9]" />
                {viewedEmployee.email}
              </span>
            )}
            {viewedEmployee.mobile && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#F8F9FA] border border-[#EAEAEC] px-3.5 py-1.5 font-medium text-[#1A1A1F]">
                <Phone className="h-3.5 w-3.5 text-[#10B981]" />
                {viewedEmployee.mobile}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-[#EAEAEC] pb-px">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`relative px-4 py-3 text-xs font-bold tracking-wide transition-all ${
              activeTab === t
                ? 'text-[#5B4FE9]'
                : 'text-[#6B6B76] hover:text-[#1A1A1F]'
            }`}
          >
            {t}
            {activeTab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#5B4FE9]" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Resume View (Default) ── */}
      {activeTab === 'Resume' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
              Organizational Overview
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Full Name" value={viewedEmployee.name} icon={User} />
              <InfoTile label="Company" value="Dayflow Inc." icon={Building} />
              <InfoTile label="Login ID" value={viewedEmployee.loginId || '—'} isMono icon={Shield} />
              <InfoTile label="Department" value={viewedEmployee.department} icon={Briefcase} />
              <InfoTile label="Work Email" value={viewedEmployee.email || '—'} icon={Mail} />
              <InfoTile label="Reporting Manager" value={viewedEmployee.manager || '—'} icon={User} />
            </div>
          </div>

          {/* About Block */}
          {viewedEmployee.about && (
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                About
              </h3>
              <p className="mt-2.5 text-xs text-[#1A1A1F] leading-relaxed font-normal">
                {viewedEmployee.about}
              </p>
            </div>
          )}

          {/* Skills Block */}
          {viewedEmployee.skills?.length > 0 && (
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                Skills & Competencies
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {viewedEmployee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-[#5B4FE9]/10 border border-[#5B4FE9]/20 px-3 py-1 text-xs font-semibold text-[#5B4FE9]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Interests Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {viewedEmployee.certifications?.length > 0 && (
              <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#5B4FE9]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                    Certifications
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-[#1A1A1F]">
                  {viewedEmployee.certifications.map((cert) => (
                    <li key={cert} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5B4FE9]" />
                      <span className="font-semibold">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewedEmployee.interests?.length > 0 && (
              <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                    Interests & Hobbies
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {viewedEmployee.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] px-3 py-1 text-xs font-medium text-[#6B6B76]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Private Info View ── */}
      {activeTab === 'Private Info' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
              Personal Contact & Identification
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Mobile Number" value={viewedEmployee.mobile || '—'} icon={Phone} />
              <InfoTile label="Personal Email" value={viewedEmployee.email || '—'} icon={Mail} />
              <InfoTile label="Date of Birth" value={viewedEmployee.dateOfBirth || '14 May 1994'} icon={Calendar} />
              <InfoTile label="Gender" value={viewedEmployee.gender || 'Not specified'} icon={User} />
              <InfoTile label="Department" value={viewedEmployee.department} icon={Briefcase} />
              <InfoTile label="Reporting Manager" value={viewedEmployee.manager || '—'} icon={User} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#5B4FE9]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                  Residential Address
                </h3>
              </div>
              <p className="mt-3 text-xs text-[#1A1A1F] leading-relaxed font-normal">
                {viewedEmployee.address || 'Dayflow Corporate Campus, Indiranagar, Bengaluru, Karnataka, 560038'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#5B4FE9]" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6B6B76]">
                  Salary Account Details
                </h3>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-[#1A1A1F]">
                <p className="font-mono">Account: •••• •••• •••• 4921</p>
                <p className="font-medium">Bank: HDFC Bank</p>
                <p className="font-mono text-[#6B6B76]">IFSC: HDFC0001234</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Salary Info (Admin-Only View) ── */}
      {activeTab === 'Salary Info' && isAdmin && <SalaryInfoTab employeeId={empId} />}
    </div>
  )
}

function InfoTile({ label, value, isMono, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8F9FA] text-[#6B6B76] shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B76]">{label}</p>
        <p
          className={`mt-0.5 truncate text-xs font-bold text-[#1A1A1F] ${
            isMono ? 'font-mono' : ''
          }`}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  )
}
