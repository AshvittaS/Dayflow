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
import { currentUser, employees } from '../../data/mockData.js'
import StatusDot from '../../components/ui/StatusDot.jsx'
import SalaryInfoTab from './SalaryInfoTab.jsx'

const ALL_TABS = ['Resume', 'Private Info', 'Salary Info']

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Resume')

  const isOwnProfile = !id || id === currentUser.id
  const viewedEmployee = isOwnProfile
    ? currentUser
    : employees.find((e) => e.id === id) ?? null

  if (!viewedEmployee) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EAEAEC] bg-white py-32 text-center shadow-subtle">
        <p className="text-sm font-semibold text-[#1A1A1F]">Employee record not found</p>
        <p className="mt-1 text-xs text-[#6B6B76]">The requested profile ID does not exist or has been archived.</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5B4FE9] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4A3EC8]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
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
    <div className="space-y-6">
      {/* ── Top Navigation Bar: Back link & Mode indicator ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B76] transition hover:text-[#5B4FE9]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          <span>Back to Employees</span>
        </button>

        <span className="inline-flex items-center gap-1 rounded-full border border-[#EAEAEC] bg-white px-3 py-1 text-[11px] font-medium text-[#6B6B76] shadow-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-[#92929D]" />
          View-only Mode
        </span>
      </div>

      {/* ── Profile Header Block (View-Only) ── */}
      <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar with Status indicator */}
            <div className="relative self-start sm:self-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5B4FE9]/10 text-2xl font-bold text-[#5B4FE9] ring-4 ring-[#F8F9FA] shadow-sm">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1">
                <StatusDot status={viewedEmployee.status} size="lg" />
              </span>
            </div>

            {/* Core Identity */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1F]">
                  {viewedEmployee.name}
                </h1>
                <span className="font-mono text-xs font-semibold bg-[#F8F9FA] border border-[#EAEAEC] rounded-md px-2.5 py-0.5 text-[#6B6B76]">
                  Login ID: {viewedEmployee.loginId || 'DF23JD0001'}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#5B4FE9]">
                {viewedEmployee.title || viewedEmployee.department}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-[#6B6B76]">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-[#92929D]" />
                  {viewedEmployee.department}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#92929D]" />
                  {viewedEmployee.location || 'Bengaluru, India'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="flex flex-col gap-2 self-start sm:self-auto sm:items-end text-xs text-[#6B6B76]">
            {viewedEmployee.email && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEC] px-3 py-1.5 font-medium text-[#1A1A1F]">
                <Mail className="h-3.5 w-3.5 text-[#5B4FE9]" />
                {viewedEmployee.email}
              </span>
            )}
            {viewedEmployee.mobile && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8F9FA] border border-[#EAEAEC] px-3 py-1.5 font-medium text-[#1A1A1F]">
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
            className={`relative px-4 py-3 text-xs font-semibold tracking-wide transition-all ${
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
          {/* Two-Column Info Tiles */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              Organizational Overview
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Full Name" value={viewedEmployee.name} icon={User} />
              <InfoTile label="Company" value="Dayflow Inc." icon={Building} />
              <InfoTile label="Login ID" value={viewedEmployee.loginId || 'DF23JD0001'} isMono icon={Shield} />
              <InfoTile label="Department" value={viewedEmployee.department} icon={Briefcase} />
              <InfoTile label="Work Email" value={viewedEmployee.email || '—'} icon={Mail} />
              <InfoTile label="Reporting Manager" value={viewedEmployee.manager || 'Ravi Shankar'} icon={User} />
            </div>
          </div>

          {/* About Block */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              About
            </h3>
            <p className="mt-2.5 text-xs text-[#1A1A1F] leading-relaxed">
              {viewedEmployee.about ||
                'Full-stack software engineer specializing in frontend performance, design systems, and distributed system design.'}
            </p>
          </div>

          {/* Skills Block */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              Skills & Competencies
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(viewedEmployee.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS']).map(
                (skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-[#5B4FE9]/10 border border-[#5B4FE9]/20 px-3 py-1 text-xs font-medium text-[#5B4FE9]"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Certifications & Interests Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Certifications */}
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#5B4FE9]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                  Certifications
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#1A1A1F]">
                {(viewedEmployee.certifications || ['AWS Certified Solutions Architect', 'Google Cloud Architect']).map(
                  (cert) => (
                    <li key={cert} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#5B4FE9]" />
                      <span className="font-medium">{cert}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Interests */}
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                  Interests & Hobbies
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(viewedEmployee.interests || ['Open Source Tooling', 'System Design', 'Hiking']).map(
                  (interest) => (
                    <span
                      key={interest}
                      className="rounded-lg border border-[#EAEAEC] bg-[#F8F9FA] px-2.5 py-1 text-xs font-medium text-[#6B6B76]"
                    >
                      {interest}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Private Info View ── */}
      {activeTab === 'Private Info' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
              Personal Contact & Identification
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoTile label="Mobile Number" value={viewedEmployee.mobile || '+91 98450 12345'} icon={Phone} />
              <InfoTile label="Personal Email" value={viewedEmployee.email || 'jamie.doe@dayflow.dev'} icon={Mail} />
              <InfoTile label="Date of Birth" value={viewedEmployee.dateOfBirth || '14 May 1994'} icon={Calendar} />
              <InfoTile label="Gender" value={viewedEmployee.gender || 'Female'} icon={User} />
              <InfoTile label="Department" value={viewedEmployee.department} icon={Briefcase} />
              <InfoTile label="Reporting Manager" value={viewedEmployee.manager || 'Ravi Shankar'} icon={User} />
            </div>
          </div>

          {/* Residential Address & Emergency Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#5B4FE9]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                  Residential Address
                </h3>
              </div>
              <p className="mt-3 text-xs text-[#1A1A1F] leading-relaxed">
                {viewedEmployee.address || '402, Highrise Residency, Indiranagar, Bengaluru, Karnataka, 560038'}
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#10B981]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                  Emergency Contact
                </h3>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="font-semibold text-[#1A1A1F]">
                  {viewedEmployee.emergencyContact?.name || 'Sarah Doe'}
                </p>
                <p className="text-[#6B6B76]">
                  Relationship: {viewedEmployee.emergencyContact?.relation || 'Spouse'}
                </p>
                <p className="font-mono text-[#1A1A1F]">
                  Phone: {viewedEmployee.emergencyContact?.mobile || '+91 98450 98765'}
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Banking Details */}
          <div className="rounded-2xl border border-[#EAEAEC] bg-white p-6 shadow-subtle">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#5B4FE9]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76]">
                Salary Account Details
              </h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B76]">Account Number</p>
                <p className="mt-1 font-mono text-xs font-bold text-[#1A1A1F]">
                  {viewedEmployee.bankDetails?.accountNumber || '•••• •••• •••• 4921'}
                </p>
              </div>
              <div className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B76]">Bank Name</p>
                <p className="mt-1 text-xs font-bold text-[#1A1A1F]">
                  {viewedEmployee.bankDetails?.bankName || 'HDFC Bank'}
                </p>
              </div>
              <div className="rounded-xl border border-[#EAEAEC] bg-[#F8F9FA] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B76]">IFSC Code</p>
                <p className="mt-1 font-mono text-xs font-bold text-[#1A1A1F]">
                  {viewedEmployee.bankDetails?.ifsc || 'HDFC0001234'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Salary Info (Admin-Only View) ── */}
      {activeTab === 'Salary Info' && isAdmin && <SalaryInfoTab />}
    </div>
  )
}

function InfoTile({ label, value, isMono, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#EAEAEC] bg-white p-4 shadow-subtle">
      {Icon && (
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F8F9FA] text-[#6B6B76] shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76]">{label}</p>
        <p
          className={`mt-0.5 truncate text-xs font-semibold text-[#1A1A1F] ${
            isMono ? 'font-mono' : ''
          }`}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  )
}
