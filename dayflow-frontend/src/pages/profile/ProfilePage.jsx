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

// High-quality stock portrait headshots mapped by employee ID
const DEFAULT_AVATARS = {
  '1': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  '2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  '3': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  '4': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  '5': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  '6': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'DF26JD0001': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'DF26AK0002': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Resume')
  const [imgError, setImgError] = useState(false)

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

  const photoUrl =
    viewedEmployee?.avatar ||
    DEFAULT_AVATARS[String(viewedEmployee?.id)] ||
    DEFAULT_AVATARS[viewedEmployee?.loginId]

  const initials = viewedEmployee.name
    ? viewedEmployee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : '?'

  return (
    <div className="space-y-6">
      {/* ── Top Navigation Bar: Back link ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="group inline-flex items-center gap-2 text-xs font-bold text-[#6B6B76] transition hover:text-[#5B4FE9]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Directory</span>
        </button>

        {!isOwnProfile && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEAEC] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6B76] shadow-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9AA4AD]" />
            View-only Mode
          </span>
        )}
      </div>

      {/* ── Asymmetric Two-Column Profile Structure ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left Column: Sticky Identity Dossier (Avatar, Name, Quick Contacts) ── */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle text-center flex flex-col items-center">
            {/* Real Profile Photo with Status Indicator & Fallback */}
            <div className="relative mb-4">
              <div
                className="relative flex items-center justify-center rounded-full overflow-hidden ring-4 ring-[#F8F9FA] shadow-md mx-auto"
                style={{ width: '84px', height: '84px' }}
              >
                {photoUrl && !imgError ? (
                  <img
                    src={photoUrl}
                    alt={viewedEmployee?.name || 'Profile photo'}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-[#4F46E5] bg-gradient-to-b from-[#EEEDFC] to-[#E0DEF9]">
                    {initials}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0">
                <StatusDot status={viewedEmployee.status || 'absent'} size="lg" />
              </span>
            </div>

            <h1 className="text-xl font-extrabold tracking-tight text-[#1A1A1F]">
              {viewedEmployee.name}
            </h1>
            <p className="text-xs font-bold text-[#5B4FE9] mt-0.5">
              {viewedEmployee.title || viewedEmployee.department || 'Employee'}
            </p>

            <span className="mt-2 font-mono text-[10px] font-bold bg-[#F8F9FA] border border-[#EAEAEC] rounded-md px-2.5 py-0.5 text-[#6B6B76]">
              Login ID: {viewedEmployee.loginId || '—'}
            </span>

            <div className="w-full border-t border-[#F1F1F4] my-4" />

            {/* Quick Contact & Details */}
            <div className="w-full space-y-2 text-left text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F9FA]">
                <Briefcase className="h-4 w-4 text-[#9AA4AD] shrink-0" />
                <span className="text-[#1A1A1F] font-semibold truncate">
                  {viewedEmployee.department || 'General'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F9FA]">
                <MapPin className="h-4 w-4 text-[#9AA4AD] shrink-0" />
                <span className="text-[#1A1A1F] font-semibold truncate">
                  {viewedEmployee.location || 'Bengaluru, India'}
                </span>
              </div>

              {viewedEmployee.email && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F9FA]">
                  <Mail className="h-4 w-4 text-[#5B4FE9] shrink-0" />
                  <span className="text-[#1A1A1F] font-medium truncate">
                    {viewedEmployee.email}
                  </span>
                </div>
              )}

              {viewedEmployee.mobile && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8F9FA]">
                  <Phone className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span className="text-[#1A1A1F] font-medium truncate">
                    {viewedEmployee.mobile}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Tab Navigation & Content ── */}
        <div className="flex-1 min-w-0 space-y-5 w-full">
          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#EAEAEC] bg-white p-1.5 shadow-subtle">
            {visibleTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-150 ${
                  activeTab === t
                    ? 'bg-[#5B4FE9] text-white shadow-[0_2px_8px_rgba(91,79,233,0.3)]'
                    : 'text-[#6B6B76] hover:bg-[#F4F4F6] hover:text-[#1A1A1F]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Tab 1: Resume View ── */}
          {activeTab === 'Resume' && (
            <div className="space-y-5">
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
            <div className="space-y-5">
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
      </div>
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
