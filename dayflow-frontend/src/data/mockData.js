// Shared mock data for UI development before the real API exists.
// This file is shared across all 4 modules — if you need a new field,
// add it here and mention it in the team chat so nobody's branch drifts
// out of sync with everyone else's shape for the same object.

export const currentUser = {
  id: 'emp-001',
  loginId: 'DF23JD0001',
  name: 'Jamie Doe',
  role: 'admin', // 'employee' | 'admin'  ← set to 'admin' to exercise admin views
  department: 'Engineering',
  email: 'jamie.doe@dayflow.dev',
  manager: 'Ravi Shankar',
  mobile: '+91 90000 00000',
  status: 'present', // 'present' | 'absent' | 'leave'
  about: 'Full-stack engineer with a passion for building great products.',
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  certifications: ['AWS Certified Developer', 'Google Cloud Associate'],
  interests: ['Open Source', 'System Design', 'Hiking']
}

export const employees = [
  { id: 'emp-001', name: 'Jamie Doe',   department: 'Engineering', status: 'present', avatar: null, email: 'jamie.doe@dayflow.dev',   mobile: '+91 90000 00000' },
  { id: 'emp-002', name: 'Alex Kumar',  department: 'Design',      status: 'leave',   avatar: null, email: 'alex.kumar@dayflow.dev',  mobile: '+91 90000 00001' },
  { id: 'emp-003', name: 'Priya Nair',  department: 'HR',          status: 'absent',  avatar: null, email: 'priya.nair@dayflow.dev',  mobile: '+91 90000 00002' },
  { id: 'emp-004', name: 'Sam Lee',     department: 'Engineering', status: 'present', avatar: null, email: 'sam.lee@dayflow.dev',     mobile: '+91 90000 00003' },
  { id: 'emp-005', name: 'Meera Iyer', department: 'Sales',       status: 'present', avatar: null, email: 'meera.iyer@dayflow.dev', mobile: '+91 90000 00004' },
  { id: 'emp-006', name: 'Dev Patel',  department: 'Engineering', status: 'absent',  avatar: null, email: 'dev.patel@dayflow.dev',  mobile: '+91 90000 00005' }
]

// § 5 — Salary Info, admin-only. Amounts are illustrative placeholders,
// see SKILL.md §5 before wiring real percentages.
// wageType / salaryType: exact valid values not confirmed — see SKILL.md §9.
export const salaryStructure = {
  wageType: 'Monthly',   // TODO(team): confirm enum values
  salaryType: 'Fixed',   // TODO(team): confirm enum values
  monthWage: 50000,
  yearWage: 600000,
  workingDaysPerWeek: 5,
  breakTimeHrs: 1,
  components: [
    { label: 'Basic Salary',          amount: 30000, percent: 60 },
    { label: 'House Rent Allowance',  amount: 15000, percent: 50 },
    { label: 'Standard Allowance',    amount: 4000,  percent: 8  },
    { label: 'Performance Bonus',     amount: 3000,  percent: 6  },
    { label: 'Leave Travel Allowance',amount: 2000,  percent: 4  },
    // Fixed Allowance listed in SKILL.md §5 — amount/% are placeholders
    { label: 'Fixed Allowance',       amount: 1000,  percent: 2  }
  ],
  // PF % and Professional Tax ₹ are NOT confirmed — see SKILL.md §9.
  // Store as named constants so they're a one-line fix when confirmed.
  pf: { employeePercent: 12, employerPercent: 12 },
  professionalTax: 200
}

// § 6 — Attendance
// Full month of Aug 2026 with realistic data for better calendar/table view
export const attendanceRecords = [
  { date: '2026-08-01', checkIn: '09:15', checkOut: '18:30', workHours: '09:15', extraHours: '01:15' },
  { date: '2026-08-04', checkIn: '09:32', checkOut: '18:41', workHours: '09:09', extraHours: '01:09' },
  { date: '2026-08-05', checkIn: '10:02', checkOut: '18:05', workHours: '08:03', extraHours: '00:03' },
  { date: '2026-08-06', checkIn: '09:00', checkOut: '18:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-07', checkIn: '09:45', checkOut: '17:30', workHours: '07:45', extraHours: '00:00' },
  { date: '2026-08-08', checkIn: '09:10', checkOut: '18:20', workHours: '09:10', extraHours: '01:10' },
  { date: '2026-08-11', checkIn: '09:30', checkOut: '18:30', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-12', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-13', checkIn: '09:05', checkOut: '17:50', workHours: '08:45', extraHours: '00:45' },
  { date: '2026-08-14', checkIn: '09:20', checkOut: '18:10', workHours: '08:50', extraHours: '00:50' },
  { date: '2026-08-18', checkIn: '09:00', checkOut: '18:00', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-19', checkIn: '09:30', checkOut: '18:30', workHours: '09:00', extraHours: '01:00' },
  { date: '2026-08-20', checkIn: '09:32', checkOut: '18:41', workHours: '09:09', extraHours: '01:09' },
  { date: '2026-08-21', checkIn: '10:02', checkOut: '19:05', workHours: '09:03', extraHours: '01:03' },
  { date: '2026-08-22', checkIn: '09:15', checkOut: null,    workHours: null,    extraHours: null    }
]

// § 7 — Time Off
export const timeOffTypes = ['Paid Time Off', 'Sick Leave', 'Unpaid Leave']

export const timeOffBalances = {
  'Paid Time Off': 24,
  'Sick Leave': 7,
  'Unpaid Leave': 0
}

export const leaveAllocations = [
  { id: 'emp-001', name: 'Jamie Doe',  paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-002', name: 'Alex Kumar', paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-003', name: 'Priya Nair', paidTimeOff: 20, sickLeave: 7, unpaidLeave: 2 },
  { id: 'emp-004', name: 'Sam Lee',    paidTimeOff: 24, sickLeave: 7, unpaidLeave: 0 },
  { id: 'emp-005', name: 'Meera Iyer',paidTimeOff: 24, sickLeave: 5, unpaidLeave: 0 },
  { id: 'emp-006', name: 'Dev Patel', paidTimeOff: 18, sickLeave: 7, unpaidLeave: 3 }
]

export const timeOffRequests = [
  { id: 'to-001', employee: 'Jamie Doe',  startDate: '2026-08-26', endDate: '2026-08-26', type: 'Paid Time Off', status: 'Pending',  daysRequested: 1 },
  { id: 'to-002', employee: 'Alex Kumar', startDate: '2026-08-15', endDate: '2026-08-16', type: 'Sick Leave',    status: 'Approved', daysRequested: 2 },
  { id: 'to-003', employee: 'Priya Nair', startDate: '2026-08-10', endDate: '2026-08-10', type: 'Unpaid Leave',  status: 'Rejected', daysRequested: 1 },
  { id: 'to-004', employee: 'Sam Lee',    startDate: '2026-09-01', endDate: '2026-09-05', type: 'Paid Time Off', status: 'Pending',  daysRequested: 5 }
]
